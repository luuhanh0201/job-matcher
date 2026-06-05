export enum JobPostStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  FREELANCE = 'FREELANCE',
}
export enum WorkMode {
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE',
}
export enum SalaryType {
  NEGOTIABLE = 'NEGOTIABLE',
  RANGE = 'RANGE',
  FIXED = 'FIXED',
}
export enum SeniorityLevel {
  NO_EXPERIENCE = 'NO_EXPERIENCE',
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export enum CURRENCY {
  VND = 'VND', // Việt Nam Đồng
  USD = 'USD', // US Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound

  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan
  KRW = 'KRW', // South Korean Won
  SGD = 'SGD', // Singapore Dollar
  HKD = 'HKD', // Hong Kong Dollar
  TWD = 'TWD', // Taiwan Dollar

  AUD = 'AUD', // Australian Dollar
  NZD = 'NZD', // New Zealand Dollar
  CAD = 'CAD', // Canadian Dollar

  INR = 'INR', // Indian Rupee
  THB = 'THB', // Thai Baht
  MYR = 'MYR', // Malaysian Ringgit
  IDR = 'IDR', // Indonesian Rupiah
  PHP = 'PHP', // Philippine Peso

  CHF = 'CHF', // Swiss Franc
  SEK = 'SEK', // Swedish Krona
  NOK = 'NOK', // Norwegian Krone
  DKK = 'DKK', // Danish Krone

  AED = 'AED', // UAE Dirham
  SAR = 'SAR', // Saudi Riyal
}
