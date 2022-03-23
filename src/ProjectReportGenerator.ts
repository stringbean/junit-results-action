import { TestSuite } from 'junitxml-to-javascript';
import { ProjectReport, TestSummary } from './TestSummary';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

export class ProjectReportGenerator {
  summariseTests(projectName: string, suites: TestSuite[]): ProjectReport {
    const summarise = (acc: TestSummary, suite: TestSuite) => {
      return {
        duration: acc.duration + suite.durationSec,
        passed: acc.passed + suite.succeeded,
        failed: acc.failed + suite.errors,
        skipped: acc.skipped + suite.skipped,
        tests: acc.tests + suite.tests,
      };
    };

    const testSummary = suites.reduce(summarise, {
      duration: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: 0,
    });

    return {
      name: projectName,
      tests: testSummary,
    };
  }

  async writeReportFile(tmpDir: string, report: ProjectReport): Promise<string> {
    const reportFile = path.join(tmpDir, 'project-report.json');
    await fsPromises.writeFile(reportFile, JSON.stringify(report));

    return reportFile;
  }
}
