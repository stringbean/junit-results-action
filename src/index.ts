import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as artifact from '@actions/artifact';
import { Globber } from '@actions/glob';
import Parser, { TestSuite } from 'junitxml-to-javascript';
import { TestSummary } from './TestSummary';

import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const junitParser = new Parser();

async function run() {
  const fileGlob: Globber = await glob.create(core.getInput('files', { required: true }));
  const storeSummary = core.getBooleanInput('store-summary');

  const files: string[] = await fileGlob.glob();

  console.log(`Found:\n  ${files.join('\n  ')}`);

  // TODO iterate

  await parseReport(files[0]);
}

async function parseReport(path: string) {
  const parsed = await junitParser.parseXMLFile(path);

  console.log('found: ' + parsed.testsuites.length + ' suites');

  parsed.testsuites.forEach((suite, i) => {
    console.log(
      `  suite[${i}]: ${suite.succeeded} pass, ${suite.errors} failed, ${suite.skipped} skipped`,
    );
  });

  await generateSummaryArtifact(parsed.testsuites);
}

async function generateSummaryArtifact(suites: TestSuite[]) {
  const summarise = (acc: TestSummary, suite: TestSuite) => {
    return {
      passed: acc.passed + suite.succeeded,
      failed: acc.failed + suite.errors,
      skipped: acc.skipped + suite.skipped,
    };
  };

  const testSummary = suites.reduce(summarise, { passed: 0, failed: 0, skipped: 0 });

  const summary = {
    name: 'TODO',
    tests: testSummary,
  };

  // create temp file
  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'junit-results-action-'));

  const summaryFile = path.join(tmpDir, 'test-summary.json');

  await fsPromises.writeFile(summaryFile, JSON.stringify(summary));

  const client = artifact.create();

  await client.uploadArtifact('test-summary.json', [summaryFile], tmpDir);
}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
