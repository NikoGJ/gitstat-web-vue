<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core'
import {
  useAggregationFn,
  AggregationFnType,
} from '../composables/useAggregationFn'
import { computed, watchEffect } from 'vue'
import {
  type ChartOptions,
  type InteractionMode,
  type TimeUnit,
  type TooltipItem,
} from 'chart.js'
import { useExtendedCommits } from '../composables/useExtendedCommits'
import { useLines } from '../composables/useLines'
import colorize from '../utils/colorize'
import { GroupByType } from '../types/commits'
import { periodCount, usePeriodCounts } from '../composables/usePeriodCount'
import { aggregateCommits } from '../utils/aggregateCommits'
import { useFilteredCommits } from '../composables/useFilteredCommits'
import { useGroupedCommits } from '../composables/useGroupedCommits'
import { useFirstCommitTimestamp } from '../composables/useCommits'
import { mix, parseToRgb } from 'polished'
import type { RgbaColor } from 'polished/lib/types/color'

const aggregate = useSessionStorage<AggregationFnType>(
  'graphs:aggregate',
  AggregationFnType.COMMITS,
)
const aggregationFn = useAggregationFn(aggregate)

const aggregateOptions = [
  { label: 'Commits', value: AggregationFnType.COMMITS },
  { label: 'Lines added + deleted', value: AggregationFnType.MUTATIONS },
  { label: 'Lines added - deleted', value: AggregationFnType.DIFF },
  { label: 'Lines added', value: AggregationFnType.ADDITIONS },
  { label: 'Lines deleted', value: AggregationFnType.DELETIONS },
]

interface SelectTimeUnitOption {
  label: string
  value: TimeUnit
}
const timeUnitOptions: SelectTimeUnitOption[] = [
  { label: 'per day', value: 'day' },
  { label: 'per week', value: 'week' },
  { label: 'per month', value: 'month' },
  { label: 'per year', value: 'year' },
]
const timeUnit = useSessionStorage<TimeUnit>('graphs:timeunit', 'year')

const groupByOptions = [
  { label: 'by author', value: GroupByType.AUTHOR },
  { label: 'by project', value: GroupByType.PROJECT },
  { label: 'by filetype', value: GroupByType.FILETYPE },
]
const groupBy = useSessionStorage<GroupByType>(
  'graphs:groupby',
  GroupByType.AUTHOR,
)

/**
 * Returns the time unit that is closest to a specified number of periods
 * between a given start & end date without exceeding it.
 */
const determineInitialTimeUnit = (
  startDate: Date,
  endDate: Date,
  maxPeriods = 100,
): TimeUnit => {
  let i = 0
  let initialTimeUnit = timeUnitOptions[i].value
  while (
    periodCount(startDate, endDate, initialTimeUnit) > maxPeriods &&
    i < timeUnitOptions.length - 1
  ) {
    i++
    initialTimeUnit = timeUnitOptions[i].value
  }
  return initialTimeUnit
}

const now = new Date()
const startDate = useSessionStorage<Date>('graphs:startdate', now)
const endDate = useSessionStorage<Date>('graphs:enddate', now)
const accumulated = useSessionStorage<boolean>('graphs:accumulated', false)

const commits = useExtendedCommits()

// Set initial values
const { minDate } = useFirstCommitTimestamp(commits)
watchEffect(() => {
  if (minDate.value && startDate.value === now) {
    startDate.value = minDate.value
    timeUnit.value = determineInitialTimeUnit(minDate.value, endDate.value)
  }
})

const { filteredCommits } = useFilteredCommits(commits, startDate, endDate)
const { groupedCommits } = useGroupedCommits(filteredCommits, groupBy)

// Add aggregation stats and colorize the groups
const { periods } = usePeriodCounts(startDate, endDate, timeUnit)
const aggregatedCommitGroups = computed(() =>
  aggregateCommits(groupedCommits.value, aggregationFn.value, periods.value),
)

