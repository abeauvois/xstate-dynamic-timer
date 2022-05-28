import { addMinutes } from 'date-fns'
import { interpret } from 'xstate'
import { activityMachine, ActivityMachineContext } from './timerMachine'
import { Activity } from './Types'

let activity: Activity = {
  id: 'a1',
  state: 'idle',
  startOfTomorrow: addMinutes(new Date(), 1).getTime(),
  user: { id: '', username: '' },
  task: { id: '', name: '', duration: 5 },
}

it('should be "idle"', (done) => {
  const mock = interpret(activityMachine).onTransition((state: any) => {
    if (state.matches('idle')) {
      expect(activityMachine.context.elapsed).toBe(0)
      done()
    }
  })

  mock.start()
})

it('should be "initialized"', (done) => {
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
      done()
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
})

it('should be "asking"', (done) => {
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
    if (state.matches('asking')) {
      expect(context.elapsed).toBe(0)
      expect(context.activity.id).toBe('a1')
      done()
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
})

it('should be "running"', (done) => {
  const handleStateChange = () => {}

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
    console.log('🚀 ~ activityMachine.context', context, state.value)
    if (state.matches('running') && context.elapsed > 0) {
      expect(context.elapsed).toBe(0.1)
      expect(context.activity.id).toBe('a1')
      done()
    }
  })

  mock.start()
  mock.send('INIT', { value: { ...activity, state: 'initialized' } })
  mock.send('ASK', { value: { ...activity, state: 'asking' } })
  mock.send('ACCEPT', { value: { ...activity, state: 'running' } })
  mock.send('TICK')
})
