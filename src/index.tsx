import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Timer } from "./Timer";

const App = () => {
  return (
    <>
      <Timer username="Noa Judoka" />
      <Timer username="Leo Delaho" />
    </>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
