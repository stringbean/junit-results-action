import Parser, { TestSuite } from 'junitxml-to-javascript';
import { TestSummary } from './model/TestSummary';
import { ProjectReport } from './model/ProjectReport';

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

  private async loadFile(path: string): Promise<TestSuite[]> {
    const report = await this.parser.parseXMLFile(path);
    return report.testsuites;
  }
}
