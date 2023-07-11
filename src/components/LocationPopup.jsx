const LocationPopup = ({ geoMapItem, isLoading }) => (
  <>
    {isLoading && <p className="loading">Loading...</p>}
    {!isLoading && geoMapItem.data.map(park => (
      <div key={park.id}>
        <p className="popup-title">{park.fullName}</p>
        <p className="popup-address">
          {park.addresses[0].line1}<br></br>
          {park.addresses[0].city}, {park.addresses[0].stateCode} {park.addresses[0].postalCode}
        </p>
        <a href={park.url} target="_blank" className="button">
          View NPS Page
        </a>
      </div>
    ))}
  </>
)

export default LocationPopup
