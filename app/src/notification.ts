export interface NotificationRule {
  states: string[]
  target: string
}

export function spaceliftStateToStatus(state: string): string {
  switch (state) {
    case 'UNCONFIRMED': {
      return 'Awaiting approval 📝'
    }
    case 'DISCARDED': {
      return 'Discarded 🙈'
    }
    case 'CONFIRMED': {
      return 'Approved 🚢'
    }
    case 'FINISHED': {
      return 'Finished ✅'
    }
    case 'FAILED': {
      return 'Failed ❌'
    }
    default: {
      // Title case
      return `${state[0].toUpperCase()}${state.slice(1).toLowerCase()}`
    }
  }
}

export function isNotificationRule(rule: NotificationRule | undefined): rule is NotificationRule {
  return !!rule
}
