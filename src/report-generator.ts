import * as ejs from 'ejs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { TestSuite } from 'junitxml-to-javascript';
import { ProjectReport } from './model/ProjectReport';
import { format, formatDuration, intervalToDuration } from 'date-fns';

function formatTestDuration(s: number): string {
  if (s < 60) {
    return `${s.toFixed(2)} seconds`;
  }

  // convert into date-fns duration
  const duration = intervalToDuration({
    start: 0,
    end: s * 1000,
  });

  return formatDuration(duration);
}

export async function generateHtmlReport(
  tmpDir: string,
  projectReport: ProjectReport,
  suites: TestSuite[],
): Promise<string> {
  const report = await ejs.renderFile(path.join(__dirname, 'templates', 'report.ejs'), {
    projectReport,
    suites,
    datePattern: 'HH:mm:ss, do MMMM, yyyy',
    formatDate: format,
    formatTestDuration,
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
