import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { addMinutes, format, formatDistance, formatDistanceStrict, formatISO } from 'date-fns'
import { interpret } from 'xstate'

import { activityMachine, ActivityMachineContext } from './timerMachine'
import { Activity } from './Types'

// comment below is necessary to make the tests work
/**
 * @vitest-environment jsdom
 */

let activity: Activity = {
  id: 'a1',
  state: 'idle',
  startOfTomorrow: addMinutes(new Date(), 1).getTime(),
  user: { id: '', username: '' },
  task: { id: '', name: '', duration: 5 },
}

const mockFn = vi.fn(() => console.log('mockFn executed'))

it('should be "idle"', async () => {
  const mock = interpret(activityMachine).onTransition((state: any) => {
    if (state.matches('idle')) {
      expect(activityMachine.context.elapsed).toBe(0)
    } else {
      expect('true').toBe(false)
    }
  })

  mock.start()
})

it('should be "initialized"', async () => {
  const mockActivityMachine = activityMachine.withConfig({
    services: {
      onStateChange: (context, event) => (cb: any, _onEvent: any) => {
        console.log('onStateChange', event)
      },
    },
  })

  const mock = interpret(mockActivityMachine).onTransition((state, event) => {
    const context = state.context as ActivityMachineContext
    // console.log('🚀 ~ activityMachine.context', state.value, state.context)

    switch (event.type) {
      case 'xstate.init':
        expect(state.value).toBe('idle')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe('')
        break
      case 'INIT':
        expect(state.value).toBe('initialized')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break

      default:
        expect('true').toBe(false)
        break
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
})

it('should be "running"', async () => {
  const handleStateChange = mockFn as any //TODO FIX

  const mockActivityMachine = activityMachine.withConfig({
    services: {
      clock: handleStateChange,
      onStateChange: (context, event) => (cb: any, _onEvent: any) => {
        console.log('onStateChange', event)
      },
    },
  })

  const mock = interpret(mockActivityMachine).onTransition((state, event) => {
    const context = state.context as ActivityMachineContext
    // console.log('🚀 ~ activityMachine.context', state.value, state.context)

    switch (event.type) {
      case 'xstate.init':
        expect(state.value).toBe('idle')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe('') // from withContext()
        break
      case 'INIT':
        expect(state.value).toBe('initialized')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id) // from INIT
        break
      case 'ASK':
        expect(state.value).toBe('asking')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break
      case 'ACCEPT':
        expect(state.value).toBe('initialized')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break
      case 'START':
        expect(state.value).toBe('running')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break
      case 'TICK':
        if (state.value === 'paused') {
          expect(context.elapsed).toBe(0.3)
          expect(context.activity.id).toBe(activity.id)
        } else {
          if (context.elapsed > 0.2) expect('true').toBe(false)
        }
        break

      case 'UPDATE_ACTIVITY':
      case 'UPDATE_ACTIVITY':
        break
      default:
        expect('true').toBe(false)
        break
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
  mock.send('ACCEPT', { value: { ...activity, state: 'running' } })
  mock.send('TICK')
})

it('should be "paused"', async () => {
  vi.useFakeTimers()

  const mockContextMachine = activityMachine.withContext({
    activity: {
      id: 'a2',
      state: 'idle',
      startOfTomorrow: addMinutes(new Date(), 1).getTime(),
      user: { id: '', username: '' },
      task: { id: '', name: '', duration: 5 },
    },
    elapsed: 0,
    duration: 0.3,
    interval: 0.1,
  })

  const mock = interpret(mockContextMachine).onTransition((state, event) => {
    const context = state.context as ActivityMachineContext
    console.log('🚀 ', event.type, state.value, context.activity.state)
    switch (event.type) {
      case 'xstate.init':
        expect(state.value).toBe('idle')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe('a2') // from withContext()
        break
      case 'INIT':
        expect(state.value).toBe('initialized')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id) // from INIT
        break
      case 'ASK':
        expect(state.value).toBe('asking')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break
      case 'ACCEPT':
        expect(state.value).toBe('initialized')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break
      case 'START':
        expect(state.value).toBe('running')
        expect(context.elapsed).toBe(0)
        expect(context.activity.id).toBe(activity.id)
        break
      case 'TICK':
        if (state.value === 'paused') {
          expect(context.elapsed).toBe(0.3)
          expect(context.activity.id).toBe(activity.id)
        } else {
          if (context.elapsed > 0.2) expect('true').toBe(false)
        }
        break

      case 'UPDATE_ACTIVITY':
      case 'UPDATE_ACTIVITY':
        break
      default:
        expect('true').toBe(false)
        break
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
  mock.send('ACCEPT', { value: { ...activity, state: 'initialized' } })
  mock.send('START', { value: { ...activity, state: 'running' } })
  vi.runAllTimers() // allow service clock to execute
  mock.send('TICK')
})

it('should be "newday"', async () => {
  vi.useFakeTimers()

  const now = new Date()
  const startOfTomorrow = addMinutes(now, 2).getTime()

  console.log(
    'startOfTomorrow =>',
    format(startOfTomorrow, 'MMMM-dd HH:mm:ss'),
    formatDistance(startOfTomorrow, now, { addSuffix: true })
  )

  const a2: Activity = {
    id: 'a2',
    state: 'idle',
    startOfTomorrow,
    user: { id: '', username: '' },
    task: { id: '', name: '', duration: 5 },
  }

  const mockContextMachine = activityMachine.withContext({
    activity: a2,
    elapsed: 0,
    duration: 0.3,
    interval: 0.1,
  })

  // const mock = interpret(mockContextMachine).onTransition((state, event) => {
  //   const context = state.context as ActivityMachineContext
  //   console.log(
  //     event.type,
  //     '🚀 onTransition to:',
  //     `'${state.value}'`,
  //     context.elapsed,
  //     'tomorrow:',
  //     formatDistanceStrict(context.activity.startOfTomorrow, new Date(), { addSuffix: true })
  //   )
  //   switch (event.type) {
  //     case 'xstate.init':
  //       expect(state.value).toBe('idle')
  //       expect(state.value).toBe('newday')
  //       expect(context.elapsed).toBe(0)
  //       expect(context.activity.id).toBe('a2') // from withContext()
  //       break
  //     default:
  //       expect('true').toBe(false)
  //       break
  //   }
  // })

  const mock = interpret(mockContextMachine).onTransition((state, event) => {
    const context = state.context as ActivityMachineContext
    console.log('🚀 ', event.type, state.value, context.activity.state)
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
  mock.send('ACCEPT', { value: { ...activity, state: 'initialized' } })
  mock.send('START', { value: { ...activity, state: 'running' } })
  vi.setSystemTime(addMinutes(now, 3)) // 1 minute after startOfTomorrow
  vi.runAllTimers() // allow service clock to execute
  mock.send('START', { value: { ...activity, state: 'running' } })

  expect(mock.state.value).toBe('running')
})

it('should be "running" after a "newday" + START', async () => {
  vi.useFakeTimers()

  const mockActivityMachine = activityMachine

  const now = new Date()
  const startOfTomorrow = addMinutes(now, 2).getTime()

  console.log(
    'startOfTomorrow =>',
    format(startOfTomorrow, 'MMMM-dd HH:mm:ss'),
    formatDistance(startOfTomorrow, now, { addSuffix: true })
  )

  const a2: Activity = {
    id: 'a2',
    state: 'idle',
    startOfTomorrow,
    user: { id: '', username: '' },
    task: { id: '', name: '', duration: 5 },
  }

  const mockContextMachine = mockActivityMachine.withContext({
    activity: a2,
    elapsed: 0,
    duration: 0.3,
    interval: 0.1,
  })

  const mock = interpret(mockContextMachine).onTransition((state, event) => {
    const context = state.context as ActivityMachineContext
    console.log('🚀 ', event.type, state.value, context.activity.state)
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
  mock.send('ACCEPT', { value: { ...activity, state: 'initialized' } })
  mock.send('START', { value: { ...activity, state: 'running' } })
  vi.setSystemTime(addMinutes(now, 3)) // 1 minute after startOfTomorrow
  vi.runAllTimers() // allow service clock to execute

  expect(mock.state.value).toBe('newday')

  mock.send('START', { value: { ...activity, state: 'running' } })

  expect(mock.state.value).toBe('running')
  expect(mock.state.context.elapsed).toBe(0)
})
