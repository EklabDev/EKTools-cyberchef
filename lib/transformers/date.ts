import { DateTime } from 'luxon';
import { resolveFormat } from '../date-time/format-presets';
import { DURATION_UNITS, type DurationUnit } from '../date-time/units';

function parseWithFormat(input: string, format: string | undefined, zone: string): DateTime {
  if (format) {
    const resolved = resolveFormat(format);
    const dt = DateTime.fromFormat(input, resolved, { zone });
    if (dt.isValid) return dt;
    throw new Error(`Input does not match format "${resolved}"`);
  }
  const dt = DateTime.fromISO(input, { zone });
  if (dt.isValid) return dt;
  const dt2 = DateTime.fromSQL(input, { zone });
  if (dt2.isValid) return dt2;
  throw new Error('Invalid datetime format');
}

export function validateFormat(format: string): boolean {
  try {
    const resolved = resolveFormat(format);
    DateTime.now().toFormat(resolved);
    return true;
  } catch {
    return false;
  }
}

export function timestampToDatetime(
  timestamp: number | string,
  zone: string = 'UTC',
  inputUnit?: 'seconds' | 'milliseconds',
  outputFormat?: string,
): string {
  let ts = Number(timestamp);
  if (isNaN(ts)) throw new Error('Invalid timestamp');

  if (inputUnit === 'seconds') {
    ts *= 1000;
  } else if (inputUnit === 'milliseconds') {
    // already millis
  } else {
    if (ts < 10000000000) ts *= 1000;
  }

  const dt = DateTime.fromMillis(ts).setZone(zone);
  if (!dt.isValid) throw new Error('Invalid Date');

  if (outputFormat) {
    return dt.toFormat(resolveFormat(outputFormat));
  }
  return dt.toISO() || 'Invalid Date';
}

export function datetimeToTimestamp(
  datetime: string,
  zone: string = 'UTC',
  inputFormat?: string,
  outputUnit?: 'seconds' | 'milliseconds',
): string {
  const dt = parseWithFormat(datetime, inputFormat, zone);
  const millis = dt.toMillis();
  if (outputUnit === 'seconds') return Math.floor(millis / 1000).toString();
  return millis.toString();
}

export function timezoneConvert(datetime: string, fromZone: string, toZone: string): string {
  const dt = DateTime.fromISO(datetime, { zone: fromZone });
  if (!dt.isValid) throw new Error('Invalid datetime');
  return dt.setZone(toZone).toISO() || 'Error';
}

export function datetimeAdd(
  datetime: string,
  durationStr: string | undefined,
  zone: string = 'UTC',
  durationAmount?: number,
  durationUnit?: DurationUnit,
): string {
  const dt = DateTime.fromISO(datetime, { zone });
  if (!dt.isValid) throw new Error('Invalid datetime');

  if (durationAmount !== undefined && durationUnit) {
    if (!DURATION_UNITS.includes(durationUnit)) {
      throw new Error(`Invalid unit "${durationUnit}". Allowed: ${DURATION_UNITS.join(', ')}`);
    }
    return dt.plus({ [durationUnit]: durationAmount }).toISO() || 'Error';
  }

  if (!durationStr) throw new Error('Provide duration string or amount + unit');
  const parts = durationStr.trim().split(/\s+/);
  if (parts.length < 2) throw new Error('Invalid duration format (e.g. "3 days")');
  const amount = parseFloat(parts[0]);
  const unit = parts[1].toLowerCase().replace(/s$/, '');
  const durObj: Record<string, number> = {};
  durObj[unit + 's'] = amount;
  return dt.plus(durObj).toISO() || 'Error';
}

export function datetimeDiff(
  start: string,
  end: string,
  units: string[] = ['days', 'hours', 'minutes', 'seconds'],
): string {
  const d1 = DateTime.fromISO(start);
  const d2 = DateTime.fromISO(end);
  if (!d1.isValid || !d2.isValid) throw new Error('Invalid datetimes');
  const diff = d2.diff(d1, units as any);
  return JSON.stringify(diff.toObject());
}

export function datetimeFormat(
  datetime: string,
  format: string,
  zone: string = 'UTC',
  inputFormat?: string,
): string {
  const dt = parseWithFormat(datetime, inputFormat, zone);
  const resolved = resolveFormat(format);
  return dt.toFormat(resolved);
}
