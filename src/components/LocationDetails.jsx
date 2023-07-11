const LocationDetails = ({ geoMapItem, isLoading }) => {
  const formatPhoneNumber = (phoneNumberString) => {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
  }
  return (
    <article>
      {isLoading && <p className="loading">Loading...</p>}
      {!isLoading && geoMapItem.data.map((location) => (
        <div key={location.id} className="location">
          <div className="location-info">
            <h2>{location.fullName}</h2>
            <p>{location.description}</p>
            {location.entranceFees.length > 0 &&
              <details>
                <h3>Entrance Fees</h3>
                <div className="location-fee">
                  {location.entranceFees.map((fee, index) => (
                    <div key={index}>
                      <h3>{fee.title} - ${fee.cost}</h3>
                      <p>{fee.description}</p>
                    </div>
                  ))}
                </div>
              </details>
            }

            <details>
              <summary>Images</summary>
              <div className="location-images">
                {location.images.map((image, index) => (
                  <figure key={index}>
                    <img src={image.url} alt={image.altText} />
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </details>

            <details>
              <summary>Weather Info</summary>
              <div className="location-weather">
                <p>{location.weatherInfo}</p>
              </div>
            </details>
          </div>
          <aside className="location-sidebar">
            <h3>Operating Hours</h3>
            <p>{location.operatingHours[0].description}</p>
            <ul>
              <li>Sunday - {location.operatingHours[0].standardHours.sunday}</li>
              <li>Monday - {location.operatingHours[0].standardHours.monday}</li>
              <li>Tuesday - {location.operatingHours[0].standardHours.tuesday}</li>
              <li>
                Wednesday - {location.operatingHours[0].standardHours.wednesday}
              </li>
              <li>
                Thursday - {location.operatingHours[0].standardHours.thursday}
              </li>
              <li>Friday - {location.operatingHours[0].standardHours.friday}</li>
              <li>
                Saturday - {location.operatingHours[0].standardHours.saturday}
              </li>
            </ul>
            <h3>Phone Number(s)</h3>
            <ul>
              {location.contacts.phoneNumbers.map((phone, index) => (
                <li key={index}>
                  {phone.type}: <a href={`tel:${phone.phoneNumber}`}>{formatPhoneNumber(phone.phoneNumber)}</a>
                </li>
              ))}
            </ul>
            <h3>Address</h3>
            <p>
              {location.addresses[0].line1}
              <br></br>
              {location.addresses[0].city}, {location.addresses[0].stateCode}{" "}
              {location.addresses[0].postalCode}
            </p>
            <a href={location.url} className="button" target="_blank">View NPS Page</a>
          </aside>
        </div>
      ))}
    </article>
  );
};

export default LocationDetails;
