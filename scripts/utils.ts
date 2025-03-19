// common CLI dev tool utils
import chalk from 'chalk'
import { exec } from 'child_process'
import semver from 'semver'
import { simpleGit as git } from 'simple-git'
import { promisify } from 'util'

const pExec = promisify(exec)

export const exit = (reason: string): never => {
  console.log(reason)
  process.exit(1)
}

export const getLatestSemverTag = async (): Promise<string> => {
  const { all } = await git().tags()
  const tags = all.map(tag => tag.replace('refs/tags/', ''))
  const semverTags = tags.filter(tag => semver.valid(tag))
  if (!semverTags.length) {
    console.log(chalk.yellow('No semver tags found. Starting from v1.0.0'))
    return 'v1.0.0'
  }
  return semverTags.sort(semver.rcompare)[0]
}

export const getHeadShortCommitHash = (): Promise<string> => git().revparse(['--short', 'HEAD'])

export const getSemverTags = async (): Promise<string[]> => {
  // safety in case we pick up other tags from other packages
  const WEB_VERSION_RANGES = '>1.0.0 <2.0.0'
  await git().fetch(['origin', '--tags', '--force'])
  const tags = await git().tags()
  const allTags: string[] = tags.all
  const validTags: string[] = allTags
    .filter(t => semver.valid(t))
    .filter(t => semver.satisfies(t, WEB_VERSION_RANGES))
  return validTags
}

export const assertIsCleanRepo = async (): Promise<void> => {
  const { isClean } = await git().status()
  if (!isClean()) exit(chalk.red('Please commit your changes before proceeding.'))
}

export const assertGhInstalled = async (): Promise<void> => {
  try {
    await pExec('gh --version')
  } catch {
    exit(chalk.red('Please install GitHub CLI (gh) before proceeding.'))
  }
}

export const assertGhAuth = async (): Promise<void> => {
  try {
    await pExec('gh auth status')
  } catch {
    exit(chalk.red('Please authenticate with GitHub CLI (gh auth login) before proceeding.'))
  }
}
