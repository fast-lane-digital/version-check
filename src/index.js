const core = require("@actions/core");
const fs = require("fs");
const semver = require("semver");
const execSync = require("child_process").execSync;

async function run() {
  try {
    //Get version format from action input
    const versionFormat = core.getInput("version-format");
    core.info(`Using version format ${versionFormat}`);

    //Fetch tags from origin
    let fetchOutput = await fetchTags();
    core.debug(fetchOutput);

    //Get and parse git tags
    let tagData = getTags();
    core.debug(`Existing Tags: ${tagData}`);
    let tags = await parseTags(tagData);
    core.debug(`Valid Tags: ${tags}`);

    //Get current Version
    let version = await getVersion(versionFormat);
    core.info(`version: '${version}'`);

    //Validate Semver compliance of current version
    await validateSemverCompliance(version);
    core.info(`Version '${version}' is Semver compliant`);

    //Validate that the current version does not exist yet and is the largest
    await validateTagDoesNotExist(version, tags);
    core.info(`Version '${version}' does not exist yet`);

    await validateVersionLargerThanLatestRelease(version, tags);
    core.info(`Version '${version}' is the largest Semver tag yet`);

    //Set output of action to current version
    core.setOutput("version", version);
  } catch (error) {
    core.setFailed(error);
  }
}

async function fetchTags() {
  let output = execSync("git fetch --tags origin", { cwd: process.cwd() });
  return output.toString();
}

async function getVersion(versionFormat) {
  if (versionFormat == "file") {
    let fileContent = fs.readFileSync("./VERSION");
    return fileContent.toString().trimEnd();
  } else if (versionFormat == "node") {
    let fileContent = fs.readFileSync("./package.json");
    let package_json = JSON.parse(fileContent);
    return package_json.version;
  } else {
    throw Error("Invalid Version Format");
  }
}

function getTags() {
  let output = execSync("git tag", { cwd: process.cwd() });
  return output.toString();
}

async function parseTags(data) {
  return data.split("\n").filter(semver.valid).sort(semver.compare);
}

async function validateSemverCompliance(version) {
  if (semver.valid(version) == null)
    throw Error("Version not Semver compliant");
}

async function validateTagDoesNotExist(version, tags) {
  if (tags.includes(version)) throw Error("Tag already exists");
}

async function validateVersionLargerThanLatestRelease(version, tags) {
  if (
    !tags.every((tag) => {
      return semver.compare(version, tag);
    })
  ) {
    throw Error("Tag smaller than latest release");
  }
}

run();
