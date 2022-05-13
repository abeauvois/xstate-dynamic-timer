import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { db, onValue, ref } from './firebase'

import './styles.css'

import type { Activity, Family, Task, User } from './Types'

import { acceptStartTask, addActivity, addMe, askStartTask } from './firebaseActions'
import { Unsubscribe } from 'firebase/database'
import { ActivitySummary } from './Activity'

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
  const [value, setValue] = useState<Record<string, any>>()

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

export const Admin = ({ me, family, activities }: { me: User, family: Family, activities: Record<string, Record<string, Activity>> }) => {


  return (
    <div>
      <div>{`me: ${me.id} family: ${family.id} isAdmin:${me.isAdmin ? 'true' : 'false'}`}</div>

      {Object.entries(activities)
        .map(([userId, activity]: [string, Record<string, Activity>]) => {
          const activityNumber = Object.entries(activity).length
          // for (let i=0; i<activityNumber; i++){
          const activityName = Object.entries(activity)[0][0]
          const activityDetails = Object.entries(activity)[0][1]
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


const App = () => {
  const [activities, setActivities] = useState<Record<string, Record<string, Activity>>>()
  // useMe({ id: 'noa', username: 'noa' }))
  const me = useMe({ id: 'papa', username: 'papa', isAdmin: true }, { id: 'beauvois', name: 'beauvois' })
  useDBFeed(me, undefined)
  useDBFeed({ id: 'noa', username: 'noa' }, { id: 'beauvois', name: 'beauvois' }, { id: 'gaming', name: 'gaming', duration: 5 })

  const userFamily = useListener(me, `user-family/${me ? me.id : ''}`)

  useEffect(() => {
    if (me && me.isAdmin) {
      onValue(ref(db, `activities`), (snapshot) => {
        setActivities(snapshot.val())
        console.log(`activities:`, snapshot.val())
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
  if (!userFamily) return null
  if (!activities) return null

  const family = Object.values(userFamily)[0]

  if (me.isAdmin) {
    return (
      <Admin me={me} family={family} activities={activities} />
    )
  } else {
    return (
      <div>
        <div>{`me: ${me.id} family: ${family}`}</div>

        {/* <button onClick={() => send("START")}>Ask for START</button> */}

        {Object.entries(activities)
          .map(([taskKey, task]: [string, any]) => (
            <ActivitySummary key={me.id} user={me} task={task} hasAdminStarted={task.state === 'running'} onAskStart={askStartTask} />
          ))}
      </div>
    )
  }
}

const container = document.getElementById('app')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript
root.render(<App />)

// useEffect(() => {
//   onValue(ref(db, `users/`), (snapshot) => {
//     setUsers(snapshot.val())
//     console.log(snapshot.val())
//   })
//   // get(child(dbRef, `users/${'noa'}`))
//   //   .then((snapshot) => {
//   //     if (snapshot.exists()) {
//   //       console.log(snapshot.val())
//   //     } else {
//   //       console.log('No data available')
//   //     }
//   //   })
//   //   .catch((error) => {
//   //     console.error(error)
//   //   })
// }, [])