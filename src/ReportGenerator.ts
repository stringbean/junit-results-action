import { TestSuite } from 'junitxml-to-javascript';

import * as ejs from 'ejs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { TestSummary } from './TestSummary';

export class ReportGenerator {
  async generateReport(tmpDir: string, suites: TestSuite[], summary: TestSummary): Promise<string> {
    const report = await ejs.renderFile(path.join(__dirname, 'templates', 'report.ejs'), {
      suites,
      summary,
    });

    const reportFile = path.join(tmpDir, 'test-report.html');
    await fsPromises.writeFile(reportFile, report);

    return reportFile;
  }
}
