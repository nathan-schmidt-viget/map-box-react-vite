import React, { useState } from "react";
import Map from "./Map"
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>MapBox Demo</h1>
      <div>
        <p>Built on Vite and React</p>
        <img src={viteLogo} className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>

      <Map/>
    </>
  );
}

export default App;
