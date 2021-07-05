// import { Context } from "aws-lambda/handler"
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda/trigger/api-gateway-proxy"
import fetch from "node-fetch"
import pino from "pino";

import { SpaceliftWebhookPayload } from "./spacelift"
import { verifySpaceliftEvent } from './verify'

// Once-off setup
const logger = pino();

/**
 * Lambda handler.
 * @param raw_event
 * @returns
 */
export async function lambdaEntry(raw_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const spaceliftSecret = process.env.SPACELIFT_SECRET_TOKEN
  if (spaceliftSecret === undefined) {
    return lambdaError('Internal Error', {msg: "Couldn't load Spacelift secret token"})
  }
  // Validate for later
  if (process.env.SLACK_WEBHOOK_URL === undefined) {
    return lambdaError('Internal Error', {msg: "Couldn't load Slack webhook URL"})
  }

  const event = verifySpaceliftEvent(raw_event, spaceliftSecret)
  if (typeof event === 'string') {
    return lambdaError("Couldn't verify payload", {msg: 'Parsing Spacelift event failed', error: event})
  }

  logger.info({ msg: "Spacelift event", event })

  await processEvent(event)

  return { statusCode: 200 }
}

interface NotificationRule {
  states: string[]
  target: string
}

/**
 * Parse a string label. It should match `slack:TARGET`, where TARGET is a
 * channel or user.
 * @param label Label to parse
 * @returns Parsed label, or undefined if the label is invalid.
 */
function parseLabel(label: string): NotificationRule | undefined {
  const target = label.slice(6)
  if (!label.startsWith('slack:') || target === '') {
    return undefined
  }
  return {
    states: ["FINISHED", "FAILED", "UNCONFIRMED"],
    target,
  }
}

function spaceliftStateToStatus(state: string): string {
  switch (state) {
    case 'UNCONFIRMED': {
      return 'is awaiting approval'
    }
    default: {
      return `has ${state.toLowerCase()}`
    }
  }
}

function isNotificationRule(rule: NotificationRule | undefined): rule is NotificationRule {
  return !!rule
}

/**
 * Convenience function to generate an error response.
 * @param clientMessage Message to client
 * @param logData Object to log (should at least include msg)
 * @returns
 */
function lambdaError(clientMessage: string, logData: Record<string, unknown>): APIGatewayProxyStructuredResultV2 {
  if (logData) {
    logger.info({ ...logData, clientMessage })
  }
  return { statusCode: 500, body: JSON.stringify({ message: clientMessage }) }
}

/**
 * Is this event potentially interesting? We don't care about events from
 * proposed runs.
 * @param event
 * @returns
 */
function eventIsInteresting(event: SpaceliftWebhookPayload): boolean {
  if (event.run.type !== 'TRACKED') {
    return false
  }
  return true;
}

async function processEvent(event: SpaceliftWebhookPayload): Promise<void> {
  if (!eventIsInteresting(event)) {
    logger.info("Event is not interesting")
    return
  }
  const message = generateSlackMessage(event)

  // Iterate over every `slack:` label and parse it
  const labelRules = event.stack.labels.filter((label) => {
    return label.startsWith('slack:')
  }).map(parseLabel).filter(isNotificationRule)
  logger.info(`Found ${labelRules.length} rules`)

  for (const rule of labelRules) {
    if (eventIsInterestingToRule(event, rule)) {
      logger.info({ msg: 'Rule was interested', rule })
      await sendSlackMessage(message, rule.target)
    } else {
      logger.info({ msg: 'Rule was NOT interested', rule })
    }
  }

}
function generateSlackMessage(event: SpaceliftWebhookPayload): string {
  const runUrl = `https://${event.account}.app.spacelift.io/stack/${event.stack.id}/run/${event.run.id}`
  const sha = event.run.commit.hash.slice(0, 7)
  return `:spacelift: Stack <${runUrl}|${event.stack.id}> ${spaceliftStateToStatus(event.state)}. Run triggered by ${event.run.triggeredBy} @ <${event.run.commit.url}|${sha}>`
}

/**
 * Is this event interesting to a specific rule. Check the rule cares about the
 * state (eg INITIALIZING, FINISHED).
 * @param event
 * @param rule
 * @returns
 */
function eventIsInterestingToRule(event: SpaceliftWebhookPayload, rule: NotificationRule): boolean {
  return rule.states.indexOf(event.state) !== -1
}

async function sendSlackMessage(message: string, target: string): Promise<void> {
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
