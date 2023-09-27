const LocationPopup = ({ geoMapItem, isLoading, setLocationPopUp }) => (
  <>
    {isLoading && <p className="loading">Loading...</p>}
    {!isLoading && geoMapItem.data.map(park => (
      <div key={park.id} className="text-zinc-900 mt-3">
        <p className="text-xs font-bold">{park.fullName}</p>
        <p className="text-xs mt-2">
          {park.addresses[0].line1}<br></br>
          {park.addresses[0].city}, {park.addresses[0].stateCode} {park.addresses[0].postalCode}
        </p>
        <button className="btn mt-3 text-sm" onClick={() => setLocationPopUp(true)}>
          View
        </button>
      </div>
    ))}
  </>
)

export default LocationPopup
