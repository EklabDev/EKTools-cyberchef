export interface TimezoneEntry {
  code: string;
  name: string;
  iana: string;
}

export const TIMEZONES: TimezoneEntry[] = [
  { code: 'UTC',  name: 'Coordinated Universal Time',         iana: 'UTC' },
  { code: 'GMT',  name: 'Greenwich Mean Time',                iana: 'Europe/London' },
  { code: 'EST',  name: 'Eastern Standard Time',              iana: 'America/New_York' },
  { code: 'CST',  name: 'Central Standard Time',              iana: 'America/Chicago' },
  { code: 'MST',  name: 'Mountain Standard Time',             iana: 'America/Denver' },
  { code: 'PST',  name: 'Pacific Standard Time',              iana: 'America/Los_Angeles' },
  { code: 'AKST', name: 'Alaska Standard Time',               iana: 'America/Anchorage' },
  { code: 'HST',  name: 'Hawaii Standard Time',               iana: 'Pacific/Honolulu' },
  { code: 'AST',  name: 'Atlantic Standard Time',             iana: 'America/Halifax' },
  { code: 'NST',  name: 'Newfoundland Standard Time',         iana: 'America/St_Johns' },
  { code: 'BRT',  name: 'Brasilia Time',                      iana: 'America/Sao_Paulo' },
  { code: 'ART',  name: 'Argentina Time',                     iana: 'America/Argentina/Buenos_Aires' },
  { code: 'CET',  name: 'Central European Time',              iana: 'Europe/Berlin' },
  { code: 'EET',  name: 'Eastern European Time',              iana: 'Europe/Bucharest' },
  { code: 'WET',  name: 'Western European Time',              iana: 'Europe/Lisbon' },
  { code: 'MSK',  name: 'Moscow Standard Time',               iana: 'Europe/Moscow' },
  { code: 'IST',  name: 'India Standard Time',                iana: 'Asia/Kolkata' },
  { code: 'NPT',  name: 'Nepal Time',                         iana: 'Asia/Kathmandu' },
  { code: 'PKT',  name: 'Pakistan Standard Time',             iana: 'Asia/Karachi' },
  { code: 'BST',  name: 'Bangladesh Standard Time',           iana: 'Asia/Dhaka' },
  { code: 'ICT',  name: 'Indochina Time',                     iana: 'Asia/Bangkok' },
  { code: 'CST',  name: 'China Standard Time',                iana: 'Asia/Shanghai' },
  { code: 'JST',  name: 'Japan Standard Time',                iana: 'Asia/Tokyo' },
  { code: 'KST',  name: 'Korea Standard Time',                iana: 'Asia/Seoul' },
  { code: 'HKT',  name: 'Hong Kong Time',                     iana: 'Asia/Hong_Kong' },
  { code: 'SGT',  name: 'Singapore Time',                     iana: 'Asia/Singapore' },
  { code: 'PHT',  name: 'Philippine Time',                    iana: 'Asia/Manila' },
  { code: 'AWST', name: 'Australian Western Standard Time',   iana: 'Australia/Perth' },
  { code: 'ACST', name: 'Australian Central Standard Time',   iana: 'Australia/Adelaide' },
  { code: 'AEST', name: 'Australian Eastern Standard Time',   iana: 'Australia/Sydney' },
  { code: 'NZST', name: 'New Zealand Standard Time',          iana: 'Pacific/Auckland' },
  { code: 'GST',  name: 'Gulf Standard Time',                 iana: 'Asia/Dubai' },
  { code: 'EAT',  name: 'East Africa Time',                   iana: 'Africa/Nairobi' },
  { code: 'CAT',  name: 'Central Africa Time',                iana: 'Africa/Harare' },
  { code: 'WAT',  name: 'West Africa Time',                   iana: 'Africa/Lagos' },
  { code: 'SAST', name: 'South Africa Standard Time',         iana: 'Africa/Johannesburg' },
];

export function getTimezoneLabel(tz: TimezoneEntry): string {
  return `${tz.code} \u2013 ${tz.name}`;
}
