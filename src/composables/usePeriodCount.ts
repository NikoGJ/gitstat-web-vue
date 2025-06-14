import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { DateTime, type DurationUnit } from 'luxon'

/**
 * Returns the number of periods within a time range. Returns 1
 * if any of the arguments are empty.
 */
export function periodCount(
  start?: Date,
  end?: Date,
  timeUnit?: DurationUnit,
): number {
  let result = 1
  if (!(start && end && timeUnit)) {
    return result
  }
  const endDate = DateTime.fromJSDate(end)
  let period = DateTime.fromJSDate(start)
  do {
    result += 1
    period = period.plus({ [timeUnit]: 1 })
  } while (period <= endDate)
  return result
}

export function usePeriodCounts(
  start: MaybeRefOrGetter<Date>,
  end: MaybeRefOrGetter<Date>,
  timeUnit: MaybeRefOrGetter<DurationUnit>,
) {
  return {
    periods: computed(() =>
      periodCount(toValue(start), toValue(end), toValue(timeUnit)),
    ),
  }
}
