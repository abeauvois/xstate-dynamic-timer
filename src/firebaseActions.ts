import { getTime } from 'date-fns'
import { child, push, ref, update, get } from 'firebase/database'
import { db } from './firebase'

import type { Activity, ActivityModifier, Family, Task, User } from './Types'
import { getStartOfTomorrow } from './utils'

const dbRef = ref(db)

const addActivityPenalty = (activity: Activity, activityModifier: ActivityModifier) => {
  const modifierId = push(child(ref(db), 'activitymodifier')).key

  // Write the new post's data simultaneously in the activitymodifier list and the activity's post list.
  const updates = {} as Record<string, any>

  updates[`/activitymodifiers/${activityModifier.name}`] = activityModifier
  updates[
    `/activity-activitymodifiers/${activity.user.id}/${activity.task.id}/${activityModifier.name}`
  ] = [
    {
      ...activityModifier,
      id: modifierId,
    },
  ]

  return update(ref(db), updates)
}

const addUser = (user: User, family: Family) => {
  const updates = {} as Record<string, any>

  updates[`/users/${user.id}`] = user
  updates[`/user-family/${user.id}`] = family
  updates[`/family-users/${family.id}/${user.id}`] = user

  return update(dbRef, updates)
}

const addActivity = (user: User, task: Task) => {
  const newActivityKey = push(ref(db, 'activities')).key
  const start = getStartOfTomorrow()

  const updates = {} as Record<string, any>

  updates[`/tasks/${task.id}`] = task
  updates[`/activities/${user.id}/${task.id}`] = {
    id: newActivityKey,
    user,
    task,
    state: 'idle',
    startOfTomorrow: start,
  }

  return update(dbRef, updates)
}

const setActivityState = (activity: Activity, state: Activity['state']) => {
  const updates = {} as Record<string, any>

  const newActivity: Activity = { ...activity, state }

  updates[`/activities/${activity.user.id}/${activity.task.id}`] = newActivity

  return update(dbRef, updates)
}

const getPenalties = (activity: Activity) => {
  const penalties = {} as Record<string, any>

  return get(child(dbRef, `/activity-activitymodifiers/${activity.user.id}/${activity.task.id}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val())
        return snapshot.val()
      } else {
        console.log('No data available')
      }
    })
    .catch((error) => {
      console.error(error)
    })
}

export { addUser, addActivity, setActivityState, addActivityPenalty, getPenalties }
