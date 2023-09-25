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
    <article className="px-4 mt-8 max-w-6xl mx-auto w-full basis-1/2">
      {isLoading && <p className="loading">Loading...</p>}
      {!isLoading && geoMapItem.data.map((location) => (
        <div key={location.id} >
          <div className="md:col-span-2">
            <h2 className="text-4xl">{location.fullName}</h2>
            <p className="mt-2">{location.description}</p>
            {location.entranceFees.length > 0 &&
              <details className="py-2">
                <summary className="bg-zinc-100 px-1.5 py-2 text-zinc-900 rounded-md">Entrance Fees</summary>
                <div className="mt-3 grid gap-8">
                  {location.entranceFees.map((fee, index) => (
                    <div key={index}>
                      <h3 className="text-lg">{fee.title} - ${fee.cost}</h3>
                      <p className="mt-1">{fee.description}</p>
                    </div>
                  ))}
                </div>
              </details>
            }

            <details className="py-2">
              <summary className="bg-zinc-100 px-1.5 py-2 text-zinc-900 rounded-md">Images</summary>
              <div className="mt-3">
                {location.images.map((image, index) => (
                  <figure key={index}>
                    <img src={image.url} alt={image.altText} />
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </details>

            <details className="py-2">
            <summary className="bg-zinc-100 px-1.5 py-2 text-zinc-900 rounded-md">Weather Info</summary>
              <div className="mt-3">
                <p>{location.weatherInfo}</p>
              </div>
            </details>
          </div>

          <aside>
            <h3 className="text-3xl">Operating Hours</h3>
            <p className="mt-2 text-sm">{location.operatingHours[0].description}</p>
            <ul className="mt-4 flex gap-1 flex-col text-sm">
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
            <h3 className="text-xl mt-8">Phone Number(s)</h3>
            <ul className="mt-2 flex gap-1 flex-col text-sm">
              {location.contacts.phoneNumbers.map((phone, index) => (
                <li key={index}>
                  {phone.type}: <a href={`tel:${phone.phoneNumber}`}>{formatPhoneNumber(phone.phoneNumber)}</a>
                </li>
              ))}
            </ul>
            <h3 className="text-xl mt-8">Address</h3>
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
