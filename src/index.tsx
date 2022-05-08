import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

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

const App = () => {
  return (
    <>
      <Activity user={{ username: 'Noa Judoka' }} task={{ name: 'Gaming', duration: 5 }} />
      <Activity user={{ username: 'Leo Delaho' }} task={{ name: 'Gaming', duration: 5 }} />
    </>
  )
}

// const rootElement = document.getElementById('root')
// ReactDOM.render(<App />, rootElement)

const container = document.getElementById('app')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript
root.render(<App />)
