import chalk from 'chalk'
import { simpleGit as git } from 'simple-git'

export const exit = (reason?: string) => Boolean(reason && console.log(reason)) || process.exit(0)

const assertIsCleanRepo = async () => {
  const gitStatus = await git().status()
  if (!gitStatus.isClean()) {
    console.log(chalk.red('Your repository is not clean. Please commit or stash your changes.'))
    exit()
  }
}

const mergeAndPush = async () => {
  await assertIsCleanRepo()

  console.log(chalk.green('Checking out develop...'))
  await git().checkout(['develop'])

  console.log(chalk.green('Fetching latest changes for develop...'))
  await git().fetch(['origin', 'develop'])
  await git().pull('origin', 'develop')

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
