import React, {useEffect} from "react";
import { useMachine } from "@xstate/react";

import { userTaskMachine } from "./timerMachine";
import type { User, Activity } from "./Types";

const hasAdminRole = (user: User) => false;

export type AdminProps = {
  user: User;
};

export type ActivitySummaryProps = {
  activity: Activity
};

export const Admin = (props: AdminProps) => {
  const [state, send] = useMachine(userTaskMachine);
  const { duration } = state.context;

  if (!hasAdminRole(props.user)) return null;
  return (
    <>
      <label>
        <span>Duration:</span>
        <input
          type="range"
          min={0}
          max={30}
          value={duration}
          onChange={(e) => {
            send("UPDATE_DURATION", { duration: +e.target.value });
          }}
        />
      </label>
      <button onClick={(_) => send("RESET_ELAPSED")}>Reset</button>
      <button onClick={() => send("INCREASE_DURATION", { duration: 10 })}>
        Increase 10s
      </button>
    </>
  );
};

export const useInitMachine = (activity: Activity) => {
  const [machineState, send] = useMachine(userTaskMachine);

  const { elapsed, duration } = machineState.context;

  const hasAdminAccepted= activity.state === 'asking'
  const {user, task} = activity


  const askForStarting = () => {
    send('ASK', {value: {...activity, state: 'asking'}})
  }

  // Only fired when loaded
  useEffect(() => {
    if (activity) {
      console.log('onLoad:', machineState.value, activity)

      if (hasAdminAccepted) {
        // Case of rehydratation when user reload the app
        send('ACCEPT',{value: {...activity, state: 'running'}})
        
      } 
      
      if (machineState.value === "idle"){
        // Case of initialization of the app
        send('INIT',{value: {...activity, state: 'initialized'}})
      }
    }
  }, [])

  return { user, task, machineState, elapsed, duration, hasAdminAccepted, askForStarting }
}

const ActivitySummary = ({activity}: ActivitySummaryProps) => {

  const {  user, task, machineState, elapsed, duration, hasAdminAccepted, askForStarting } = useInitMachine(activity)

  return (
    <section>
      <label style={{ textAlign: "center", fontSize: 32 }}>
        {user.username || "unkown"}
      </label>
      <span style={{ textAlign: "center", fontSize: 28 }}>
        {task.name || "unkown task name"}
        <span> {task.duration.toFixed(1)}</span>
      </span>
      <label>
        <div>
          {"state: "}
          <span style={{ color: "gray" }}>{String(machineState.value).toUpperCase()}</span>
        </div>
        <div>
          {"activity state: "}
          <span style={{ color: "gray" }}>{String(machineState.context.activity.state).toUpperCase()}</span>
        </div>
        <div>
          {"db state: "}
          <span style={{ color: "gray" }}>{String(activity.state).toUpperCase()}</span>
        </div>
        <output>
          {elapsed.toFixed(1)}s / {duration.toFixed(1)}s
        </output>
        <progress max={duration} value={elapsed} />
      </label>
      <button disabled={hasAdminAccepted} onClick={askForStarting}>Ask for START</button>
      <Admin user={user} />
    </section>
  );
};

export {ActivitySummary}