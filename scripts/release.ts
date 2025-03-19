/* eslint-disable no-console */
import chalk from 'chalk'
import { exec } from 'child_process'
import inquirer from 'inquirer'
import semver from 'semver'
import { simpleGit as git } from 'simple-git'
import { promisify } from 'util'

import {
  assertGhAuth,
  assertGhInstalled,
  assertIsCleanRepo,
  exit,
  getLatestSemverTag,
} from './utils.js'

const pExec = promisify(exec)

const releaseType = ['Regular', 'Hotfix'] as const
type ReleaseType = (typeof releaseType)[number]

const inquireReleaseType = async (): Promise<ReleaseType> => {
  const questions = [
    {
      type: 'list',
      name: 'releaseType',
      message: 'What type of release is this?',
      choices: releaseType,
    },
  ]
  return (await inquirer.prompt(questions)).releaseType
}

const inquireCleanBranchOffMaster = async (): Promise<boolean> => {
  const questions = [
    {
      type: 'confirm',
      name: 'isCleanlyBranched',
      message: 'Is your branch cleanly branched off origin/master?',
      default: false, // Defaulting to false to encourage verification
    },
  ]
  const { isCleanlyBranched } = await inquirer.prompt(questions)
  return isCleanlyBranched
}

const getCommits = async (branch: string) => {
  // Get the last release tag
  const latestTag = await getLatestSemverTag()

  // If we have a last release tag, base the diff on that
  // If no tags exist, we'll get all commits from the branch
  const logOptions = [
    '--oneline',
    '--first-parent',
    '--pretty=format:%s', // no hash, just conventional commit style
  ]

  if (latestTag) {
    logOptions.push(`${latestTag}..origin/${branch}`)
  } else {
    logOptions.push('origin/' + branch)
  }

  const { all, total } = await git().log(logOptions)

  const messages = all.map(({ hash }) => hash)
  return { messages, total }
}

const assertCommitsToRelease = (total: number) => {
  if (!total) exit(chalk.red('No commits to release.'))
}

