import React, { useState } from "react";
import Map from "./components/Map";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
} from "react-instantsearch-dom";
import { indexName, searchClient } from "./AlgoliaClient";
import "./App.css";

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import LocationButton from "./components/LocationButton";

function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <h1>National Park Service Locations</h1>
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        {/* <Configure
          aroundLatLngViaIP={true}
          aroundRadius="all"
          hitsPerPage={6}
        /> */}
        <SearchBox />
        <div className="map-wrapper">
          <aside className="list">
            <LocationButton />
          </aside>
          <Map />
        </div>
      </InstantSearch>
      <footer className="footer">
        <p>Built on Vite and React</p>
        <div className="logos">
          <img src={viteLogo} className="logo" alt="Vite logo" />
          <img src={reactLogo} className="logo react" alt="React logo" />
        </div>
        <p>
          View on{" "}
          <a href="https://github.com/nathan-schmidt-viget/map-box-react-vite">
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
