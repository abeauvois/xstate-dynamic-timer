import { createMachine } from 'xstate'
import { assign } from 'xstate/lib/actions'
// import { createModel } from 'xstate/lib/model'

import { getStartOfTomorrow } from './utils'
import { setActivityState } from './firebaseActions'
import { Activity, Task, User } from './Types'

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
      duration: number
    }
  | {
      type: 'INCREASE_DURATION'
      duration: number
    }
  | {
      type: 'RESET_ELAPSED'
      value: Activity
    }
  | {
      type: 'UPDATE_ACTIVITY'
      value: Activity
    }
  | {
      type: 'RESTART_ACTIVITY'
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

const activityMachine = createMachine<
  ActivityMachineContext,
  ActivityMachineEvents,
  ActivityMachineStates
>(
  {
    context: {
      activity: {
        id: '',
        state: 'idle',
        startOfTomorrow: getStartOfTomorrow(),
        user: { id: '', username: '' },
        task: { id: '', name: '', duration: 0 },
      },
      elapsed: 0,
      duration: 5,
      interval: 0.1,
    },
    id: 'userTask',
    initial: 'idle',
    states: {
      idle: {
        invoke: {
          src: {
            type: 'onStateChange',
            state: 'idle',
          },
        },
        on: {
          INIT: {
            actions: assign({
              activity: (_context, event) => event.value,
            }),
            target: 'initialized',
          },
          ASK: {
            actions: assign({
              activity: (_context, event) => event.value,
            }),
            target: 'asking',
          },
          ACCEPT: {
            actions: assign({
              activity: (_context, event) => event.value,
            }),
            target: 'running',
          },
        },
      },
      initialized: {
        invoke: {
          src: {
            type: 'onStateChange',
            state: 'initialized',
          },
        },
        on: {
          ASK: {
            target: 'asking',
          },
          ACCEPT: {
            target: 'initialized',
            actions: assign({
              activity: (_context, event) => event.value,
            }),
          },
          START: {
            actions: 'RESTART_ACTIVITY',
            target: 'running',
          },
        },
      },
      asking: {
        invoke: {
          src: {
            type: 'onStateChange',
            state: 'asking',
          },
        },
        on: {
          ACCEPT: {
            target: 'initialized',
          },
          UPDATE_DURATION: {
            actions: ['updateDuration', (context, event) => console.log(event)],
            target: 'asking',
          },
        },
      },
      newday: {
        invoke: {
          src: {
            type: 'onStateChange',
            state: 'newday',
          },
        },
        on: {
          START: {
            actions: 'RESTART_ACTIVITY',
            target: 'running',
          },
        },
      },
      running: {
        invoke: [
          {
            src: 'clock',
          },
          {
            src: {
              type: 'onStateChange',
              state: 'running', // context activity state (src)
            },
          },
        ],
        always: [
          {
            cond: (context) => context.elapsed >= context.duration,
            target: 'paused',
          },
        ],

        on: {
          TICK: [
            {
              actions: ['incrementElapsed'],
              target: 'running',
              cond: (context) => Date.now() < context.activity.startOfTomorrow,
            },
            {
              actions: [
                'incrementElapsed',
                (context) => console.log('Machine running elapsed', context.elapsed, new Date()),
              ],
              target: 'newday',
              cond: (context) => Date.now() > context.activity.startOfTomorrow,
            },
          ],
        },
      },
      paused: {
        invoke: {
          src: {
            type: 'onStateChange',
            state: 'paused',
          },
        },
        always: [
          {
            cond: (context) => context.elapsed < context.duration,
            target: 'running',
          },
          {
            actions: (context) => console.log('Machine paused elapsed', context.elapsed),
            cond: (context) => Date.now() > context.activity.startOfTomorrow,
            target: 'newday',
          },
        ],
      },
    },
    on: {
      RESET_ELAPSED: {
        actions: assign({
          elapsed: (context, event) => 0,
        }),
      },
      UPDATE_ACTIVITY: {
        actions: assign({
          activity: (_context, event) => event.value,
        }),
      },
      RESTART_ACTIVITY: {
        actions: assign<ActivityMachineContext>({
          activity: (context, event) => ({
            ...context.activity,
            startOfTomorrow: getStartOfTomorrow(),
          }),
          elapsed: 0,
        }),
      },
    },
  },
  {
    actions: {
      incrementElapsed: assign({
        elapsed: (context) => +(context.elapsed + context.interval).toFixed(2),
      }),
      updateDuration: assign({
        duration: (context, event) => context.duration + 2, //event.duration,
      }),
    },
    services: {
      clock: (context) => (cb) => {
        console.log('Machine clock starting...', context.elapsed, new Date())
        const interval = setInterval(() => {
          console.log('Machine clock next tick', context.elapsed, new Date())
          cb('TICK')
        }, 1000 * context.interval)

        return () => {
          clearInterval(interval)
        }
      },
      onStateChange:
        (context, event, { src }) =>
        (cb, _onEvent) => {
          console.log('onStateChange:', context, event, src)

          const newActivity = { ...context.activity, state: src.state }

          if (newActivity.id) {
            cb({ type: 'UPDATE_ACTIVITY', value: newActivity })
            setActivityState(newActivity, src.state)
            if (src.state === 'newday') {
              const newStartOfTomorrow = getStartOfTomorrow()
              const newStartForActivity = {
                ...context.activity,
                startOfTomorrow: newStartOfTomorrow,
              }
              cb({ type: 'RESTART_ACTIVITY', value: newStartForActivity })
              setActivityState(newActivity, src.state)
            }
          }
        },
    },
  }
)

export { activityMachine }
export type { ActivityMachineContext, ActivityMachineEvents, ActivityMachineStates }

//  context.t.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
