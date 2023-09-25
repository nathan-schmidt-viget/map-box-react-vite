import React from "react";
import Map from "./components/Map"
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  return (
    <>
      <div className="py-8 max-w-4xl mx-auto text-center px-4">
        <h1 className="text-6xl">National Park Service Locations</h1>
        <p className="text-md mt-8">
          The National Park Service manages and preserves over 400 stunning locations across the United States, ranging from iconic natural wonders like the Grand Canyon to historic sites such as Independence Hall.
        </p>
        <p className="text-md mt-4">
          This exploration looks into build a better location search tool using <a className="underline hover:no-underline" href="https://www.mapbox.com/">MapBox</a>. 
        </p>
      </div>
      <Map />
      <footer className="footer">
        <p>Built on Vite and React</p>
        <div className="logos"> 
          <img src={viteLogo} className="logo" alt="Vite logo" />
          <img src={reactLogo} className="logo react" alt="React logo" />
        </div>
        <p>View on <a href="https://github.com/nathan-schmidt-viget/map-box-react-vite">GitHub</a></p>
      </footer>
    </>
  );
}

export default App;
