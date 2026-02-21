// this is the installation identity of the octokit client instance

import { App } from '@octokit/app'
import { getEnv } from '../utils/envValidator.js'

export default new App({
  appId: Number(getEnv("GITHUB_APP_ID")),
  privateKey: getEnv("GITHUB_PRIVATE_KEY"),
  oauth: {
    clientId: getEnv("GITHUB_CLIENT_ID"),
    clientSecret: getEnv("GITHUB_CLIENT_SECRET")
  },
  webhooks: {
    secret: getEnv("GITHUB_WEBHOOK_SECRET")
  }
})

