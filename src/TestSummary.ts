export interface ProjectReport {
  name: string;
  tests: TestSummary
}

export interface TestSummary {
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
  tests: number;
}