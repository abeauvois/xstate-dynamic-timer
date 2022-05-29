import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { addMinutes } from 'date-fns'
import { interpret } from 'xstate'

import { activityMachine, ActivityMachineContext } from './timerMachine'
import { Activity } from './Types'

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

const mockFn = vi.fn(() => console.log('executed'))

it('should be "idle"', async () => {
  const mock = interpret(activityMachine).onTransition((state: any) => {
    if (state.matches('idle')) {
      expect(activityMachine.context.elapsed).toBe(0)
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

  const mock = interpret(mockActivityMachine).onTransition((state) => {
    const context = state.context as ActivityMachineContext
    // console.log('🚀 ~ activityMachine.context', state)
    if (state.matches('initialized')) {
      expect(context.elapsed).toBe(0)
      expect(context.activity.id).toBe('a1')
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
})

it('should be "asking"', async () => {
  const mockActivityMachine = activityMachine.withConfig({
    services: {
      onStateChange: (context, event) => (cb: any, _onEvent: any) => {
        console.log('onStateChange', event)
      },
    },
  })

  const mock = interpret(mockActivityMachine).onTransition((state) => {
    const context = state.context as ActivityMachineContext
    if (state.matches('asking')) {
      expect(context.elapsed).toBe(0)
      expect(context.activity.id).toBe('a1')
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
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

  const mock = interpret(mockActivityMachine).onTransition((state) => {
    const context = state.context as ActivityMachineContext
    if (state.matches('running') && context.elapsed > 0) {
      expect(context.elapsed).toBe(0.1)
      expect(context.activity.id).toBe('a1')
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
  mock.send('ACCEPT', { value: { ...activity, state: 'running' } })
  mock.send('TICK')
})
