import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { Globber } from '@actions/glob';
import * as artifact from '@actions/artifact';

import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { context } from '@actions/github';
import JUnitLoader from './JUnitLoader';
import { HtmlReportGenerator } from './HtmlReportGenerator';
import { ProjectReportGenerator } from './ProjectReportGenerator';

const JUNIT_LOADER = new JUnitLoader();
const REPORT_GENERATOR = new ProjectReportGenerator();
const HTML_REPORT_GENERATOR = new HtmlReportGenerator();

async function run() {
  const fileGlob: Globber = await glob.create(core.getInput('files', { required: true }));
  const uploadResults = core.getBooleanInput('upload-results');
  const artifactName = core.getInput('artifact-name');

  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'junit-results-action-'));

  const inputFiles: string[] = await fileGlob.glob();
  core.debug(`Found ${inputFiles.length} JUnit files`);
  const suites = await JUNIT_LOADER.loadFiles(inputFiles);

  const projectSummary = REPORT_GENERATOR.summariseTests(context.job, suites);

  if (uploadResults) {
    const summaryFile = await REPORT_GENERATOR.writeReportFile(tmpDir, projectSummary);
    const reportFile = await HTML_REPORT_GENERATOR.generateReport(tmpDir, projectSummary, suites);

    const targetName = artifactName ? artifactName : `test-report-${context.job}`;

    await uploadReports(tmpDir, [summaryFile, reportFile], targetName);
  }
}

async function uploadReports(
  tmpDir: string,
  reports: string[],
  artifactName: string,
): Promise<void> {
  const artifactClient = artifact.create();
  await artifactClient.uploadArtifact(artifactName, reports, tmpDir);
}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
