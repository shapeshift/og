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
  const log = await git().log({
    from: 'main',
    to: 'develop',
  })
  return log.all.map(commit => `${commit.hash} - ${commit.message}`)
}

const inquireProceedWithCommits = async (commits: string[]) => {
  console.log(chalk.blue(['', ...commits, ''].join('\n')))
  const questions = [
    {
      type: 'confirm',
      name: 'shouldProceed',
      message: 'Do you want to merge and push these commits into main?',
      default: true,
    },
  ]
  const answers = await inquirer.prompt(questions)
  return answers.shouldProceed
}

const mergeAndPush = async () => {
  await assertIsCleanRepo()

  console.log(chalk.green('Fetching latest changes...'))
  await git().fetch(['origin', 'develop'])
  await git().fetch(['origin', 'main'])

  const commits = await getCommitsList()

  const shouldProceed = await inquireProceedWithCommits(commits)
  if (!shouldProceed) {
    console.log(chalk.yellow('Merge and push cancelled.'))
    exit()
  }

  console.log(chalk.green('Checking out main...'))
  await git().checkout(['main'])

  console.log(chalk.green('Merging develop into main...'))
  try {
    await git().merge(['develop'])
  } catch (error) {
    console.error(chalk.red('Merge conflict encountered.'))
    exit()
  }

  console.log(chalk.green('Pushing main to remote...'))
  await git().push(['origin', 'main'])
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
