import React, { useState } from "react";
import mapPin from "../assets/map-pin.svg";

const LocationButtons = ({
  map,
  geoMap,
  selectedItem,
  createPopUp,
  flyToLocation,
  showSidebar,
  setShowSidebar
}) => {
  const sideBarClasses = [
    "bg-white flex-col gap-3 overflow-y-auto text-left p-2 max-w-sm items-end h-full",
    showSidebar ? "flex" : "hidden",
  ];

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 z-[1] translate-x-full flex items-center">
        <button
          onClick={() => toggleSidebar()}
          className="flex items-center bg-white text-sm gap-1 rounded-b-lg text-zinc-900 py-2 px-4 hover:bg-emerald-800 hover:text-white -rotate-90 -translate-x-10"
        >
          Locations
          <svg
            className="w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M11.9997 10.8284L7.04996 15.7782L5.63574 14.364L11.9997 8L18.3637 14.364L16.9495 15.7782L11.9997 10.8284Z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
      </div>

      <aside className={sideBarClasses.join(" ").trim()}>
        <button
          className="sticky top-0 w-8 h-8 hover:text-white hover:bg-zinc-900 rounded text-zinc-900 bg-white focus:text-white focus:bg-zinc-900"
          onClick={() => toggleSidebar()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"
              fill="currentColor"
            ></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
        {geoMap.map((item) => (
          <button
            className={`btn flex items-center flex-row gap-2 w-full ${
              selectedItem == item.properties.Code && "active"
            }`}
            key={item.id}
            onClick={(e) => {
              createPopUp(item, e), flyToLocation(map, item);
            }}
          >
            <img src={mapPin} alt="" className="w-5" />
            <span className="flex flex-col text-left">
              <span className="inline-block">{item.properties.Name}</span>
              {item.properties.distance && (
                <span className="text-xs mt-1">
                  {Math.round(item.properties.distance * 100) / 100} miles away
                </span>
              )}
            </span>
          </button>
        ))}
      </aside>
    </div>
  );
};

export default LocationButtons;
