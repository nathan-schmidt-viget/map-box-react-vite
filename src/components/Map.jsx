import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import * as turf from "@turf/turf";

import geoJson from "../assets/nps.json";
import LocationButton from "./LocationButton";
import LocationPopup from "./LocationPopup";
import LocationDetails from "./LocationDetails";
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_KEY;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-101.56);
  const [lat, setLat] = useState(38.83);
  const [zoom, setZoom] = useState(3.5);
  const [pitch, setPitch] = useState(0);
  const [geoMap, setGeoMap] = useState(geoJson.features);
  const [geoMapItem, setGeoMapItem] = useState({ data: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const popUpElement = useRef(null);

  //Load map, add locations and set onClick
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
            features: geoMap,
          },
        });

        // Add a symbol layer to add in custom marker
        map.current.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
          },
        });
      });

      //Check for click action on map
      map.current.on("click", "points", (e) => {
        /* Determine if a feature in the "locations" layer exists at that item. */
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["points"],
        });

        /* If it does not exist, return */
        if (!features.length) return;

        const clickedPoint = features[0];

        /* Fly to the point */
        flyToLocation(clickedPoint);

        /* Close all other popups and display popup for clicked item */
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
    });

    /**
     * Geo search input
     */
    //set up a new geo search
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });

    //add geo search to map
    map.current.addControl(geocoder, "top-left");

    //after users searches and clicks on a result
    geocoder.on("result", (event) => {
      //sort items from nearest to farthest distance from search location
      sortItems(event.result.geometry);
    });

    //recenter map if user clear search
    geocoder.on("clear", () => {
      map.current.fitBounds([
        //re-centers to the US because our map items almost span the entire world. You could use Turf.js to find the bbox for the map items as well
        [-124, 49],
        [-77, 24],
      ]);
    });

    /*
     * Add navigation control (the +/- zoom buttons)
     */
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    /*
     * Add my location button
     */
    const geolocate = new mapboxgl.GeolocateControl();
    map.current.addControl(geolocate);
    geolocate.on("geolocate", (event) => {
      sortItems({
        coordinates: [event.coords.longitude, event.coords.latitude],
      });
    });
  });

  //fetch data when selectedItem is changed/update
  useEffect(() => {
    const fetchMapItemData = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `https://developer.nps.gov/api/v1/parks?parkCode=${selectedItem}&limit=1&api_key=${
            import.meta.env.VITE_NPS_KEY
          }`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        setGeoMapItem(data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapItemData();
  }, [selectedItem]);

  const flyToLocation = (currentItem) => {
    map.current.flyTo({
      center: currentItem.geometry.coordinates,
      zoom: 8.5,
      duration: 3000,
      pitch: 55,
      essential: true, // This animation is considered essential with
      //respect to prefers-reduced-motion
    });
  };

  const createPopUp = (currentItem) => {
    setSelectedItem(currentItem.properties.Code);

    const popUps = document.getElementsByClassName("mapboxgl-popup");
    const coordinates = currentItem.geometry.coordinates.slice();
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    //mapbox popup offset to center on custom marker - https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
    const popup = new mapboxgl.Popup({ offset: [8, -10] })
      .setLngLat(coordinates)
      .setDOMContent(popUpElement.current)
      .addTo(map.current);
  };

  const sortItems = (searchResult) => {
    const sortedGeoMap = [...geoMap];
    const options = { units: "miles" };
    //add the distance to the array
    sortedGeoMap.forEach((item) => {
      item.properties.distance = turf.distance(
        searchResult.coordinates,
        item.geometry.coordinates,
        options
      );
    });

    //sort the array by the distance
    sortedGeoMap.sort((a, b) => {
      if (a.properties.distance > b.properties.distance) {
        return 1;
      }
      if (a.properties.distance < b.properties.distance) {
        return -1;
      }
      return 0; // a must be equal to b
    });

    //set the sorted array to the geoMap
    setGeoMap(sortedGeoMap);

    //fit map zoom to the search location and closest location - https://turfjs.org/docs/#bbox
    map.current.fitBounds(
      turf.bbox(
        turf.lineString([
          sortedGeoMap[0].geometry.coordinates,
          searchResult.coordinates,
        ])
      ),
      { padding: 100 }
    );

    //open popup box for the closest location
    createPopUp(sortedGeoMap[0]);
  };

  return (
    <>
      <div className="map-wrapper">
        <section ref={mapContainer} className="map-container" />
      </div>
      <div ref={popUpElement}>
        <LocationPopup geoMapItem={geoMapItem} isLoading={isLoading} />
      </div>
      <LocationDetails geoMapItem={geoMapItem} isLoading={isLoading} />
    </>
  );
};

export default Map;
