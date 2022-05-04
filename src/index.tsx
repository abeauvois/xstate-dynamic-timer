import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Activity } from "./Activity";

const App = () => {
  return (
    <>
      <Activity
        user={{ username: "Noa Judoka" }}
        task={{ name: "Gaming", duration: 5 }}
      />
      <Activity
        user={{ username: "Leo Delaho" }}
        task={{ name: "Gaming", duration: 5 }}
      />
    </>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