// Colorize groups
const colorizedChartData = computed(() =>
  colorize(aggregatedCommitGroups.value),
)

const { lines, hasNegatives } = useLines(
  colorizedChartData,
  aggregationFn,
  timeUnit,
  startDate,
  endDate,
  accumulated,
)

const stacked = computed(() => !hasNegatives.value)
const chartData = computed(() => {
  return {
    datasets: lines.value.map(
      ({ label, data, borderColor, backgroundColor }, index) => ({
        label,
        data,
        fill: stacked.value && index === 0 ? 'origin' : undefined,
        borderWidth: 1,
        backgroundColor,
        borderColor,
        tension: 0.5,
      }),
    ),
  }
})
// Hide legend when there are more than X lines.
const HIDE_LEGEND_LINE_THRESHOLD = 20

// Hide tooltips labels that have value "0" when
// there are more than X lines.
const HIDE_EMPTY_TOOLTIP_LINE_THRESHOLD = 10

const chartOptions = computed(
  () =>
    ({
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
          fill: stacked ? ('-1' as any) : false,
        },
      },
      plugins: {
        legend: {
          display: lines.value.length < HIDE_LEGEND_LINE_THRESHOLD,
          labels: {
            fontColor: 'white',
          },
        },
        tooltip: {
          mode: 'index' as InteractionMode,
          intersect: false,
          itemSort: (
            a: TooltipItem<'line'>,
            b: TooltipItem<'line'>,
          ): number => {
            return a.label! > b.label! ? -1 : 1
          },
          filter: (item) =>
            lines.value.length < HIDE_EMPTY_TOOLTIP_LINE_THRESHOLD ||
            Number(item.formattedValue) !== 0,
          callbacks: {
            labelColor(tooltipItem) {
              const { borderColor, backgroundColor } = tooltipItem.dataset
              const rgba = parseToRgb(backgroundColor as string) as RgbaColor
              return {
                backgroundColor: mix(
                  1 - rgba.alpha,
                  backgroundColor as string,
                  '#0F0F0F',
                ),
                borderColor: borderColor as string,
              }
            },
          },
        },
      },
      backgroundColor: '#0F0F0F',
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            zeroLineColor: 'rgba(255, 255, 255, 0.1)',
          },
          type: 'time',
          time: {
            unit: timeUnit.value,
          },
        },
        y: {
          stacked: stacked.value,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          beginAtZero: true,
        },
      },
    } as ChartOptions),
)
</script>

<template>
  <h1>Graphs</h1>
  <div style="display: flex; align-items: center; gap: 0.3rem">
    <Select
      v-model="aggregate"
      :options="aggregateOptions"
      option-label="label"
      option-value="value"
      style="width: 14rem"
    />
    <div>
      <Checkbox
        binary
        v-model="accumulated"
        input-id="accumulated"
        style="margin-right: 0.5rem"
      />
      <label for="accumulated">Accumulated values</label>
    </div>
    <Select
      v-model="groupBy"
      :options="groupByOptions"
      option-label="label"
      option-value="value"
    />
    <Select
      v-model="timeUnit"
      :options="timeUnitOptions"
      option-label="label"
      option-value="value"
    />
    <DatePicker
      v-model="startDate"
      show-icon
      dateFormat="yy-mm-dd"
      icon-display="input"
      :show-button-bar="true"
      style="width: 10rem"
      placeholder="Start date"
    />
    <span>/</span>
    <DatePicker
      v-model="endDate"
      show-icon
      dateFormat="yy-mm-dd"
      icon-display="input"
      :show-button-bar="true"
      style="width: 10rem"
      placeholder="End date"
    />
  </div>

  <div class="charts">
    <Chart
      style="height: 30rem; grid-column: 1 / -1"
      type="line"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<style scoped>
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40rem, 1fr));
  grid-gap: 2rem;
  margin-top: 0.5rem;
}
</style>
