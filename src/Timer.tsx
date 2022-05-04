import * as React from "react";
import { useMachine } from "@xstate/react";
import { timerMachine } from "./timerMachine";

export const Timer = () => {
  const [state, send] = useMachine(timerMachine);

  const { elapsed, duration } = state.context;

  return (
    <section>
      <label>
        <span>
          {" "}
          {state.matches("paused")
            ? `Elapsed time: PAUSED`
            : "Elapsed time:"}{" "}
        </span>
        <output>
          {elapsed.toFixed(1)}s / {duration.toFixed(1)}s
        </output>
        <progress max={duration} value={elapsed} />
      </label>
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
    </section>
  );
};
