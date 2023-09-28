import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import * as turf from "@turf/turf";
import axios from "axios";
import geoJson from "/src/assets/nps.json";
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_KEY;

import GetNPS from "/src/api/GetNPS";
import flyToLocation from "/src/utils/flyToLocation";

import LocationButtons from "./LocationButtons";
import LocationPopup from "./LocationPopup";
import LocationDetails from "./LocationDetails";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popUpElement = useRef(null);
  const [lng, setLng] = useState(-95);
  const [lat, setLat] = useState(39);
  const [zoom, setZoom] = useState(2.5);
  const [pitch, setPitch] = useState(0);
  const [searchRadius] = useState('350');
  const [geoMap, setGeoMap] = useState(geoJson.features);
  const [geoMapItem, setGeoMapItem] = useState({ data: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [locationPopUp, setLocationPopUp] = useState(false);

  GetNPS(selectedItem, setGeoMapItem, setIsLoading);

  //fetch data to find the users IP and then center and zoom the map to that area
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const { data } = await axios.get(
          `https://api.ipdata.co?api-key=${import.meta.env.VITE_IPDATA_KEY}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        setLng(data.longitude);
        setLat(data.latitude);
      } catch (err) {
        console.log(err.message);
      } finally {
        //if we successfully get the user's IP we fly to that location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 5,
          duration: 3000,
          essential: true,
        });
        sortItems({
          coordinates: [lng, lat],
        }, false);
      }
    };

    fetchIP();
  }, [lng, lat]);

  //Load map, add locations and set onClick
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/nathanschmidt3/cljho2wwr001u01p12jda5ev0",
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      cooperativeGestures: true
    });

    map.current.on("load", function () {
      // Add points custom marker
      map.current.addSource("points", {
        type: "geojson",
        cluster: true,
        clusterMaxZoom: 8,
        data: {
          type: "FeatureCollection",
          features: geoMap,
        },
      });

      map.current.addLayer({
        id: "clusters",
        source: "points",
        filter: ["has", "point_count"],
        type: "circle",
        paint: {
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#024870",
            20,
            "#046ba7",
            100,
            "#028edd",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            20,
            30,
            100,
            40,
          ],
        },
      });

      map.current.addLayer({
        id: "unclustered-point",
        source: "points",
        filter: ["!", ["has", "point_count"]],
        type: "circle",
        paint: {
          "circle-radius": 7,
          "circle-color": "#046ba7",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      // inspect a cluster on click
      map.current.on("click", "clusters", (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.current
          .getSource("points")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      //Check for click on point on map
      map.current.on("click", "unclustered-point", (e) => {
        /* Determine if a feature in the "locations" layer exists at that item. */
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });

        /* If it does not exist, return */
        if (!features.length) return;

        const clickedPoint = features[0];

        /* Fly to the point */
        flyToLocation(map, clickedPoint);

        /* Close all other popups and display popup for clicked item */
        createPopUp(clickedPoint);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.current.on("mouseenter", "unclustered-point", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.current.on("mouseleave", "unclustered-point", () => {
        map.current.getCanvas().style.cursor = "";
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.current.on("mouseenter", "clusters", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.current.on("mouseleave", "clusters", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });

    /*
     * Add my location button
     */
    const geolocate = new mapboxgl.GeolocateControl();
    map.current.addControl(geolocate);
    geolocate.on("geolocate", (event) => {
      sortItems({
        coordinates: [event.coords.longitude, event.coords.latitude],
      });
      setShowSidebar(true)
    });

    /*
     * Add navigation control (the +/- zoom buttons)
     */
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    /**
     * Geo search input
     */
    //set up a new geo search
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      countries: "us",
      marker: false,
      proximity: "ip",
      trackProximity: false,
      placeholder: "City, State, or Zip",
    });

    //add geo search to map
    map.current.addControl(geocoder, "top-left");

    //after users searches and clicks on a result
    geocoder.on("result", (event) => {
      //sort items from nearest to farthest distance from search location
      sortItems(event.result.geometry)
      setShowSidebar(true)
    });

  });

  const createPopUp = (currentItem) => {
    setSelectedItem(currentItem.properties.Code);

    const popUps = document.getElementsByClassName("mapboxgl-popup");
    const coordinates = currentItem.geometry.coordinates.slice();
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    //mapbox popup offset to center on custom marker - https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
    const popup = new mapboxgl.Popup({ offset: [0, -10] })
      .setLngLat(coordinates)
      .setDOMContent(popUpElement.current)
      .addTo(map.current);
  };

  //only used if we show the full list of locations
  const sortItems = (searchResult, showPopup=true) => {
    const sortedGeoMap = [...geoMap];
    const options = { units: "miles" };
    //add the distance to the array
    sortedGeoMap.forEach((item) => {
      item.properties.distance = turf.distance(
        searchResult.coordinates,
        item.geometry.coordinates,
        options
      );
      item.show = item.properties.distance > searchRadius ? false : true;
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
    if (showPopup) {
      map.current.fitBounds(
        turf.bbox(
          turf.lineString([
            sortedGeoMap[0].geometry.coordinates,
            searchResult.coordinates,
          ])
        ),
        { padding: 100 }
      );

      // //open popup box for the closest location
      createPopUp(sortedGeoMap[0]);
    }
  };

  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap overflow-hidden md:h-[70vh] relative">
        <LocationButtons
          map={map}
          geoMap={geoMap}
          selectedItem={selectedItem}
          createPopUp={createPopUp}
          flyToLocation={flyToLocation}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          searchRadius={searchRadius}
        />
        <section ref={mapContainer} className="w-full h-[70vh] md:h-full grow" />
      </div>
      <div ref={popUpElement}>
        <LocationPopup
          geoMapItem={geoMapItem}
          isLoading={isLoading}
          setLocationPopUp={setLocationPopUp}
        />
      </div>
      <LocationDetails
        geoMapItem={geoMapItem}
        isLoading={isLoading}
        setLocationPopUp={setLocationPopUp}
        locationPopUp={locationPopUp}
      />
    </>
  );
};

export default Map;
