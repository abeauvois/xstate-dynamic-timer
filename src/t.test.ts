import { addMinutes } from 'date-fns'
import { interpret } from 'xstate'
import { activityMachine, ActivityMachineContext } from './timerMachine'
import { Activity } from './Types'

let activity: Activity = {
  id: 'a1',
  state: 'idle',
  startOfTomorrow: addMinutes(new Date(), 1).getTime(),
  user: { id: '', username: '' },
  task: { id: '', name: '', duration: 0 },
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
  // const mockActivityMachine = activityMachine.withContext({
  //     activity,
  //     elapsed: 0,
  //     duration: 5,
  //     interval: 0.1,
  // })
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
