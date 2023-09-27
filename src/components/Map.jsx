import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import * as turf from "@turf/turf";
import geoJson from "../assets/nps.json";
import LocationPopup from "./LocationPopup";
import LocationDetails from "./LocationDetails";
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_KEY;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-95);
  const [lat, setLat] = useState(39);
  const [zoom, setZoom] = useState(2.5);
  const [pitch, setPitch] = useState(0);
  const [geoMap, setGeoMap] = useState(geoJson.features);
  const [geoMapItem, setGeoMapItem] = useState({ data: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const popUpElement = useRef(null);
  const [locationPopUp, setLocationPopUp] = useState(false);


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
        setLng(data.longitude)
        setLat(data.latitude)
      } catch (err) {
        console.log(err.message);
      } finally {
        //if we successfully get the user's IP we fly to that location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 6,
          duration: 5000,
          essential: true, 
        });
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
    });

    map.current.on("load", function () {
      // Add points custom marker
      map.current.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: geoMap,
        },
      });

      map.current.addLayer({
        id: "points",
        source: "points",
        type: "circle",
        paint: {
          "circle-radius": 8,
          "circle-color": "#046ba7",
        },
      });

      //single point
      map.current.addSource("single-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.current.addLayer({
        id: "point",
        source: "single-point",
        type: "circle",
        paint: {
          "circle-radius": 8,
          "circle-color": "#019765",
        },
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
      sortItems(event.result.geometry);
      map.current.getSource("single-point").setData(event.result.geometry);
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

  //only used if we show the full list of locations
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
      <section ref={mapContainer} className="w-full h-[70vh]" />
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
