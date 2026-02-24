import githubApp from '../config/github.js'
import { handleInstallationEvent } from './handlers/installation.handler.js'

export function registerWebhooks(){
  //installation event
  githubApp.webhooks.on('installation', handleInstallationEvent)

  //pull_request event

}