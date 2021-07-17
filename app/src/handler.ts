// import { Context } from "aws-lambda/handler"
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda/trigger/api-gateway-proxy"
import pino from "pino";

import { runEventIsInterestingToRule, parseSlackLabel } from "./rule";
import { generateSlackMessage, sendSlackMessage, startSlackApp } from "./slack";
import { SpaceliftRunEvent } from "./spacelift"
import { verifySpaceliftEvent } from './verify'

// Once-off setup
export const logger = pino();

/**
 * Lambda handler.
 * @param raw_event
 * @returns
 */
export async function lambdaEntry(raw_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const spaceliftSecret = validateEnvVar('SPACELIFT_SECRET_TOKEN')
  validateEnvVar('SLACK_BOT_TOKEN')
  validateEnvVar('SLACK_SIGNING_SECRET')

  const event = verifySpaceliftEvent(raw_event, spaceliftSecret)
  if (typeof event === 'string') {
    return lambdaError("Couldn't verify payload", { msg: 'Parsing Spacelift event failed', error: event })
  }

  // We don't care about audit events
  if (event.state === undefined) {
    return lambdaOk()
  }

  const interesting = eventIsInteresting(event)
  logger.info({ msg: "Spacelift event", event, interesting })

  if (!interesting) {
    return lambdaOk()
  }

  await sendSlackMessages(event);

  return lambdaOk()
}

/**
 * Is this event potentially interesting?
 * @param event
 * @returns
 */
 export function eventIsInteresting(event: SpaceliftRunEvent): boolean {
  // We only care about tracked (real) runs, not proposed (pull request) runs
  return event.run.type === 'TRACKED'
}

/**
 * Convenience function to generate an error response.
 * @param clientMessage Message to client
 * @param logData Object to log
 * @returns
 */
function lambdaError(clientMessage: string, logData: {msg: string, [key: string]: unknown}): APIGatewayProxyStructuredResultV2 {
  if (logData) {
    logger.info({ ...logData, clientMessage })
  }
  return { statusCode: 500, body: JSON.stringify({ message: clientMessage }) }
}

function lambdaOk(): APIGatewayProxyStructuredResultV2 {
  return { statusCode: 200 }
}

async function sendSlackMessages(event: SpaceliftRunEvent) {
  const slackRules = event.stack.labels.flatMap(parseSlackLabel)
  logger.info(`Found ${slackRules.length} Slack rules`)

  if (slackRules.length === 0) {
    return
  }
  const slackApp = await startSlackApp();
  const slackMessage = generateSlackMessage(event);
  for (const rule of slackRules) {
    if (runEventIsInterestingToRule(event, rule)) {
      logger.info({ msg: 'Rule was interested', rule });
      await sendSlackMessage(slackApp, slackMessage, rule.target).catch((err) => {
        logger.error({ msg: `Couldn't send Slack message to ${rule.target}`, err });
      });
    } else {
      logger.info({ msg: 'Rule was NOT interested', rule });
    }
  }
}

function validateEnvVar(name: string): string {
  const value = process.env[name]
  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}
