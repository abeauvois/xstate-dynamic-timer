import { child, push, ref, update } from 'firebase/database'
import { db } from './firebase'

import type { Activity, Effect, Family, Task, User } from './Types'

const dbRef = ref(db)

const addEffect = (user: User, task: Task, effect: Effect) => {
  /**
   * u1 issues a penalty (effect e1) to u2 on task "gaming"
   *
   * users-tasks/u2/gaming = {has: true, assigned: false }
   * users-effects/u1/e1 = {issuer: true}
   * effects-tasks/e1/gaming = {}
   *
   * OR
   *
   * users-tasks-effects/u2/gaming/e1 = {from: u1, to:u2, on:gaming, impact:{duration: -1}}
   *
   */

  const newEffectId = push(child(ref(db), 'effects')).key

  // Write the new post's data simultaneously in the effects list and the user's post list.
  const updates = {} as Record<string, any>

  updates[`/effects/${newEffectId}`] = effect
  updates['/users-tasks-effects/' + `${user.id}/${task.id}/${newEffectId}`] = effect

  return update(ref(db), updates)
}

const addUser = (user: User, family: Family) => {

  const updates = {} as Record<string, any>

  updates[`/users/${user.id}`] = user
  updates[`/user-family/${user.id}`] = family
  updates[`/family-users/${family.id}/${user.id}`] = user

  return update(dbRef, updates)
}

const addActivity = (user: User, family: Family, task: Task) => {

  addUser(user, family)

  const newActivityKey = push(ref(db, 'activities')).key

  const updates = {} as Record<string, any>

  updates[`/tasks/${task.id}`] = task
  updates[`/activities/${user.id}/${task.id}`] = { id: newActivityKey, user, task, state: 'idle' }

  return update(dbRef, updates)
}

const setActivityState = (activity: Activity, state: Activity['state']) => {
  const updates = {} as Record<string, any>

  const newActivity: Activity = { ...activity, state }

  updates[`/activities/${activity.user.id}/${activity.task.id}`] = newActivity

  return update(dbRef, updates)
}

export { addUser, addActivity, setActivityState }