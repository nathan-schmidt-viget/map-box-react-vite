import React, { useRef, useEffect } from "react";

const LocationDetails = ({ geoMapItem, isLoading, locationPopUp, setLocationPopUp }) => {
  const locationDetailsPopUp = useRef(null);

  // when open changes run open/close command
  useEffect(() => {
    const { current: el } = locationDetailsPopUp;
    if (locationPopUp) el.showModal();
  }, [locationPopUp]);


  const formatPhoneNumber = (phoneNumberString) => {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
  }

  return (
    <dialog
      ref={locationDetailsPopUp}
      className="relative max-w-6xl mx-auto w-full basis-1/2 rounded-md bg-zinc-100 backdrop:bg-zinc-900 backdrop:opacity-70"
    >
      {isLoading && <p className="loading">Loading...</p>}

      <form method="dialog" className="flex justify-end absolute top-1 right-1 z-10 ">
        <button className="w-8 h-8 text-white bg-zinc-900 rounded hover:text-zinc-900 hover:bg-white focus:text-zinc-900 focus:bg-white" onClick={() => setLocationPopUp(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z" fill="currentColor"></path></svg>
          <span className="sr-only">Close</span>
        </button>
      </form>

      {!isLoading && geoMapItem.data.map((location, index) => (
        <div key={index}>
          <div className="w-full flex snap-x overflow-x-auto overflow-y-hidden">
            {location.images.map((image, index) => (
              <div key={index} className="shrink-0 w-2/3 aspect-video group">
                <figure className="h-full relative">
                  <img src={image.url} alt={image.altText} className="object-cover h-full w-full" />
                  <figcaption className="absolute bottom-0 bg-zinc-900/70 px-3 py-2 text-white w-full translate-y-full group-hover:translate-y-0 ease-in-out duration-300 transition-transform">
                    {image.caption}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
          <div key={location.id} className="grid grid-cols-3 gap-8 px-6 py-8">
            <div className="md:col-span-2">
              <h1 className="text-4xl">
                {location.fullName}
              </h1>
              <p className="mt-2 mb-4">
                {location.description}
              </p>

              {location.entranceFees.length > 0 &&
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-zinc-900">
                    Entrance Fees
                  </h2>
                  <div className="mt-2 grid gap-8">
                    {location.entranceFees.map((fee, index) => (
                      <div key={index}>
                        <h3 className="text-base">{fee.title} - ${fee.cost}</h3>
                        <p className="mt-1 text-sm">{fee.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              }

              <h2 className="text-xl font-bold text-zinc-900 mt-4">
                Weather Info
              </h2>
              <div className="mt-2">
                <p>{location.weatherInfo}</p>
              </div>
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
              <p className="text-sm">
                {location.addresses[0].line1}
                <br></br>
                {location.addresses[0].city}, {location.addresses[0].stateCode}{" "}
                {location.addresses[0].postalCode}
              </p>
              <a href={location.url} className="btn mt-2" target="_blank">View NPS Page</a>
            </aside>
          </div>
        </div>
      ))}
    </dialog>
  );
};

export default LocationDetails;
