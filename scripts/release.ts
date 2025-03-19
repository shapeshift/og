import chalk from 'chalk'
import inquirer from 'inquirer'
import { simpleGit as git } from 'simple-git'

export const exit = (reason?: string) => Boolean(reason && console.log(reason)) || process.exit(0)

const assertIsCleanRepo = async () => {
  const gitStatus = await git().status()
  if (!gitStatus.isClean()) {
    console.log(chalk.red('Your repository is not clean. Please commit or stash your changes.'))
    exit()
  }
}

const getCommitsList = async () => {
  // Use 'master..origin/develop' to list commits in origin/develop but not in master
  const log = await git().log(['master..origin/develop'])
  return log.all.map(commit => `${commit.hash} - ${commit.message}`)
}

const inquireProceedWithCommits = async (commits: string[]) => {
  console.log(chalk.blue(['', ...commits, ''].join('\n')))
  const questions = [
    {
      type: 'confirm',
      name: 'shouldProceed',
      message: 'Do you want to merge and push these commits into master?',
      default: true,
    },
  ]
  const answers = await inquirer.prompt(questions)
  return answers.shouldProceed
}

const mergeAndPush = async () => {
  await assertIsCleanRepo()

  // Fetch all branches from origin
  console.log(chalk.green('Fetching latest changes...'))
  await git().fetch('origin')

  // Pull latest changes from origin/develop
  console.log(chalk.green('Pulling latest changes from origin/develop...'))
  await git().pull('origin', 'develop')

  // Checkout master and pull updates from origin/master
  console.log(chalk.green('Checking out master...'))
  await git().checkout(['master'])

  console.log(chalk.green('Pulling latest changes from origin/master...'))
  await git().pull('origin', 'master')

  // Get the list of commits to merge
  const commits = await getCommitsList()

  const shouldProceed = await inquireProceedWithCommits(commits)
  if (!shouldProceed) {
    console.log(chalk.yellow('Merge and push cancelled.'))
    exit()
  }

  // Merge origin/develop into master
  console.log(chalk.green('Merging origin/develop into master...'))
  try {
    await git().merge(['origin/develop'])
  } catch (error) {
    console.error(chalk.red('Merge conflict encountered.'))
    exit()
  }

  // Push updated master to origin
  console.log(chalk.green('Pushing master to remote...'))
  await git().push('origin', 'master')
  console.log(chalk.green('Merge and push completed successfully.'))
}

const main = async () => {
  try {
    await mergeAndPush()
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error)
    exit()
  }
}

main()

// gm
