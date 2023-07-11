# MapBox Demo using React and Vite

This is a simple demo to explore and test out Map Box. [View Map](https://astounding-fudge-44c956.netlify.app/)

There are several things in this demo that I would suggest changing if you are going to use for production.

- Only pull in the turf.js [individual packages](https://github.com/Turfjs/turf#in-nodejs) that are needed.
- Make the MapBox style be a local JSON file vs. the url.This keeps you map styled even if the MapBox server is not responding.

## Local Install
In order to run this locally you will need your own MapBox and NPS keys:
- [MapBox Account](https://account.mapbox.com/auth/signup/)
- [NPS Developer API](https://www.nps.gov/subjects/developer/get-started.htm)
Once you have both the keys you will need to create a copy of the `.env.template` file by running `cp env.template .env`. Then add your keys to the `.env` file. 

Then run:
```
npm install
npm run dev
```

## MapBox
This is based off of two tutorials from MapBox:
- [Store Locator](https://docs.mapbox.com/help/tutorials/building-a-store-locator/)
- [Sort Stores](https://docs.mapbox.com/help/tutorials/geocode-and-sort-stores/)

Options that we are pull in:
- [MapboxGeocoder](https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/)
- [NavigationControl](https://docs.mapbox.com/mapbox-gl-js/example/navigation/)
- [GeolocateControl](https://docs.mapbox.com/mapbox-gl-js/example/locate-user/)

## Turf.js
We are using [Turf.js](https://turfjs.org/) to calculate the distance between `MapboxGeocoder` and `GeolocateControl` and the closest location. 
Once we have the two locations and we use turf to create the bounding box (lat and long) around that location so that when we zoom in, we zoom in as close as we can while still keeping the two location in the map view area.

## React + Vite
This was built on the base Vite + React by running `npm create vite@latest`

