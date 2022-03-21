declare module 'junitxml-to-javascript' {
  export default Parser;

  class Parser {
    constructor(opts?: ParseOpts);

    parseXMLFile(path: string, encoding?: string): Promise<Report>;

    parseXmlString(input: string): Promise<Report>;
  }

  export interface ParseOpts {
    modifier?: string;
    customTag?: string;
    sumTestCasesDuration?: boolean;
  }

  export class Report {
    testsuites: TestSuite[];
  }

  export class TestSuite {
    name: string;

    timestamp: Date;
    durationSec: number;

    tests: number;
    succeeded: number;
    errors: number;
    skipped: number;

    testCases: TestCase[];
  }

  export class TestCase {
    name: string;
    result: string;
    duration: number;
  }
}