const createDraftRegularPR = async (): Promise<void> => {
  const { messages } = await getCommits('develop')
  // TODO: parse version bump from commit messages
  const formattedMessages = messages.map(m => m.replace(/"/g, '\\"'))
  const nextVersion = await getNextReleaseVersion('minor')
  const title = `chore: release ${nextVersion}`
  const command = `gh pr create --draft --base "master" --title "${title}" --body "${formattedMessages}"`
  console.log(chalk.green('Creating draft PR...'))
  await pExec(command)
  console.log(chalk.green('Draft PR created.'))
  exit(chalk.green(`Release ${nextVersion} created.`))
}

const createDraftHotfixPR = async (): Promise<void> => {
  const currentBranch = await git().revparse(['--abbrev-ref', 'HEAD'])
  const { messages } = await getCommits(currentBranch as string)
  // TODO: parse version bump from commit messages
  const formattedMessages = messages.map(m => m.replace(/"/g, '\\"'))
  const nextVersion = await getNextReleaseVersion('patch')
  const title = `chore: hotfix release ${nextVersion}`
  const command = `gh pr create --draft --base "master" --title "${title}" --body "${formattedMessages}"`
  console.log(chalk.green('Creating draft hotfix PR...'))
  await pExec(command)
  console.log(chalk.green('Draft hotfix PR created.'))
  exit(chalk.green(`Hotfix release ${nextVersion} created.`))
}

type WebReleaseType = Extract<semver.ReleaseType, 'minor' | 'patch'>

const getNextReleaseVersion = async (versionBump: WebReleaseType): Promise<string> => {
  const latestTag = await getLatestSemverTag()
  const nextVersion = semver.inc(latestTag, versionBump)
  if (!nextVersion) exit(chalk.red(`Could not bump version to ${nextVersion}`))
  return `v${nextVersion}`
}

const isReleaseInProgress = async (): Promise<boolean> => {
  const { total } = await getCommits('release')
  return Boolean(total)
}

const createRelease = async () => {
  ;(await inquireReleaseType()) === 'Regular' ? await doRegularRelease() : doHotfixRelease()
}

const doRegularRelease = async () => {
  const { messages, total } = await getCommits('develop')
  assertCommitsToRelease(total)
  await inquireProceedWithCommits(messages, 'create')
  console.log(chalk.green('Checking out develop...'))
  await git().checkout(['develop'])
  console.log(chalk.green('Pulling develop...'))
  await git().pull()
  console.log(chalk.green('Resetting release to develop...'))
  // **note** - most devs are familiar with lowercase -b to check out a new branch
  // capital -B will checkout and reset the branch to the current HEAD
  // so we can reuse the release branch, and force push over it
  // this is required as the fleek environment is pointed at this specific branch
  await git().checkout(['-B', 'release'])
  console.log(chalk.green('Force pushing release branch...'))
  await git().push(['--force', 'origin', 'release'])
  await createDraftRegularPR()
  exit('Regular release process completed.')
}

const doHotfixRelease = async () => {
  const currentBranch = await git().revparse(['--abbrev-ref', 'HEAD'])
  const isMaster = currentBranch === 'master'

  if (isMaster) {
    console.log(
      chalk.red(
        'Cannot open hotfix PRs directly off local master branch for security reasons. Please branch out to another branch first.',
      ),
    )
    exit('Cannot proceed with hotfix from master branch.')
  }

  // Only continue if the branch is cleanly branched off origin/master since we will
  // target it in the hotfix PR
  const isCleanOffMaster = await inquireCleanBranchOffMaster()
  if (!isCleanOffMaster) {
    exit(
      chalk.yellow(
        'Please ensure your branch is cleanly branched off origin/master before proceeding.',
      ),
    )
  }

  // Dev has confirmed they're clean off master, here goes nothing
  await fetch()

  // Force push current branch upstream so we can getCommits from it - getCommits uses upstream for diffing
  console.log(chalk.green(`Force pushing ${currentBranch} branch...`))
  await git().push(['-u', 'origin', currentBranch, '--force'])
  const { messages, total } = await getCommits(currentBranch as string)
  assertCommitsToRelease(total)
  await inquireProceedWithCommits(messages, 'create')

  // Merge origin/master as a paranoia check
  console.log(chalk.green('Merging origin/master...'))
  await git().merge(['origin/master'])

  console.log(chalk.green('Setting release to current branch...'))
  await git().checkout(['-B', 'release'])

  console.log(chalk.green('Force pushing release branch...'))
  await git().push(['--force', 'origin', 'release'])

  console.log(chalk.green('Creating draft hotfix PR...'))
  await createDraftHotfixPR()

  exit(chalk.green('Hotfix release process completed.'))
}

const mergeRelease = async () => {
  const { messages, total } = await getCommits('release')
  assertCommitsToRelease(total)
  await inquireProceedWithCommits(messages, 'merge')
  console.log(chalk.green('Checking out release...'))
  await git().checkout(['release'])
  console.log(chalk.green('Pulling release...'))
  await git().pull()
  console.log(chalk.green('Checking out master...'))
  await git().checkout(['master'])
  console.log(chalk.green('Pulling master...'))
  await git().pull()
  console.log(chalk.green('Merging release...'))
  await git().merge(['release'])
  const nextVersion = await getNextReleaseVersion('minor')
  console.log(chalk.green(`Tagging master with version ${nextVersion}`))
  await git().tag(['-a', nextVersion, '-m', nextVersion])
  console.log(chalk.green('Pushing master...'))
  await git().push(['origin', 'master', '--tags'])
  console.log(chalk.green('Checking out develop...'))
  await git().checkout(['develop'])
  console.log(chalk.green('Pulling develop...'))
  await git().pull()
  console.log(chalk.green('Merging master back into develop...'))
  await git().merge(['master'])
  console.log(chalk.green('Pushing develop...'))
  await git().push(['origin', 'develop'])
  exit(chalk.green(`Release ${nextVersion} completed successfully.`))
}

const inquireProceedWithCommits = async (commits: string[], action: 'create' | 'merge') => {
  console.log(chalk.blue(['', commits, ''].join('\n')))
  const message =
    action === 'create'
      ? 'Do you want to create a release with these commits?'
      : 'Do you want to merge and push these commits into master?'
  const questions = [
    {
      type: 'confirm',
      default: 'y',
      name: 'shouldProceed',
      message,
      choices: ['y', 'n'],
    },
  ]
  const { shouldProceed } = await inquirer.prompt(questions)
  if (!shouldProceed) exit('Release cancelled.')
}

const fetch = async () => {
  console.log(chalk.green('Fetching...'))
  await git().fetch(['origin', '--tags', '--force'])
}

const main = async () => {
  await assertIsCleanRepo()
  await assertGhInstalled()
  await assertGhAuth()
  await fetch()
  ;(await isReleaseInProgress()) ? await mergeRelease() : await createRelease()
}

main()
