import { App, Block, SectionBlock } from '@slack/bolt'
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

export interface SlackMessagePayload {
  text: string
  blocks: Block[],
}

export function generateSlackMessage(event: SpaceliftWebhookPayload): SlackMessagePayload {
  const runUrl = `https://${event.account}.app.spacelift.io/stack/${event.stack.id}/run/${event.run.id}`
  const triggeredBy = event.run.triggeredBy ?? "Git push"
  const sha = event.run.commit.hash.slice(0, 7)
  const repo = event.run.commit.url.split('/')[4] // Really hacky, but works for Github
  const status = spaceliftStateToStatus(event.state)
  const text = `${event.stack.id} is ${status}`
  const messageBlock: SectionBlock = {
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Stack:* <${runUrl}|${event.stack.id}>`
      },
      {
        type: "mrkdwn",
        text: `*State:* ${status}`
      },
      {
        type: "mrkdwn",
        text: `*Triggered by:* ${triggeredBy}`
      },
      {
        type: "mrkdwn",
        text: `*Code:* <${event.run.commit.url}|${repo} @ ${sha}>`
      }
    ]
  }
  return {
    text,
    blocks: [messageBlock]
  }
}

export async function sendSlackMessage(app: App, message: SlackMessagePayload, target: string): Promise<void> {
  const opts = {
    ...message,
    channel: target,
  }
  await app.client.chat.postMessage(opts).then(response => {
    logger.info({ msg: 'Slack postMessage response', response })
  }).catch(err => {
    logger.error({ msg: 'Failed to post to Slack', request: opts, err })
  })
}
