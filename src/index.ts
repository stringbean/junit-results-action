import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { Globber } from '@actions/glob';
import * as artifact from '@actions/artifact';
import { TestSuite } from 'junitxml-to-javascript';
import { TestSummary } from './TestSummary';

import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { context } from '@actions/github';
import JUnitLoader from './JUnitLoader';
import { ReportGenerator } from './ReportGenerator';

async function run() {
  const fileGlob: Globber = await glob.create(core.getInput('files', { required: true }));
  const storeSummary = core.getBooleanInput('store-summary');

  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'junit-results-action-'));
  const artifactClient = artifact.create();

  const files: string[] = await fileGlob.glob();

  console.log(`Found:\n  ${files.join('\n  ')}`);

  // TODO iterate

  const loader = new JUnitLoader();

  const suites = await loader.loadFiles(files);

  const [summaryFile, testSummary] = await generateSummaryArtifact(suites);
  await artifactClient.uploadArtifact(`test-summary-${context.job}.json`, [summaryFile], tmpDir);

  const generator = new ReportGenerator();

  const reportFile = await generator.generateReport(tmpDir, suites, testSummary);
  await artifactClient.uploadArtifact(`test-report-${context.job}.html`, [reportFile], tmpDir);
}

async function generateSummaryArtifact(suites: TestSuite[]): Promise<[string, TestSummary]> {
  const summarise = (acc: TestSummary, suite: TestSuite) => {
    return {
      duration: acc.duration + suite.durationSec,
      passed: acc.passed + suite.succeeded,
      failed: acc.failed + suite.errors,
      skipped: acc.skipped + suite.skipped,
      tests: acc.tests + suite.tests,
    };
  };

  const testSummary = suites.reduce(summarise, {
    duration: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: 0,
  });

  const summary = {
    name: 'TODO',
    tests: testSummary,
  };

  // create temp file
  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'junit-results-action-'));

  const summaryFile = path.join(tmpDir, 'test-summary.json');

  await fsPromises.writeFile(summaryFile, JSON.stringify(summary));

  return [summaryFile, testSummary];
}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
