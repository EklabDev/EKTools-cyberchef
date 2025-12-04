import { DateTime } from 'luxon';

export function timestampToDatetime(timestamp: number | string, zone: string = 'UTC'): string {
  // timestamp can be seconds or millis. Heuristic: if > 1e11, millis.
  // CyberChef usually lets user specify units. We'll guess or standardize on millis.
  // Or input as string?
  let ts = Number(timestamp);
  if (isNaN(ts)) throw new Error('Invalid timestamp');
  
  // Heuristic for seconds vs millis
  // Year 2000 is 946684800 seconds. 946684800000 millis.
  // If small, treat as seconds.
  if (ts < 10000000000) {
    ts *= 1000;
  }
  
  return DateTime.fromMillis(ts).setZone(zone).toISO() || 'Invalid Date';
}

export function datetimeToTimestamp(datetime: string, zone: string = 'UTC'): string {
  // Input format? ISO is best.
  // Luxon is forgiving.
  const dt = DateTime.fromISO(datetime, { zone });
  if (!dt.isValid) {
      // Try SQL format or others?
      const dt2 = DateTime.fromSQL(datetime, { zone });
      if (dt2.isValid) return dt2.toMillis().toString();
      throw new Error('Invalid datetime format');
  }
  return dt.toMillis().toString();
}

export function timezoneConvert(datetime: string, fromZone: string, toZone: string): string {
    const dt = DateTime.fromISO(datetime, { zone: fromZone });
    if (!dt.isValid) throw new Error('Invalid datetime');
    return dt.setZone(toZone).toISO() || 'Error';
}

export function datetimeAdd(datetime: string, durationStr: string, zone: string = 'UTC'): string {
    // durationStr e.g. "3 days", "-2 hours"
    // Parse simple string or use ISO duration (P1D)
    // We'll support simple "amount unit" format
    
    const dt = DateTime.fromISO(datetime, { zone });
    if (!dt.isValid) throw new Error('Invalid datetime');
    
    const parts = durationStr.trim().split(/\s+/);
    if (parts.length < 2) throw new Error('Invalid duration format (e.g. "3 days")');
    
    const amount = parseFloat(parts[0]);
    const unit = parts[1].toLowerCase().replace(/s$/, ''); // simple de-pluralize
    
    // Luxon duration object
    const durObj: any = {};
    durObj[unit + 's'] = amount; // Luxon uses plural keys usually
    
    return dt.plus(durObj).toISO() || 'Error';
}

export function datetimeDiff(start: string, end: string, units: string[] = ['days', 'hours', 'minutes', 'seconds']): string {
    const d1 = DateTime.fromISO(start);
    const d2 = DateTime.fromISO(end);
    if (!d1.isValid || !d2.isValid) throw new Error('Invalid datetimes');
    
    const diff = d2.diff(d1, units as any); // units array
    return JSON.stringify(diff.toObject());
}

export function datetimeFormat(datetime: string, format: string, zone: string = 'UTC'): string {
    const dt = DateTime.fromISO(datetime, { zone });
    if (!dt.isValid) throw new Error('Invalid datetime');
    return dt.toFormat(format);
}


