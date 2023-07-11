const LocationButton = ({ geoMap, selectedItem, createPopUp, flyToLocation }) => (
  <aside className="list">
    {geoMap.map((item) => (
        <button
          className={`item ${selectedItem == item.properties.Code && "active"
            }`}
          key={item.id}
          onClick={(e) => {
            createPopUp(item, e), flyToLocation(item);
          }}
        >
          <span className="item-title">{item.properties.Name}</span>
          {item.properties.distance && (
            <span className="item-miles">
              {Math.round(item.properties.distance * 100) / 100} miles away
            </span>
          )}
        </button>
    ))}
  </aside>
)

export default LocationButton
