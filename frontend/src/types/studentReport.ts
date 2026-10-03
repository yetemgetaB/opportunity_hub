export interface ReportStat {
  label: string
  value: string
  color: string
}

export interface MonthlyApplications {
  month: string
  count: number
}

export interface StatusFunnelStep {
  label: string
  count: number
  percentOfTotal: number
  color: string
}

export interface SkillMatchTag {
  skill: string
  matches: number
  highlighted?: boolean
}