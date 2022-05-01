import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useMachine } from "@xstate/react";
import { timerMachine } from "./timerMachine";

const Timer = () => {
  const [state, send] = useMachine(timerMachine);

  const { elapsed, duration } = state.context;

  return (
    <section>
      <label>
        <span>Elapsed time:</span>
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
          onChange={e => {
            send("DURATION.UPDATE", { value: +e.target.value });
          }}
        />
      </label>
      <button onClick={_ => send("RESET")}>Reset</button>
    </section>
  );
};

const App = () => {
  return <Timer />;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
