import { App } from '@slack/bolt'
import { logger } from './handler'

import { spaceliftStateToStatus } from './notification'
import { SpaceliftWebhookPayload } from "./spacelift"



export async function startSlackApp(): Promise<App> {
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
  });
  await app.start();
  return app
}

export function generateSlackMessage(event: SpaceliftWebhookPayload): string {
  const runUrl = `https://${event.account}.app.spacelift.io/stack/${event.stack.id}/run/${event.run.id}`
  const sha = event.run.commit.hash.slice(0, 7)
  return `:spacelift: Stack <${runUrl}|${event.stack.id}> ${spaceliftStateToStatus(event.state)}. Run triggered by ${event.run.triggeredBy} @ <${event.run.commit.url}|${sha}>`
}

export async function sendSlackMessage(app: App, message: string, target: string): Promise<void> {
  const opts = {
    channel: target,
    message,
  }
  await app.client.chat.postMessage(opts).then(response => {
    logger.info({ msg: 'Slack postMessage response', response })
  }).catch(err => {
    logger.error({ msg: 'Failed to post to Slack', request: opts, err })
  })
}
