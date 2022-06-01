import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Unsubscribe } from 'firebase/database'
import { db, onValue, ref, get, child } from './firebase'

import type { Activity, Family, Task, User } from './Types'
import './styles.css'

import {
  setActivityState,
  addActivity,
  addUser,
  addActivityPenalty,
  getPenalties,
} from './firebaseActions'
import { ActivitySummary } from './ActivitySummary'

// TODO: Data seed for testing
const task = { id: 'gaming', name: 'gaming', duration: 5 }
const leo = { id: 'leo', username: 'leo', createdAt: Date.now() }
const noa = { id: 'noa', username: 'noa', createdAt: Date.now() }
const teo = { id: 'teo', username: 'teo', createdAt: Date.now() }
const papa = { id: 'papa', username: 'papa', createdAt: Date.now(), isAdmin: true }
const beauvoisFamilly = { id: 'teo', name: 'teo', createdAt: Date.now() }
const notMyFamilly = { id: 'notMyFamilly', name: 'notMyFamilly', createdAt: Date.now() }
const activity: Activity = { id: 'a0', user: noa, task, state: 'idle', startOfTomorrow: Date.now() }
const penalty = { id: 'penalty', name: 'penalty', createdAt: Date.now(), factor: -1 }

export const Search = () => {
  const [{ repo, cached, time }, setResult] = useState<any>({})
  return (
    <div
      onSubmit={async (value) => {
        const response = await fetch(`/api/repos/${value}`)
        setResult(await response.json())
      }}
    />
  )
}

export const useMe = (user: User, family: Family) => {
  const [me, setMe] = useState<User>()
  useEffect(() => {
    if (user && family) {
      addUser(user, family)
      setMe(() => user)
    }
  }, [])
  return me
}

export const useDBFeed = (user: User | undefined, family: Family | undefined, task?: Task) => {
  useEffect(() => {
    if (user && task && family) {
      addUser(user, family)
      addActivity(user, task)
    }
  }, [])
}

export const useInitDB = (me: User | undefined) => {
  useDBFeed(me, undefined)
  useDBFeed(noa, beauvoisFamilly, task)
  useDBFeed(leo, beauvoisFamilly, task)
  useDBFeed(teo, notMyFamilly, task)

  useEffect(() => {
    addActivityPenalty(activity, penalty)
  }, [])
}

export const useListener = (me: User | undefined, path: string) => {
  const [value, setValue] = useState<any>()

  useEffect(() => {
    let unsubscribe: Unsubscribe
    if (me) {
      unsubscribe = onValue(ref(db, path), (snapshot) => {
        setValue(snapshot.val())
        console.log(path, snapshot.val())
      })
      return unsubscribe()
    }
  }, [me])

  return value
}

export const useActivities = (me: User | undefined, family: Family | undefined) => {
  const [activities, setActivities] = useState<Record<string, Activity>>()
  const [allActivities, setAllActivities] = useState<Record<string, Record<string, Activity>>>()

  useEffect(() => {
    if (me && me.isAdmin) {
      onValue(ref(db, `activities`), (activitiesSnapshot) => {
        if (!family) return null
        // get family activities
        get(ref(db, `family-users/${family.id}`)).then((usersSnapshot) => {
          const familyActivities = {} as Record<string, Record<string, Activity>>
          usersSnapshot.forEach((user) => {
            activitiesSnapshot.forEach((activityUser) => {
              const activityUserId = activityUser.key
              const userId = user.key
              if (activityUserId && activityUserId === userId) {
                familyActivities[activityUserId] = activitiesSnapshot.val()[activityUserId]
              }
            })
          })
          console.log(`familyActivities:`, familyActivities)
          setAllActivities(familyActivities)
        })
      })
    }
    if (me && !me.isAdmin) {
      onValue(ref(db, `activities/${me.id}`), (snapshot) => {
        setActivities(snapshot.val())
        console.log(`activities:`, snapshot.val())
      })
    }
  }, [me, family])

  return { activities, allActivities }
}

export const Admin = ({
  me,
  family,
  allActivities,
}: {
  me: User
  family: Family
  allActivities: Record<string, Record<string, Activity>>
}) => {
  return (
    <div>
      <div>{`me: ${me.id} family: ${family.id} isAdmin:${me.isAdmin ? 'true' : 'false'}`}</div>

      {Object.entries(allActivities).map(
        ([userId, activities]: [string, Record<string, Activity>]) => {
          const number = Object.entries(activities).length
          // for (let i=0; i<number; i++){
          const activityName = Object.entries(activities)[0][0]
          const activityDetails = Object.entries(activities)[0][1]
          return (
            <div
              key={userId}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}
            >
              <div>{`state: ${String(activityDetails.state).toUpperCase()}`}</div>
              <p>
                {`userId: ${userId} activity: ${activityName} status: ${activityDetails.state}`}{' '}
              </p>
              <button
                disabled={activityDetails.state !== 'asking'}
                onClick={() => setActivityState(activityDetails, 'running')}
              >
                Accept to START
              </button>
            </div>
          )
          // } // for loop
        }
      )}
    </div>
  )
}

export const MyActivities = ({
  me,
  family,
  activities,
}: {
  me: User
  family: Family
  activities: Record<string, Activity>
}) => {
  return (
    <div>
      <div>{`me: ${me.id} family: ${family.id}`}</div>
      {Object.entries(activities).map(([_, activity]: [string, Activity]) => {
        return <ActivitySummary key={me.id} activity={activity} />
      })}
    </div>
  )
}

const App = () => {
  const me = useMe(noa, beauvoisFamilly)
  // const me = useMe(papa, beauvoisFamilly)
  useDBFeed(me, undefined)
  useInitDB(me)
  const family = useListener(me, `user-family/${me ? me.id : ''}`)

  // TODO: rename allActivities to familyActivities
  const { activities, allActivities } = useActivities(me, family)

  if (!me) return null
  if (!family) return null

  if (me.isAdmin) {
    if (!allActivities) return null
    return <Admin me={me} family={family} allActivities={allActivities} />
  } else {
    if (!activities) return null
    return <MyActivities me={me} family={family} activities={activities} />
  }
}

const container = document.getElementById('app')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
