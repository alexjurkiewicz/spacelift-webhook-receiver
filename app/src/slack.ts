import { App, Block, MrkdwnElement, SectionBlock } from '@slack/bolt'
import { UsersListResponse } from '@slack/web-api';
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
  if (event.run.delta) {
    const entries = []
    if (event.run.delta.added > 0) entries.push(`${event.run.delta.added} :new:`)
    if (event.run.delta.changed > 0) entries.push(`${event.run.delta.changed} :arrows_counterclockwise:`)
    if (event.run.delta.deleted > 0) entries.push(`${event.run.delta.deleted} :put_litter_in_its_place:`,)
    if (entries.length === 0) entries.push("No changes")
    const changes: MrkdwnElement = {
      type: "mrkdwn",
      text: `*Changes:* ${entries.join(', ')}`,
    }; // required semicolon due to ( on next line
    (messageBlock.fields as MrkdwnElement[]).push(changes)
  }
  return {
    text,
    blocks: [messageBlock]
  }
}

async function resolveSlackTarget(app: App, target: string): Promise<string> {
  // # is a friendly channel name
  // U is a user ID
  // C is a channel ID
  if (target[0] === '#' || target[0] === 'U' || target[0] === 'C') {
    return target
  }
  logger.debug({ msg: "Resolving Slack target", target })
  // We have a username, let's resolve it to a user ID
  for await (const page of app.client.paginate('users.list')) {
    const user = extractUserFromUserListPage(page, target)
    if (user !== undefined) return user
  }
  throw new Error(`can't find Slack target ${target}`)
}

function extractUserFromUserListPage(page: UsersListResponse, target: string): string | undefined {
  if (page.members === undefined) {
    return undefined
  }
  for (const member of page.members) {
    if (member.profile?.display_name === target) {
      logger.debug({ msg: "Found matching member", member })
      return member.id
    }
  }
}

export async function sendSlackMessage(app: App, message: SlackMessagePayload, target: string): Promise<void> {
  const channel = await resolveSlackTarget(app, target)
  const opts = {
    ...message,
    channel,
  }
  await app.client.chat.postMessage(opts).then(response => {
    logger.info({ msg: 'Slack postMessage response', response })
  }).catch(err => {
    logger.error({ msg: 'Failed to post to Slack', request: opts, err })
  })
}
