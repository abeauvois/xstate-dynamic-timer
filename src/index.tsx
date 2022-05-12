import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { db, onValue, ref } from './firebase'

import './styles.css'

import type { Family, Task, User } from './Types'
import { Activity } from './Activity'

import { acceptStartTask, addActivity, askStartTask } from './firebaseActions'
import { Unsubscribe } from 'firebase/database'

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


export const useMe = (user: User) => {
  const [me, setMe] = useState<User>()
  useEffect(() => {
    setMe(() => user)
  }, [])
  return me
}

export const useDBFeed = (user: User | undefined, family: Family | undefined, task?: Task) => {
  useEffect(() => {
    if (user && task && family) {
      addActivity(user, family, task)
    }
  }, [user])
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

const App = () => {
  const [activities, setActivities] = useState<Record<string, Task>>()

  // useMe({ id: 'noa', username: 'noa' }))
  const me = useMe({ id: 'papa', username: 'papa', isAdmin: true })
  useDBFeed(me, undefined)
  useDBFeed({ id: 'noa', username: 'noa' }, { id: 'beauvois', name: 'beauvois' }, { id: 'gaming', name: 'gaming', duration: 5 })

  const userFamily = useListener(me, `user-family/${me ? me.id : ''}`)

  // useEffect(() => {
  //   if (me && me.isAdmin) {
  //     onValue(ref(db, `activities`), (snapshot) => {
  //       setActivities(snapshot.val())
  //       console.log(`activities:`, snapshot.val())
  //     })
  //   }
  // }, [me])

  // const effects = useListener(me, `activity-effects/${activity.id}`)

  if (!me) return null
  if (!userFamily) return null
  if (!activities) return null

  if (me.isAdmin) {
    return (
      <div>
        <div>{`me: ${me.id} family: ${Object.keys(userFamily)[0]} isAdmin:${me.isAdmin ? 'true' : 'false'}`}</div>

        {Object.entries(activities)
          .map(([activityKey, activity]: [string, any]) => (
            <>
              <div key={me.id} >
                <p>{`userId: ${me.id} activity: ${activity.name}`} </p>
                <button onClick={() => acceptStartTask(activity)}>Accept to START</button>
              </div>
            </>
          ))}
      </div>
    )
  } else {
    return (
      <div>
        <div>{`me: ${me.id} family: ${Object.keys(userFamily)[0]}`}</div>

        {/* <button onClick={() => send("START")}>Ask for START</button> */}

        {Object.entries(activities)
          .map(([taskKey, task]: [string, any]) => (
            <Activity key={me.id} user={me} task={task} hasAdminStarted={task.state === 'running'} onAskStart={askStartTask} />
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