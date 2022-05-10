type User = {
  id: string
  username: string
  birth?: number // unix timestamp
}
type Family = {
  id: string
  name: string
}
type Task = {
  id: string
  name: string
  duration: number
  state: 'asking' | 'newday' | 'running' | 'paused'
}
type Effect = {
  id: string
  name: string
  birth?: number // unix timestamp
}

export type {User, Family, Task, Effect}