import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { db, onValue, ref } from './firebase'

import './styles.css'

import type { Activity, Family, Task, User } from './Types'

import { acceptStartTask, addActivity, addMe, askStartTask } from './firebaseActions'
import { Unsubscribe } from 'firebase/database'
import { ActivitySummary } from './ActivitySummary'

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
      addMe(user, family)
      setMe(() => user)
    }
  }, [])
  return me
}

export const useDBFeed = (user: User | undefined, family: Family | undefined, task?: Task) => {
  useEffect(() => {
    if (user && task && family) {
      addActivity(user, family, task)
    }
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

export const Admin = ({ me, family, allActivities }: { me: User, family: Family, allActivities: Record<string, Record<string, Activity>> }) => {

  return (
    <div>
      <div>{`me: ${me.id} family: ${family.id} isAdmin:${me.isAdmin ? 'true' : 'false'}`}</div>

      {Object.entries(allActivities)
        .map(([userId, activities]: [string, Record<string, Activity>]) => {
          const number = Object.entries(activities).length
          // for (let i=0; i<number; i++){
          const activityName = Object.entries(activities)[0][0]
          const activityDetails = Object.entries(activities)[0][1]
          return (
            <div key={userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}  >
              <p>{`userId: ${userId} activity: ${activityName} status: ${activityDetails.state}`} </p>
              <button disabled={activityDetails.state !== 'idle'} onClick={() => acceptStartTask(activityDetails)}>Accept to START</button>
            </div>
          )
          // } // for loop
        })}
    </div>
  )
}

export const MyActivities = ({ me, family, activities }: { me: User, family: Family, activities: Record<string, Activity> }) => {
  return (
    <div>
      <div>{`me: ${me.id} family: ${family.id}`}</div>
      {Object.entries(activities)
        .map(([_, activity]: [string, Activity]) => {
          return (
          <ActivitySummary key={me.id} activity={activity}  onAskStart={askStartTask} />
        )
      }
      )}
    </div>
  )
}

const App = () => {
  const [activities, setActivities] = useState<Record<string,  Activity>>()
  const [allActivities, setAllActivities] = useState<Record<string, Record<string, Activity>>>()
  const me = useMe({ id: 'noa', username: 'noa' }, { id: 'beauvois', name: 'beauvois' })
  // const me = useMe({ id: 'papa', username: 'papa', isAdmin: true }, { id: 'beauvois', name: 'beauvois' })
  useDBFeed(me, undefined)
  useDBFeed({ id: 'noa', username: 'noa' }, { id: 'beauvois', name: 'beauvois' }, { id: 'gaming', name: 'gaming', duration: 5 })

  const family = useListener(me, `user-family/${me ? me.id : ''}`)

  useEffect(() => {
    if (me && me.isAdmin) {
      onValue(ref(db, `activities`), (snapshot) => {
        setAllActivities(snapshot.val())
        console.log(`AllActivities:`, snapshot.val())
      })
    }
    if (me && !me.isAdmin) {
      onValue(ref(db, `/activities/${me.id}`), (snapshot) => {
        setActivities(snapshot.val())
        console.log(`activities:`, snapshot.val())
      })
    }
  }, [me])

  // const effects = useListener(me, `activity-effects/${activity.id}`)

  if (!me) return null
  if (!family) return null
  
  if (me.isAdmin) {
    if (!allActivities) return null
    return (
      <Admin me={me} family={family} allActivities={allActivities} />
      )
    } else {
    if (!activities) return null
    return (
      <MyActivities me={me} family={family} activities={activities} />
    )
  }
}

const container = document.getElementById('app')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript
root.render(<App />)