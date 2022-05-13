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


const addMe = (user: User, family: Family) => {

  const updates = {} as Record<string, any>

  updates[`/users/${user.id}`] = user
  updates[`/user-family/${user.id}`] = family

  return update(dbRef, updates)
}

const addActivity = (user: User, family: Family, task: Task) => {
  const newActivityKey = push(ref(db, 'activities')).key

  const updates = {} as Record<string, any>

  updates[`/users/${user.id}`] = user
  updates[`/families/${family.id}`] = family
  updates[`/user-family/${user.id}`] = family
  updates[`/tasks/${task.id}`] = task
  updates[`/activities/${user.id}/${task.id}`] = { user, task, state: 'idle' }
  // updates[`/activities/${newActivityKey}`] = { user, task, state: 'idle' }

  return update(dbRef, updates)
}

const askStartTask = (user: User, task: Task) => {
  const updates = {} as Record<string, any>

  const newActivityKey = push(ref(db, 'activities')).key

  if (!newActivityKey) throw new Error("Null key from push(dbRef,'activities').key")

  const activity: Activity = { id: newActivityKey, user, task, state: 'idle' }

  // updates[`/user-activities/${user.id}`] = activity
  updates[`/activities/${activity.user.id}/${activity.task.id}`] = activity

  return update(dbRef, updates)
}

const acceptStartTask = (activity: Activity) => {
  const updates = {} as Record<string, any>

  const newActivity: Activity = { ...activity, state: 'running' }

  // updates[`/user-activities/${activity.user.id}`] = newActivity
  updates[`/activities/${activity.user.id}/${activity.task.id}`] = newActivity

  return update(dbRef, updates)
}

export { addMe, addActivity, acceptStartTask, askStartTask }


// function writeNewPost(uid, username, picture, title, body) {
//   const db = getDatabase()

//   // A post entry.
//   const postData = {
//     author: username,
//     uid: uid,
//     body: body,
//     title: title,
//     starCount: 0,
//     authorPic: picture,
//   }

//   // Get a key for a new Post.
//   const newPostKey = push(child(ref(db), 'posts')).key

//   // Write the new post's data simultaneously in the posts list and the user's post list.
//   const updates = {}
//   updates['/posts/' + newPostKey] = postData
//   updates['/user-posts/' + uid + '/' + newPostKey] = postData

//   return update(ref(db), updates)
// }