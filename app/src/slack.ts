import { App, Block, MrkdwnElement, SectionBlock } from '@slack/bolt'
import { UsersListResponse } from '@slack/web-api';
import { logger } from './handler'

import { spaceliftStateToStatus } from './notification'
import { SpaceliftRunEvent } from './spacelift';

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

export function generateSlackMessage(event: SpaceliftRunEvent): SlackMessagePayload {
  const repo = event.run.commit.url.split('/')[4] // Really hacky, but works for Github
  const status = spaceliftStateToStatus(event.state)
  const text = `${event.stack.id} is ${status}`
  const stackUrl = event.run.url.split('/',5).join('/') // Also really hacky, hopefully event.stack.url is added
  const messageBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":spacelift: Spacelift tracked run update"
    },
    fields: [
      {
        type: "mrkdwn",
        text: `*Stack:* <${stackUrl}|${event.stack.id}>`
      },
      {
        type: "mrkdwn",
        text: `*State:* ${status}`
      },
      {
        type: "mrkdwn",
        text: `*Run:* <${event.run.url}|${event.run.id.slice(0, 10)}>`
      },
      {
        type: "mrkdwn",
        text: `*Code:* <${event.run.commit.url}|${event.run.commit.message}>`
      }
    ]
  }
  if (event.run.delta) {
    const entries = []
    if (event.run.delta.added > 0) entries.push(`${event.run.delta.added} :new:`)
    if (event.run.delta.changed > 0) entries.push(`${event.run.delta.changed} :arrows_counterclockwise:`)
    if (event.run.delta.deleted > 0) entries.push(`${event.run.delta.deleted} :put_litter_in_its_place:`,)
    if (entries.length === 0) entries.push("None")
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
  logger.debug({ msg: "Resolving Slack username", target })
  for await (const page of app.client.paginate('users.list')) {
    const user = extractUserIdFromUserListPage(page, target)
    if (user) return user
  }
  throw new Error(`can't find Slack target ${target}`)
}

function extractUserIdFromUserListPage(page: UsersListResponse, displayName: string): string | undefined {
  if (page.members === undefined) {
    return undefined
  }
  for (const member of page.members) {
    if (member.profile?.display_name === displayName) {
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
