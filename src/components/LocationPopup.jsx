const LocationPopup = ({ geoMapItem, isLoading, setLocationPopUp }) => (
  <>
    {isLoading && <p className="loading">Loading...</p>}
    {!isLoading && geoMapItem.data.map(park => (
      <div key={park.id}>
        <p className="popup-title">{park.fullName}</p>
        <p className="popup-address">
          {park.addresses[0].line1}<br></br>
          {park.addresses[0].city}, {park.addresses[0].stateCode} {park.addresses[0].postalCode}
        </p>
        <button className="button" onClick={() => setLocationPopUp(true)}>
          View More Info
        </button>
      </div>
    ))}
  </>
)

export default LocationPopup
