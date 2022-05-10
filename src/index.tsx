import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { db, onValue, push, ref, get, child } from './firebase'

import './styles.css'

import type { Effect, Family, Task, User } from './Types'
import { Activity } from './Activity'
import { update } from 'firebase/database'

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

const askStartTask = (user: User, task: Task) => {
  const updates = {} as Record<string, any>

  const updatedTask: Task = {...task, state: 'asking'}

  updates[`/tasks/${task.id}`] = updatedTask
  updates[`/user-tasks/${user.id}/${task.id}`] = updatedTask

  return update(ref(db), updates)
}
const acceptStartTask = (user: User, task: Task) => {
  const updates = {} as Record<string, any>

  const updatedTask = {...task, state: 'running'}

  updates[`/tasks/${task.id}`] = updatedTask
  updates[`/user-tasks/${user.id}/${task.id}`] = updatedTask

  return update(ref(db), updates)
}

const App = () => {
  const [me, setMe] = useState<User>()
  const [userFamily, setUserFamily] = useState<Record<string, Family['id']>>()
  const [userTasks, setUserTasks] = useState<Record<string, Task>>()
  const [myTasksEffects, setMyTasksEffects] = useState<Record<string, Task>>()

  useEffect(() => {
    setMe(() => ({ id: 'noa', username: 'noa' }))
  }, [])

  useEffect(() => {
    if (me) {
      onValue(ref(db, `user-tasks/${me.id}`), (snapshot) => {
        setUserTasks(snapshot.val())
        console.log(snapshot.val())
      })
      onValue(ref(db, `user-family/${me.id}`), (snapshot) => {
        setUserFamily(snapshot.val())
        console.log(snapshot.val())
      })
      onValue(ref(db, `users-tasks-effects/${me.id}`), (snapshot) => {
        setMyTasksEffects(snapshot.val())
        console.log(snapshot.val())
      })
    }
  }, [me])

  if (!me) return null
  if (!userTasks) return null
  if (!userFamily) return null
  return (
    <div>
      <div>{`me: ${me.id} family: ${Object.keys(userFamily)[0]}`}</div>

      {/* <button onClick={() => send("START")}>Ask for START</button> */}

      {Object.entries(userTasks)
        .map(([taskKey, task]: [string, any]) => (
          <>
          <button onClick={() => acceptStartTask(me,task)}>accept to START</button>
          <Activity key={me.id} user={me} task={task} hasAdminStarted={task.state === 'running'} onAskStart={askStartTask}/>
          </>
        ))}
    </div>
  )
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
