import githubApp from '../config/github.js'
import { handleInstallationEvent } from './handlers/installation.handler.js'
import { handlePullRequestEvent } from './handlers/pullRequest.handler.js'

export function registerWebhooks(){
  //installation event
  githubApp.webhooks.on('installation', handleInstallationEvent)

  //pull_request event
  githubApp.webhooks.on('pull_request', handlePullRequestEvent)
}