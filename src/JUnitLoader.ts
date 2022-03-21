import Parser, { TestSuite } from 'junitxml-to-javascript';

export default class JUnitLoader {
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async loadFiles(paths: string[]): Promise<TestSuite[]> {
    const suiteResults = await Promise.all(paths.map((path) => this.loadFile(path)));
    return suiteResults.flat();
  }

  private async loadFile(path: string): Promise<TestSuite[]> {
    const report = await this.parser.parseXMLFile(path);
    return report.testsuites;
  }
}
