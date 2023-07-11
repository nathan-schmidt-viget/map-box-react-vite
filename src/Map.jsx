import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import geoJson from "./assets/nps.json";
import * as turf from "@turf/turf";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibmF0aGFuc2NobWlkdDMiLCJhIjoiY2xqaG1kYWphMDA4MTNscWtzdGdubmUxcSJ9.oe5M6E9qr8kpaAFFq9Mtrw";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-101.56);
  const [lat, setLat] = useState(38.83);
  const [zoom, setZoom] = useState(3.5);
  const [pitch, setPitch] = useState(0);

  const flyToStore = (currentFeature) => {
    map.current.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 8.5,
      duration: 1000,
      pitch: 55,
      essential: true, // This animation is considered essential with
      //respect to prefers-reduced-motion
    });
  };

  const createPopUp = (currentFeature, e) => {
    const popUps = document.getElementsByClassName("mapboxgl-popup");
    const coordinates = currentFeature.geometry.coordinates.slice();
    /** Check if there is already a popup on the map and if so, remove it */
    if (popUps[0]) popUps[0].remove()
    
    toggleClass(currentFeature.id)

    const popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(
        `<div class="pop-content"><p>${currentFeature.properties.Name}</p><p>Code:${currentFeature.properties.Code}</p></div>`
      )
      .addTo(map.current);
  };

  const toggleClass = (e) => {
    const activeItem = document.getElementsByClassName("active");
    if (activeItem[0]) {
      activeItem[0].classList.remove("active");
    }
    document.getElementById(`listing-${e}`).classList.add("active");
  };

  const getBbox = (sortedStores, storeIdentifier, searchResult) => {
    const lats = [
      sortedStores.features[storeIdentifier].geometry.coordinates[1],
      searchResult.coordinates[1],
    ];
    const lons = [
      sortedStores.features[storeIdentifier].geometry.coordinates[0],
      searchResult.coordinates[0],
    ];
    const sortedLons = lons.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a.distance < b.distance) {
        return -1;
      }
      return 0;
    });
    const sortedLats = lats.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a.distance < b.distance) {
        return -1;
      }
      return 0;
    });
    return [
      [sortedLons[0], sortedLats[0]],
      [sortedLons[1], sortedLats[1]],
    ];
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/nathanschmidt3/cljfx7gfp002m01r4bpq2642c",
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
    });

    map.current.on("load", function () {
      // Add an image to use as a custom marker
      map.current.loadImage("pin.png", function (error, image) {
        if (error) throw error;
        map.current.addImage("custom-marker", image);

        // Add a GeoJSON source with multiple points
        map.current.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: geoJson.features,
          },
        });

        // Add a symbol layer
        map.current.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
            // get the title name from the source's "title" property
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],

            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#1597E0",
          },
        });
      });

      map.current.on("click", "points", (e) => {
        /* Determine if a feature in the "locations" layer exists at that point. */
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["points"],
        });

        /* If it does not exist, return */
        if (!features.length) return;

        const clickedPoint = features[0];

        /* Fly to the point */
        flyToStore(clickedPoint);

        /* Close all other popups and display popup for clicked store */
        createPopUp(clickedPoint);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.current.on("mouseenter", "points", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.current.on("mouseleave", "points", () => {
        map.current.getCanvas().style.cursor = "";
      });

      // geoJson.features.forEach(element => {
      //   setPinBox(pinBox => [...pinBox, element.geometry.coordinates])
      // });
      // var tin = turf.tin(pinBox);
    });

    //rotate the map on load
    //map.current.rotateTo(180, { duration: 20000 });

    //Geo search input
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });

    map.current.addControl(geocoder, "top-left");

    //after search results
    geocoder.on("result", (event) => {
      const searchResult = event.result.geometry;
      const options = { units: "miles" };
      geoJson.features.forEach((item) => {
        item.properties.distance = turf.distance(
          searchResult,
          item.geometry,
          options
        );
      });

      geoJson.features.sort((a, b) => {
        if (a.properties.distance > b.properties.distance) {
          return 1;
        }
        if (a.properties.distance < b.properties.distance) {
          return -1;
        }
        return 0; // a must be equal to b
      });

      const bbox = getBbox(geoJson, 0, searchResult);
      map.current.fitBounds(bbox, {
        padding: 50,
      });
      
      createPopUp(geoJson.features[0]);
    });

    // Add navigation control (the +/- zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add my location button
    //map.current.addControl(new mapboxgl.GeolocateControl());
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
      setPitch(map.current.getPitch().toFixed());
    });
  });

  return (
    <>
      <div className="map-wrapper">
        <div className="list">
          {geoJson.features.map((item) => (
            <button
              className="item"
              id={`listing-${item.id}`}
              key={item.id}
              onClick={(e) => (
                createPopUp(item, e), flyToStore(item), toggleClass(item.id)
              )}
            >
              {item.properties.Name}<br/>
              {item.properties.distance
                ? `${Math.round(item.properties.distance * 100) / 100} miles away`
                : ""}
            </button>
          ))}
        </div>
        <div ref={mapContainer} className="map-container" />
      </div>
      <div className="map-info">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | Pitch: {pitch}
      </div>
    </>
  );
};

export default Map;
