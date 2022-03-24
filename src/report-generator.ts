import * as ejs from 'ejs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { ProjectReport } from './TestSummary';
import { TestSuite } from 'junitxml-to-javascript';

export async function generateHtmlReport(
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

export async function generateJsonReport(
  tmpDir: string,
  projectReport: ProjectReport,
): Promise<string> {
  const reportFile = path.join(tmpDir, 'project-summary.json');
  await fsPromises.writeFile(reportFile, JSON.stringify(projectReport));

  return reportFile;
}
