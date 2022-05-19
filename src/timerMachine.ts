import { createMachine } from 'xstate'
import { assign } from 'xstate/lib/actions'
import { createModel } from 'xstate/lib/model'

import { setActivityState } from './firebaseActions'
import { Activity, Task, User } from './Types'

// const fetchUser = (userId: string) =>
//   fetch(`url/to/user/${userId}`).then((response) => response.json())

// const userTaskModel = createModel(
//   {
//     activity: { id: '', state: 'init', user: {} as User, task: {} as Task },
//     elapsed: 0,
//     duration: 5,
//     interval: 0.1,
//   },
//   {
//     events: {
//       updateDuration: (duration: number) => ({ duration }),
//       increaseDuration: (duration: number) => ({ duration }),
//       TICK: (value: number) => ({ value }), // TODO: call callback (firebase)
//       INIT: (activity: Activity) => ({ activity }),
//       ASK: (activity: Activity) => ({ activity }),
//       ACCEPT: (value: number) => ({ value }),
//       START: (value: number) => ({ value }),
//       resetElapsed: (value: number) => ({ value }),
//       // onStateChange: (context: any, event: { type: string; activity: Activity }) => ({
//       //   activity: event.activity,
//       // }),
//     },
//   }
// )

type ActivityMachineEvents =
  | {
      type: 'INIT'
      value: Activity
    }
  | {
      type: 'ASK'
      value: Activity
    }
  | {
      type: 'ACCEPT'
      value: Activity
    }
  | {
      type: 'START'
      value: Activity
    }
  | {
      type: 'UPDATE_DURATION'
      value: Activity
    }
  | {
      type: 'INCREASE_DURATION'
      value: Activity
    }
  | {
      type: 'RESET_ELAPSED'
      value: Activity
    }
  | {
      type: 'TICK'
      value: Activity
    }

type ActivityMachineContext = {
  activity: Activity
  elapsed: number
  duration: number
  interval: number
}

type ActivityMachineStates =
  | { type: 'INIT'; value: 'initialized'; context: ActivityMachineContext }
  | { type: 'ASK'; value: 'asking'; context: ActivityMachineContext }
  | { type: 'ACCEPT'; value: 'accepted'; context: ActivityMachineContext }
  | { type: 'UPDATE_DURATION'; value: 'running'; context: ActivityMachineContext }

const userTaskMachine = createMachine<
  ActivityMachineContext,
  ActivityMachineEvents,
  ActivityMachineStates
>(
  {
    id: 'userTask',
    initial: 'initialized',
    context: {
      activity: {
        id: '',
        state: 'idle',
        user: { id: '', username: '' },
        task: { id: '', name: '', duration: 0 },
      },
      elapsed: 0,
      duration: 5,
      interval: 0.1,
    },

    states: {
      idle: {
        on: {
          INIT: {
            target: 'initialized',
            actions: assign({
              activity: (_context, event) => event.value,
            }),
          },
        },
      },
      initialized: {
        on: {
          ASK: {
            target: 'asking',
            actions: assign({
              activity: (_context, event) => event.value,
            }),
          },
        },
      },
      asking: {
        invoke: {
          id: 'onStateChange',
          src: (context, event) => (cb, _onEvent) => {
            console.log('onStateChange:', context, event)
            setActivityState(event.value, event.value.state).then(() => {
              switch (event.value.state) {
                case 'running':
                  cb({ type: 'ACCEPT', value: event.value })

                  break

                default:
                  break
              }
            })
          },
        },
        on: {
          ACCEPT: 'running',
        },
      },
      newday: {
        on: {
          START: 'running',
        },
      },
      running: {
        invoke: {
          src: 'clock',
        },
        always: {
          target: 'paused',
          cond: (context) => {
            return context.elapsed >= context.duration
          },
        },
        on: {
          TICK: {
            actions: assign({
              elapsed: (context) => +(context.elapsed + context.interval).toFixed(2),
            }),
          },
        },
      },
      paused: {
        invoke: {
          src: 'onStateChange',
        },
        always: {
          target: 'running',
          cond: (context) => context.elapsed < context.duration,
        },
      },
    },
    on: {
      UPDATE_DURATION: {
        actions: assign({
          duration: (_, event) => event.value.task.duration,
        }),
      },
      INCREASE_DURATION: {
        actions: assign({
          duration: (context, event) => context.duration + event.value.task.duration,
        }),
      },
      RESET_ELAPSED: {
        actions: assign({
          elapsed: (context, event) => 0,
        }),
      },
    },
  },
  {
    // actions: {
    //   // initActivity: (context, event) => {
    //   //   console.log('initActivity', context, event)
    //   //   context.activity = event.activity
    //   // },

    //   askStartTask: (context, event) => {
    //     console.log('askStartTask', context, event)
    //     return { activity: event }
    //   },
    // },
    services: {
      clock: (context) => (cb) => {
        const interval = setInterval(() => {
          cb('TICK')
        }, 1000 * context.interval)

        return () => {
          clearInterval(interval)
        }
      },
    },
  }
)

export { userTaskMachine }
