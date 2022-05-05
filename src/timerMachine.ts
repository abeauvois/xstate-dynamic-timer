import { createModel } from "xstate/lib/model";

const timerModel = createModel(
  {
    elapsed: 0,
    duration: 5,
    interval: 0.1
  },
  {
    events: {
      updateDuration: (duration: number) => ({ duration }),
      increaseDuration: (duration: number) => ({ duration }),
      TICK: (value: number) => ({ value }),
      START: (value: number) => ({ value }),
      resetElapsed: (value: number) => ({ value })
    }
  }
);

export const timerMachine = timerModel.createMachine(
  {
    initial: "newday",
    context: timerModel.initialContext,
    states: {
      newday: {
        on: {
          START: "running"
        }
      },
      running: {
        invoke: {
          src: "clock"
        },
        always: {
          target: "paused",
          cond: (context) => {
            return context.elapsed >= context.duration;
          }
        },
        on: {
          TICK: {
            actions: timerModel.assign({
              elapsed: (context) =>
                +(context.elapsed + context.interval).toFixed(2)
            })
          }
        }
      },
      paused: {
        always: {
          target: "running",
          cond: (context) => context.elapsed < context.duration
        }
      }
    },
    on: {
      updateDuration: {
        actions: timerModel.assign({
          duration: (_, event) => event.duration
        })
      },
      increaseDuration: {
        actions: timerModel.assign({
          duration: (context, event) => context.duration + event.duration
        })
      },
      resetElapsed: {
        actions: timerModel.assign({
          elapsed: 0
        })
      }
    }
  },
  {
    services: {
      clock: (context) => (cb) => {
        const interval = setInterval(() => {
          cb("TICK");
        }, 1000 * context.interval);

        return () => {
          clearInterval(interval);
        };
      }
    }
  }
);
