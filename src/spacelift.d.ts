export interface SpaceliftWebhookPayload {
  account: string
  state: "FINISHED" | "QUEUED" | "PREPARING" | "INITIALIZING" | string
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
  }
  stack: {
    id: string
    name: string
    description: string
    labels: string[]
  }
}
