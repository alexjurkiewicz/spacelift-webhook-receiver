import { NotificationRule } from "./notification"
import { SpaceliftWebhookPayload } from "./spacelift"

/**
 * Is this event interesting to a specific rule. Check the rule cares about the
 * state (eg INITIALIZING, FINISHED).
 * @param event
 * @param rule
 * @returns
 */
export function eventIsInterestingToRule(event: SpaceliftWebhookPayload, rule: NotificationRule): boolean {
  return rule.states.indexOf(event.state) !== -1
}

/**
 * Parse a string label. It should match `slack:TARGET`, where TARGET is a
 * channel or user.
 * @param label Label to parse
 * @returns Parsed label, or undefined if the label is invalid.
 */
export function parseLabel(label: string): NotificationRule | undefined {
  const target = label.slice(6)
  if (!label.startsWith('slack:') || target === '') {
    return undefined
  }
  return {
    states: ["FINISHED", "FAILED", "UNCONFIRMED", "CONFIRMED", "DISCARDED"],
    target,
  }
}
/**
 * Is this event potentially interesting? We don't care about events from
 * proposed runs.
 * @param event
 * @returns
 */
export function eventIsInteresting(event: SpaceliftWebhookPayload): boolean {
  if (event.run.type !== 'TRACKED') {
    return false
  }
  return true;
}
