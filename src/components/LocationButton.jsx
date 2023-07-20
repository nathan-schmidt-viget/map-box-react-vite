import { connectHits } from "react-instantsearch-dom";

const LocationButton = connectHits(({ hits, selectedItem }) => {
  return (
    <ul className="item-list">
      {hits.map((hit) => (
        <li key={hit.objectID}>
          <button
            className={`item ${
              selectedItem == hit.properties?.Code && "active"
            }`}
            onClick={(e) => {
              createPopUp(hit, e), flyToLocation(hit);
            }}
          >
            <span className="item-title">{hit.properties?.Name}</span>
            {hit.properties.distance && (
              <span className="item-miles">
                {Math.round(hit.properties.distance * 100) / 100} miles away
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
});

export default LocationButton;
