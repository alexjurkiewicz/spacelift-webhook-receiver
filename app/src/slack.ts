// import { App } from '@slack/bolt'
import fetch from 'node-fetch'
import { logger } from './handler'

import { spaceliftStateToStatus } from './notification'
import { SpaceliftWebhookPayload } from "./spacelift"

export function generateSlackMessage(event: SpaceliftWebhookPayload): string {
  const runUrl = `https://${event.account}.app.spacelift.io/stack/${event.stack.id}/run/${event.run.id}`
  const sha = event.run.commit.hash.slice(0, 7)
  return `:spacelift: Stack <${runUrl}|${event.stack.id}> ${spaceliftStateToStatus(event.state)}. Run triggered by ${event.run.triggeredBy} @ <${event.run.commit.url}|${sha}>`
}

export async function sendSlackMessage(message: string, target: string): Promise<void> {
  await fetch(process.env.SLACK_WEBHOOK_URL as string, {
    method: 'POST',
    body: JSON.stringify({
      channel: target,
      text: message,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => {
      logger.info({ msg: 'Slack webhook response', response })
    })
}
