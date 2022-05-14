import * as React from "react";
import { useMachine } from "@xstate/react";

import { userTaskMachine } from "./timerMachine";
import type { User, Task, Activity } from "./Types";

const hasAdminRole = (user: User) => false;

export type AdminProps = {
  user: User;
};

export type ActivitySummaryProps = {
  activity: Activity
  onAskStart: (activity: Activity) => void
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
            send("updateDuration", { duration: +e.target.value });
          }}
        />
      </label>
      <button onClick={(_) => send("resetElapsed")}>Reset</button>
      <button onClick={() => send("increaseDuration", { duration: 10 })}>
        Increase 10s
      </button>
    </>
  );
};

const ActivitySummary = ({activity, onAskStart}: ActivitySummaryProps) => {
  const [machineState, send] = useMachine(userTaskMachine);

  const { elapsed, duration } = machineState.context;

  const {user, task} = activity
  const hasAdminAccepted= activity.state === 'running'

  const askForStarting = () => {
    // update the userTaskMachine
    send('ASK', activity)
    // then update firebase to allow Admin to be notified about Tasks to start
    onAskStart(activity)
  }

  // TODO: this should be done internaly when calling acceptUserTask()
  if (hasAdminAccepted) {
    send("ASK")
    send("ACCEPT")
    send("START")
  }

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
        <span>
          {"state: "}
          <span style={{ color: "gray" }}>{String(machineState.value).toUpperCase()}</span>
        </span>
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