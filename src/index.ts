import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { Globber } from '@actions/glob';
import { Parser } from 'junitxml-to-javascript';

async function run() {
  const fileGlob: Globber = await glob.create(core.getInput('files', { required: true }));
  const storeSummary = core.getBooleanInput('store-summary');

  const files: string[] = await fileGlob.glob();

  console.log(`Found:\n  ${files.join('\n  ')}`);



  // TODO iterate

  await parseReport(files[0]);
}

async function parseReport(path: string) {
  const parser = new Parser();

  const parsed = await parser.parseXMLFile(path);

  console.log('found: ' + parsed.testsuites.length + ' suites');

}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
