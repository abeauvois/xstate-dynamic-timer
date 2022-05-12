import { createModel } from 'xstate/lib/model'
import { assign } from 'xstate'

import { acceptStartTask, askStartTask } from './firebaseActions'

// const fetchUser = (userId: string) =>
//   fetch(`url/to/user/${userId}`).then((response) => response.json())

const userTaskModel = createModel(
  {
    user: {},
    task: {},
    elapsed: 0,
    duration: 5,
    interval: 0.1,
  },
  {
    events: {
      updateDuration: (duration: number) => ({ duration }),
      increaseDuration: (duration: number) => ({ duration }),
      TICK: (value: number) => ({ value }), // TODO: call callback (firebase)
      ASK: (value: number) => ({ value }),
      ACCEPT: (value: number) => ({ value }),
      START: (value: number) => ({ value }),
      resetElapsed: (value: number) => ({ value }),
    },
  }
)

const userTaskMachine = userTaskModel.createMachine(
  {
    id: 'userTask',
    initial: 'idle',
    context: userTaskModel.initialContext,

    states: {
      idle: {
        on: {
          ASK: {
            target: 'asking',
            actions: ['askStartTask'],
          },
        },
      },
      asking: {
        // invoke: {
        //   id: 'updateUserTaskState',
        //   src: (context, event) => askStartTask(event.data.user, event.data.task),
        //   onDone: {
        //     target: 'success',
        //     // actions: assign({ state: (context, event) => event.data.task }),
        //   },
        //   onError: {
        //     target: 'idle',
        //   },
        // },
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
        entry: () => {},
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
            actions: userTaskModel.assign({
              elapsed: (context) => +(context.elapsed + context.interval).toFixed(2),
            }),
          },
        },
      },
      paused: {
        always: {
          target: 'running',
          cond: (context) => context.elapsed < context.duration,
        },
      },
    },
    on: {
      updateDuration: {
        actions: userTaskModel.assign({
          duration: (_, event) => event.duration,
        }),
      },
      increaseDuration: {
        actions: userTaskModel.assign({
          duration: (context, event) => context.duration + event.duration,
        }),
      },
      resetElapsed: {
        actions: userTaskModel.assign({
          elapsed: 0,
        }),
      },
    },
  },
  {
    actions: {
      askStartTask: (context, event) => {
        console.log('askStartTask...', context, event)
      },
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
      // onStateChange: {}
    },
  }
)

export { userTaskMachine }
