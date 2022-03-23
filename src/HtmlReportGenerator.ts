import * as ejs from 'ejs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { ProjectReport } from './TestSummary';
import { TestSuite } from 'junitxml-to-javascript';

export class HtmlReportGenerator {
  async generateReport(
    tmpDir: string,
    projectReport: ProjectReport,
    suites: TestSuite[],
  ): Promise<string> {
    const report = await ejs.renderFile(path.join(__dirname, 'templates', 'report.ejs'), {
      projectReport,
      suites,
    });

    const reportFile = path.join(tmpDir, 'test-report.html');
    await fsPromises.writeFile(reportFile, report);

    return reportFile;
  }
}
