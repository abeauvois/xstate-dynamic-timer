import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Timer } from "./Timer";

const App = () => {
  return (
  <>
  <Timer />
  <Timer />
  </>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
