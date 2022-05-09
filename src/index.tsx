import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { db, onValue, push, ref, get, child } from './firebase'

import './styles.css'

import { Activity } from './Activity'

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

const App = () => {
  useEffect(() => {
    // onValue(ref(db, '/users/' + 'noa'), (snapshot) => {
    //   console.log(snapshot.val())
    // })
    get(child(dbRef, `users/${'noa'}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val())
        } else {
          console.log('No data available')
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])
  return (
    <>
      <Activity user={{ username: 'Noa Judoka' }} task={{ name: 'Gaming', duration: 5 }} />
      <Activity user={{ username: 'Leo Delaho' }} task={{ name: 'Gaming', duration: 5 }} />
    </>
  )
}

const container = document.getElementById('app')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript
root.render(<App />)
