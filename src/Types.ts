type User = {
  id: string
  username: string
  birth?: number // unix timestamp
  isAdmin?: boolean
}
type Family = {
  id: string
  name: string
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
  startOfTomorrow: number
}
type Effect = {
  id: string
  name: string
  birth?: number // unix timestamp
}

export type {User, Family, Task, Activity, Effect}