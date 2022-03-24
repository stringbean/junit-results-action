import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { Globber } from '@actions/glob';
import * as artifact from '@actions/artifact';

import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { context } from '@actions/github';
import JUnitLoader from './JUnitLoader';
import { generateHtmlReport, generateJsonReport } from './report-generator';

const JUNIT_LOADER = new JUnitLoader();

function getNumberInput(key: string): number | undefined {
  const raw = core.getInput(key);

  if (raw) {
    return parseInt(raw, 10);
  }
}

async function run() {
  const fileGlob: Globber = await glob.create(core.getInput('files', { required: true }));
  const uploadReport = core.getBooleanInput('upload-report');
  const artifactName = core.getInput('artifact-name');
  const retentionDays = getNumberInput('retention-days');

  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'junit-results-action-'));

  const inputFiles: string[] = await fileGlob.glob();
  core.debug(`Found ${inputFiles.length} JUnit files`);
  const suites = await JUNIT_LOADER.loadFiles(inputFiles);

  const projectSummary = JUnitLoader.summariseTests(context.job, suites);

  core.setOutput('test-results', projectSummary);

  if (uploadReport) {
    const htmlReport = await generateHtmlReport(tmpDir, projectSummary, suites);
    const jsonReport = await generateJsonReport(tmpDir, projectSummary);

    const targetName = artifactName ? artifactName : `test-report-${context.job}`;
    await uploadReports(tmpDir, [htmlReport, jsonReport], targetName, retentionDays);
  }
}

async function uploadReports(
  tmpDir: string,
  reports: string[],
  artifactName: string,
  retentionDays: number | null,
): Promise<void> {
  const artifactClient = artifact.create();
  await artifactClient.uploadArtifact(artifactName, reports, tmpDir, { retentionDays });
}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
