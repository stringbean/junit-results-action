declare module 'junitxml-to-javascript' {
  export class Parser {
    constructor(opts: ParseOpts = {});

    parseXMLFile(path: string, encoding: string = 'utf8'): Promise<Report>;
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

    succeeded: number;
    tests: number;
    errors: number;
    skipped: number;
  }
}
