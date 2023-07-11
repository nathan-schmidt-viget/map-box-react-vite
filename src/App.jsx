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
      <Map/>
    </>
  );
}

export default App;
