import { DateTime, type DateTimeUnit } from 'luxon'
import type { ChartData, Line } from '../types/charts'
import type {
  Aggregate,
  CommitAggregationFn,
  CommitGroup,
  ExtendedCommit,
} from '../types/commits'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { ColoredElement } from '../types/coloredElement'

// Above this threshold lines are grouped into "Others".
const MAX_DATA_POINTS = 2000

interface LinesView {
  lines: Line[]
  others: string[]
  hasNegatives: boolean
}

/**
 * Returns line data for a chart.js linegraph. Assumes commit groups
 * are ordered from hieghest to lowest
 */
export function useLines(
  groups: MaybeRefOrGetter<(ColoredElement & CommitGroup & Aggregate)[]>,
  aggregationFn: MaybeRefOrGetter<CommitAggregationFn>,
  timeUnit: MaybeRefOrGetter<DateTimeUnit>,
  start: MaybeRefOrGetter<Date>,
  end: MaybeRefOrGetter<Date>,
  accumulated: MaybeRefOrGetter<boolean>,
) {
  const ret = computed(() => {
    if (!(aggregationFn && start && end && timeUnit)) {
      return {
        lines: [],
        others: [],
        hasNegatives: false,
      }
    }

    const startDate = DateTime.fromJSDate(toValue(start))
    const endDate = DateTime.fromJSDate(toValue(end))
    const lineData = generateLineData(
      toValue(groups),
      toValue(aggregationFn),
      toValue(timeUnit),
      startDate,
      endDate,
      toValue(accumulated),
    )

    const result = hideTooManyDataPoints(
      lineData,
      toValue(timeUnit),
      startDate,
      endDate,
    )
    return {
      ...result,
      hasNegatives: result.lines.some((line) =>
        line.data.some((value): boolean => value.y < 0),
      ),
    }
  })
  return {
    lines: computed(() => ret.value.lines),
    hasNegatives: computed(() => ret.value.hasNegatives),
    others: computed(() => ret.value.others),
  }
}

/**
 * Generates the line chartdata for a given period. Zerofills any
 * dates for which no data is available.
 */
function generateLineData(
  groups: (ColoredElement & CommitGroup & Aggregate)[],
  aggregationFn: CommitAggregationFn,
  timeUnit: DateTimeUnit,
  startDate: DateTime,
  endDate: DateTime,
  accumulated: boolean,
): Line[] {
  return groups.map((group, _): Line => {
    let zeroFilled = zeroFillChartData(startDate, endDate, timeUnit)

    group.commits.forEach((commit: ExtendedCommit): void => {
      const beginOf = DateTime.fromISO(commit.committer.time)
        .startOf(timeUnit)
        .toJSDate()

      const item = zeroFilled.find(
        (elm): boolean => elm.x.getTime() === beginOf.getTime(),
      )
      item!.y += aggregationFn(commit) // item always exists because we zerofilled the whole period
    })

    if (accumulated) {
      zeroFilled = zeroFilled.reduce<ChartData[]>((acc, val) => {
        acc.push({ ...val, y: (acc.slice(-1).pop()?.y ?? 0) + val.y })
        return acc
      }, [])
    }

    return {
      label: group.name,
      data: zeroFilled,
      borderColor: group.borderColor,
      backgroundColor: group.backgroundColor,
    }
  })
}

/**
 * If there are too many datapoints performance will suffer, particularly
 * for the Chart.js hover animation. Group all lines into a single "Others"-line until
 * we're below the max datapoint threshold.
 */
function hideTooManyDataPoints(
  lines: Line[],
  timeUnit: DateTimeUnit,
  startDate: DateTime,
  endDate: DateTime,
): Pick<LinesView, 'lines' | 'others'> {
  let nrOfDataPoints = lines.reduce((acc, data) => acc + data.data.length, 0)
  const others: string[] = []
  if (lines.length > 1 && nrOfDataPoints > MAX_DATA_POINTS) {
    const zeroFilled = zeroFillChartData(startDate, endDate, timeUnit)

    let removedLine
    do {
      // eslint-disable-next-line prefer-destructuring
      removedLine = lines.splice(-1, 1)[0]
      nrOfDataPoints -= removedLine.data.length
      others.push(removedLine.label)
      removedLine.data.forEach((chartData) => {
        const item = zeroFilled.find(
          (elm): boolean => elm.x.getTime() === chartData.x.getTime(),
        )
        item!.y += chartData.y // item always exists because we zerofilled the whole period
      })
    } while (nrOfDataPoints > MAX_DATA_POINTS && lines.length > 0)

    // Add "Others" line as the last line in the dataset.
    // It copies the colors from the last line that was removed.
    lines.push({
      label: 'Others',
      data: zeroFilled,
      backgroundColor: removedLine.backgroundColor,
      borderColor: removedLine.borderColor,
    })
  }
  return { lines, others }
}

/**
 * Returns an array of chart data with time periods between the first
 * and last period with y-value 0.
 */
function zeroFillChartData(
  start: DateTime,
  end: DateTime,
  timeUnit: DateTimeUnit,
): ChartData[] {
  let period = start.startOf(timeUnit)
  const result: ChartData[] = []
  do {
    result.push({ x: period.toJSDate(), y: 0 })
    period = period.plus({ [timeUnit]: 1 })
  } while (period <= end.startOf(timeUnit))
  return result
}
