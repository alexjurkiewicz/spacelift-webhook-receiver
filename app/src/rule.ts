import { NotificationRule } from "./notification"
import { SpaceliftRunEvent } from "./spacelift"

/** Default stack states to notify about. */
const DEFAULT_STATES = ['failed']

/**
 * Is this event interesting to a specific rule. Check the rule cares about the
 * state (eg INITIALIZING, FINISHED).
 * @param event
 * @param rule
 * @returns
 */
export function runEventIsInterestingToRule(event: SpaceliftRunEvent, rule: NotificationRule): boolean {
  return rule.states.indexOf(event.state.toLowerCase()) !== -1
}

/**
 * Check a label string, if it's a slack target specifier, parse it and return
 * the rule. Otherwise, return nothing.
 *
 * The expected rule format is `slack:TARGET[:state[,state[...]]]`
 *    TARGET is a channel or user. You can use friendly name (eg #channel,
 *      user.name) or the Slack ID (C12345678, U12345678).
 *   STATE is a Spacelift stack state in lower-case. For instance: initializing,
 *      finished, failed, etc. You can specify multiple states by separating
 *      them with commas. If you don't specify any states, the default is used.
 *
 * @param label Label to parse
 * @returns Array containing the parsed rule or nothing
 */
export function parseSlackLabel(label: string): [NotificationRule] | [] {
  const [prefix, target, states_str] = label.split(':') as [string | undefined, string | undefined, string | undefined]
  if (prefix !== 'slack' || !target) {
    return []
  }
  const states = states_str ? states_str.split(',').map(s => s.toLowerCase()) : DEFAULT_STATES
  return [{ states, target }]
}
