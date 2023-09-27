import React from "react";
import Map from "./components/Map"
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import mapboxLogo from "./assets/mapbox-logo-white.svg";

function App() {
  return (
    <>
      <div className="py-8 max-w-4xl mx-auto text-center px-4">
        <h1 className="text-6xl">National Park Service Locations</h1>
        <p className="text-md mt-8">
          The National Park Service manages and preserves over 400 stunning locations across the United States, ranging from iconic natural wonders like the Grand Canyon to historic sites such as Independence Hall.
        </p>
        <p className="text-md mt-4">
          This exploration looks into building a better location search tool using <a className="underline hover:no-underline" href="https://www.mapbox.com/">Mapbox</a>. 
        </p>
      </div>
      <Map />
      <footer className="flex flex-wrap gap-6 justify-center pt-8 pb-3">
        <div className="flex flex-wrap gap-8 justify-center"> 
          <a href="https://www.mapbox.com/">
            <span className="sr-only">Mapbox</span>
            <img src={mapboxLogo} className="w-32" alt="Mapbox logo" />
          </a>
          <a href="https://vitejs.dev/">
            <span className="sr-only">Vite.js</span>
            <img src={viteLogo} className="w-8" alt="Vite logo" />
          </a>
          <a href="https://react.dev/">
            <span className="sr-only">React</span>
            <img src={reactLogo} className="w-8" alt="React logo" />
          </a>
        </div>
        <p className="w-full text-center text-xs">Built on Mapbox, Vite, and React | <a href="https://github.com/nathan-schmidt-viget/map-box-react-vite">View on GitHub</a></p>
      </footer>
    </>
  );
}

export default App;
