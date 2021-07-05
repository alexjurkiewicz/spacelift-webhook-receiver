export interface NotificationRule {
  states: string[]
  target: string
}

export function spaceliftStateToStatus(state: string): string {
  switch (state) {
    case 'UNCONFIRMED': {
      return 'is awaiting approval'
    }
    default: {
      return `has ${state.toLowerCase()}`
    }
  }
}

export function isNotificationRule(rule: NotificationRule | undefined): rule is NotificationRule {
  return !!rule
}
