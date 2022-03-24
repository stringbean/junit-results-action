import Parser, { TestSuite } from 'junitxml-to-javascript';
import { ProjectReport } from './model/ProjectReport';
import { isBefore } from 'date-fns';

export default class JUnitLoader {
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async loadFiles(paths: string[]): Promise<TestSuite[]> {
    const suiteResults = await Promise.all(paths.map((path) => this.loadFile(path)));
    return suiteResults.flat();
  }

  static summariseTests(projectName: string, suites: TestSuite[]): ProjectReport {
    const summarise = (acc: ProjectReport, suite: TestSuite) => {
      // take the earliest timestamp as the overall start time
      if (isBefore(suite.timestamp, acc.summary.startTime)) {
        acc.summary.startTime = suite.timestamp;
      }

      // increment the summary stats
      acc.summary.duration += suite.durationSec;
      acc.summary.tests += suite.tests;
      acc.summary.passed += suite.succeeded;
      acc.summary.failed += suite.errors;
      acc.summary.skipped += suite.skipped;

      // append to the list of suites
      acc.suites.push({
        startTime: suite.timestamp,
        duration: suite.durationSec,
        tests: suite.tests,
        passed: suite.succeeded,
        failed: suite.errors,
        skipped: suite.skipped,
      });

      return acc;
    };

    const emptyReport: ProjectReport = {
      name: projectName,
      summary: {
        startTime: new Date(),
        duration: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: 0,
      },
      suites: [],
    };

    return suites.reduce(summarise, emptyReport);
  }

  private async loadFile(path: string): Promise<TestSuite[]> {
    const report = await this.parser.parseXMLFile(path);
    return report.testsuites;
  }
}
