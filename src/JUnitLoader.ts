import Parser, { TestSuite } from 'junitxml-to-javascript';

export default class JUnitLoader {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async loadFiles(paths: string[]): Promise<TestSuite[]> {
    console.log('our parser?', this.parser)

    const suiteResults = await Promise.all(paths.map(this.loadFile));

    return suiteResults.flat();
  }

  private async loadFile(path: string): Promise<TestSuite[]> {
    console.log('loadFile parser?', this, this.parser)
    const report = await this.parser.parseXMLFile(path);
    return report.testsuites;
  }
}
