type User = {
  id: string
  username: string
  createdAt: number // unix timestamp
  isAdmin?: boolean
}
type Family = {
  id: string
  name: string
  createdAt: number // unix timestamp
}
type Task = {
  id: string
  name: string
  duration: number
}
type Activity = {
  id: string
  user: User
  task: Task
  state: 'idle' | 'initialized' | 'asking' | 'newday' | 'running' | 'paused'
  startOfTomorrow: number // unix timestamp
}
type ActivityModifier = {
  id: string
  name: string
  createdAt: number // unix timestamp
  factor: number
  min?: number
  max?: number
}

export type { User, Family, Task, Activity, ActivityModifier }
