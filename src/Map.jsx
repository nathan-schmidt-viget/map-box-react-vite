import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import geoJson from "./assets/chicago-parks.json";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibmF0aGFuc2NobWlkdDMiLCJhIjoiY2xqZnd0dGFtMDRndzNxbXF6ZHMxY3BmdCJ9.rYBdQrH_WubZcEEMda1JSA";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-87.65);
  const [lat, setLat] = useState(41.84);
  const [zoom, setZoom] = useState(11);
  const [pitch, setPitch] = useState(15);

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

        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        const popContent = `<div class="pop-content"><p>${description}</p></div>`;


        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popContent)
          .addClassName('pop-up')
          .addTo(map.current);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.current.on("mouseenter", "points", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.current.on("mouseleave", "points", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });

    //rotate the map on load
    //map.current.rotateTo(180, { duration: 20000 });

    //Geo search input
    map.current.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      })
    );

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
      <div className="map-info">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | Pitch: {pitch}
      </div>
      <div ref={mapContainer} className="map-container" />
    </>
  );
};

export default Map;
