import { activityMachine } from './timerMachine'

it('should eventually reach "success"', (done) => {
  let userAlerted = false

  const mockActivityMachine = activityMachine.withConfig({
    services: {
      clock: (context) => (cb) => {
        const interval = setInterval(() => {
          cb('TICK')
        }, 100 * context.interval)

        return () => {
          clearInterval(interval)
        }
      },
    },

    onStateChange: (context, event, { src }) => (cb, _onEvent) => {
      console.log('onStateChange:', context, event, src)

      // const newActivity = { ...context.activity, state: src.state }

      // if (newActivity.id) {
      //   cb({ type: 'UPDATE_ACTIVITY', value: newActivity })
      //   setActivityState(newActivity, src.state)
      //   if (src.state === 'newday') {
      //     const newStartOfTomorrow = getStartOfTomorrow()
      //     const newStartForActivity = { ...context.activity, startOfTomorrow: newStartOfTomorrow }
      //     cb({ type: 'START_ACTIVITY', value: newStartForActivity })
      //     setActivityState(newActivity, src.state)
      //   }
      // }
    },
  })

  const mock = interpret(mockActivityMachine).onTransition((state) => {
    console.log('🚀 ~ file: tests.js ~ line 39 ~ mock ~ state', state.value)
    if (state.matches('success')) {
      // assert that effects were executed
      expect(userAlerted).toBeTruthy()
      done()
    }
  })

  mock.start()

  //   mock.send({ type: 'ASK' });
})
