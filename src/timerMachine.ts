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
      type: 'UPDATE_ACTIVITY'
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

const userTaskMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFdZgE4BUCGsDWAdAJYQA2YAxAJIByVmioADgPaxEAuRLAdoyAA9EARgBsABgIAWAOwyAHAE4ZoqVPFSATMoA0IAJ6JRAVmMFj80TOPrxAZkV35mgL4u9qDDnzEylAIIAwoEAogAKDEggrOxcvPxCCGKSsgrKqupaugaIWmaidvbKMtpqDm4eaFi4hEQ8nETYpEQAXpAU-gDKANL8MQ3xUYlOMgSq4laaGXbCwnZSeoYIVmbiaVJOoqLyJa7uIJ7VPjV1UB3B4ZHMbAN8Q4gWdtLWdq-WW8Li8otG1gRrSg2lm2uwqByq3kIPDAAHcINh9BROph-AAlK7RG5xO6gRKPZ7GV52d6iT7fHIIaxSAhKKzCGRiYz0jZgw6QgjoZA8eo8M6YKiBXpRfrYhKIBRmRTGZTGFYKHaaH4IQmKAiKCSKcRTEzCKTGPaVLw1DlcnlnPpY7g4wQPeRPWSEt6y0lfJU2MzCTTCRRzKZAmSKVkQ41MbCeCAUC2xK1i5V2glEklkpVbJ4AxRArYKg3go34CgAVTCABF-JgQgB9YsF1FlqgAeRoUduseJogImhkWq2DKZikUSs7mjVWrshP1mmM4lMoiDebw1BogVRIS6lertf5jebovuCDs23+-YKs2cnypSuE8kl8wzQ6sUilMjnRwXK86IUwFZCABl-GEP2LHcYz3TYaXeawlGMaxpyVRR5DVB9Hw0JR5CUF9IULEsy0rIJ+QANXoABNYDBlxRAnGEEd6THfV5GEGxNDsS89n2HgWAgOB+DZY0SHIUjrUSWQlS0akr21T4pCsOQcx4nw6gaJpWkgATY07MTRE7TVJ01aCNhTAoxlJaULDmfUxAw40Tl5VS9yk1V+xkBwAxMEyxAMp4Pk0ycxHUTQpEsnxoThBFbPIhApOpRy9TmBkx1EAcKRkDZnkcAMxEUJi1ECwhOW5U4wptSkFATPVHNUQkUxmNVNDtOYpPETVPRyghQ3DQqhNUNVlC0eQpDqpzmIpaDRmcBQNnEXVtlJHKOsQJilTHKjvSvGYErtSdVDcNwgA */
  createMachine<ActivityMachineContext, ActivityMachineEvents, ActivityMachineStates>(
    {
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
            ACCEPT: {
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
              target: 'running',
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
                state: 'running',
              },
            },
          ],
          always: {
            cond: (context) => context.elapsed >= context.duration,
            target: 'paused',
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
            src: {
              type: 'onStateChange',
              state: 'idle',
            },
          },
          always: {
            cond: (context) => context.elapsed < context.duration,
            target: 'running',
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
        UPDATE_ACTIVITY: {
          actions: assign({
            activity: (_context, event) => event.value,
          }),
        },
      },
    },
    {
      actions: {
        // initActivity: (context, event) => {
        //   console.log('initActivity', context, event)
        //   context.activity = event.activity
        // },
        // setActivityState: assign({
        //   activity: (_context, event: ActivityMachineEvents) => {
        //     const newValue: Activity = { ...event.value, state }
        //     return newValue
        //   },
        // })
      },
      services: {
        clock: (context) => (cb) => {
          const interval = setInterval(() => {
            cb('TICK')
          }, 1000 * context.interval)

          return () => {
            clearInterval(interval)
          }
        },
        onStateChange: (context, event, { src }) => (cb, _onEvent) => {
          console.log('onStateChange:', context, event, src)

          const newActivity = { ...context.activity, state: src.state }

          cb({ type: 'UPDATE_ACTIVITY', value: newActivity })

          setActivityState(newActivity, src.state)
          // .then(() => {
          //   switch (event.type) {
          //     case 'TICK':
          //       // if (!isPaused){
          //       //   cb({ type: 'ACCEPT', value: event.value })
          //       // }
          //       break
          //     // case 'ASK':
          //     //   cb({ type: 'ACCEPT', value: event.value })
          //     //   break
          //     default:
          //       break
          //   }
          // })
        },
      },
    }
  )

export { userTaskMachine }
