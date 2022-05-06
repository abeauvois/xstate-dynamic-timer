import * as React from "react";
import { useMachine } from "@xstate/react";

import { timerMachine } from "./timerMachine";
import type { User, Task } from "./Types";

const hasAdminRole = (user: User) => false;

export type AdminProps = {
  user: User;
};

export type ActivityProps = {
  user: User;
  task: Task;
};

export const Admin = (props: AdminProps) => {
  const [state, send] = useMachine(timerMachine);
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

export const Activity = (props: ActivityProps) => {
  const [state, send] = useMachine(timerMachine);

  const { elapsed, duration } = state.context;

  return (
    <section>
      <label style={{ textAlign: "center", fontSize: 32 }}>
        {props.user.username || "unkown"}
      </label>
      <span style={{ textAlign: "center", fontSize: 28 }}>
        {props.task.name || "unkown task name"}
        <span> {props.task.duration.toFixed(1)}</span>
      </span>
      <label>
        <span>
          {"state: "}
          <span style={{ color: "gray" }}>{String(state.value).toUpperCase()}</span>
        </span>
        <output>
          {elapsed.toFixed(1)}s / {duration.toFixed(1)}s
        </output>
        <progress max={duration} value={elapsed} />
      </label>
      <button onClick={() => send("START")}>Ask for START</button>
      <Admin user={props.user} />
    </section>
  );
};