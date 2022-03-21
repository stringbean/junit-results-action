import * as core from '@actions/core';
import * as glob from '@actions/glob';
import {Globber} from "@actions/glob";

async function run() {
  const fileGlob: Globber = await glob.create(core.getInput('files'));

  const files: string[] = await fileGlob.glob()

  console.log(`Found:\n  ${files.join('\n  ')}`);
}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
