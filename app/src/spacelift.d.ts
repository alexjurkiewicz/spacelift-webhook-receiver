export type SpaceliftAuditTrailEvent = SpaceliftAuditEvent | SpaceliftRunEvent

export interface SpaceliftAuditEvent {
  account: string
  action: string
  state: undefined // This property only exists on run events
  actor: string
  context: Record<string, unknown>
  data: Record<string, unknown>
  timestamp: number
}

export interface SpaceliftRunEvent {
  account: string
  action: undefined // This property only exists on audit events
  state: "FINISHED" | "QUEUED" | "PREPARING" | "INITIALIZING" | "DISCARDED" | "CONFIRMED" | string
  stateVersion: number
  timestamp: number
  run: {
    id: string
    branch: string
    commit: {
      authorLogin: string
      authorName: string
      hash: string
      message: string
      timestamp: number
      url: string
    }
    createdAt: number
    driftDetection: boolean
    delta?: {
      added: number
      changed: number
      deleted: number
      resources: number
    }
    triggeredBy: string
    type: "TRACKED" | "PROPOSED"
    url: string
  }
  stack: {
    id: string
    name: string
    description: string
    labels: string[]
  }
}
