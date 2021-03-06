import React, { EventHandler, SyntheticEvent, useEffect, useState } from 'react'
import { fromUnixTime } from 'date-fns'
import { onValue, ref } from 'firebase/database'
import { useMachine } from '@xstate/react'

import type { User, Activity, ActivityModifier } from './Types'
import { activityMachine } from './timerMachine'
import { db } from './firebase'

export type ActivitySummaryProps = {
  activity: Activity
  penalties: ActivityModifier[]
}
export type AdminProps = {
  user: User
  duration: number
  onChange: EventHandler<SyntheticEvent>
  onReset: EventHandler<SyntheticEvent>
  onPenalty: EventHandler<SyntheticEvent>
}

const hasAdminRole = (user: User) => true

export const Admin = (props: AdminProps) => {
  if (!hasAdminRole(props.user)) return null
  return (
    <>
      <label>
        <span>Duration:</span>
        <input type="range" min={0} max={30} value={props.duration} onChange={props.onChange} />
      </label>
      <button onClick={props.onReset}>Reset</button>
      <br></br>
      <button onClick={props.onPenalty}>Add Penalty</button>
    </>
  )
}

export const useInitMachine = (activity: Activity) => {
  const [machineState, send] = useMachine(activityMachine)

  const { elapsed, duration } = machineState.context

  const isSyncRequired = activity.state !== machineState.value
  const isActivityAskedDb = activity.state === 'asking'
  const isActivityPausedDb = activity.state === 'paused'
  const { user, task } = activity

  const askForStarting = () => {
    send('ASK', { value: { ...activity, state: 'asking' } })
  }
  const handleChangeDuration = (e) => {
    send('UPDATE_DURATION', { duration: +e.target.value })
  }
  const handleResetElapsed = () => {
    send('RESET_ELAPSED')
  }
  const handlePenalty = () => {
    send('ADD_PENALTY')
  }

  // Only fired when loaded
  useEffect(() => {
    if (activity) {
      // console.log('onLoad machine state:', machineState.value)
      // console.log('onLoad machine context:', machineState.context)
      // console.log('activity:', activity)

      // Case of rehydration when user reload the app
      if (isSyncRequired) {
        switch (activity.state) {
          case 'initialized':
            send('INIT', { value: { ...activity, state: 'initialized' } })
            break
          case 'asking':
            send('ASK', { value: { ...activity, state: 'asking' } })
            break
          case 'running':
            send('ACCEPT', { value: { ...activity, state: 'running' } })
            break
          case 'paused':
            console.log('onLoad paused')
            send('PAUSE', {
              value: {
                activity,
                duration: activity.task.duration, // TODO: Apply penalties
                elapsed: activity.task.duration,
                interval: 0.1,
              },
            })
            break

          default:
            break
        }
      } else {
        // Case of initialization of the app
        send('INIT', { value: { ...activity, state: 'initialized' } })
      }
    }
  }, [])

  return {
    user,
    task,
    machineState,
    elapsed,
    duration,
    isActivityAskedDb,
    isActivityPausedDb,
    askForStarting,
    handleChangeDuration,
    handleResetElapsed,
    handlePenalty,
  }
}

export const usePenalties = (activity: Activity) => {
  const [penalties, setPenalties] = useState<Record<string, Activity>>()

  useEffect(() => {
    if (activity) {
      onValue(ref(db, `activity-activitymodifiers`), (penaltiesSnapshot) => {
        console.log('???? penaltiesSnapshot', penaltiesSnapshot.val())
        if (!activity) return null
        setPenalties(penaltiesSnapshot.val())
      })
    }
  }, [activity])

  return { penalties }
}

const ActivitySummary = ({ activity }: ActivitySummaryProps) => {
  const {
    user,
    task,
    machineState,
    elapsed,
    duration,
    isActivityAskedDb,
    isActivityPausedDb,
    askForStarting,
    handleChangeDuration,
    handleResetElapsed,
    handlePenalty,
  } = useInitMachine(activity)

  const { penalties } = usePenalties(activity)

  const startOfTomorrow = fromUnixTime(activity.startOfTomorrow / 1000)

  return (
    <section>
      <label style={{ textAlign: 'center', fontSize: 32 }}>{user.username || 'unkown'}</label>
      <span style={{ textAlign: 'center', fontSize: 28 }}>
        {task.name || 'unkown task name'}
        <span> {duration.toFixed(1)}</span>
      </span>
      <label>
        <div>
          {'state: '}
          <span style={{ color: 'gray' }}>{String(machineState.value).toUpperCase()}</span>
        </div>
        <div>
          {'   startOfTomorrow: '}
          <span style={{ color: 'gray' }}>
            {startOfTomorrow.toLocaleString('fr-fr', { formatMatcher: 'best fit' })}
          </span>
        </div>
        <div>
          {'activity state: '}
          <span style={{ color: 'gray' }}>
            {String(machineState.context.activity.state).toUpperCase()}
          </span>
        </div>
        <div>
          {'db state: '}
          <span style={{ color: 'gray' }}>{String(activity.state).toUpperCase()}</span>
        </div>
        <output>
          {elapsed.toFixed(1)}s / {duration.toFixed(2)}s
        </output>
        <progress max={duration} value={elapsed} />
      </label>
      <button disabled={isActivityAskedDb || isActivityPausedDb} onClick={askForStarting}>
        Ask for START
      </button>
      <Admin
        user={user}
        duration={duration}
        onChange={handleChangeDuration}
        onReset={handleResetElapsed}
        onPenalty={handlePenalty}
      />
    </section>
  )
}

export { ActivitySummary }
