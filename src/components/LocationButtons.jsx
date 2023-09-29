import MapPinSvg from "../assets/map-pin.svg?react";
import CloseSvg from "../assets/close.svg?react";
import ArrowSvg from "../assets/arrow.svg?react";

const LocationButtons = ({
  map,
  geoMap,
  selectedItem,
  createPopUp,
  flyToLocation,
  showSidebar,
  setShowSidebar,
  searchRadius
}) => {
  const sideBarClasses = [
    "flex bg-white flex-col gap-3 overflow-y-auto text-left p-2 md:w-full md:max-w-sm h-[50vh] md:h-full",
    showSidebar ? "" : "md:hidden",
  ];

  //get the length of the locations set to show
  const currentTotal = geoMap.filter(function(item){
    if (item.show) {
      return true;
    } else {
      return false;
    }
  }).length;

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="relative order-last md:order-first w-full md:w-auto">
      <div className="hidden md:flex absolute inset-y-0 right-0 z-[1] translate-x-full items-center">
        <button
          onClick={() => toggleSidebar()}
          className="flex items-center bg-white text-sm gap-1 rounded-b-lg text-zinc-900 py-2 px-4 hover:bg-emerald-800 hover:text-white -rotate-90 -translate-x-10"
        >
          Locations
          <ArrowSvg />
        </button>
      </div>

      <aside className={sideBarClasses.join(" ").trim()}>
        <div className="flex gap-3 items-center">
          <button
            className="hidden md:block sticky top-0 w-8 h-8 hover:text-white hover:bg-zinc-900 rounded text-zinc-900 bg-white focus:text-white focus:bg-zinc-900"
            onClick={() => toggleSidebar()}
          >
            <CloseSvg />
            <span className="sr-only">Close</span>
          </button>
          <p className="text-xs text-black">
            Showing {currentTotal} locations within {searchRadius} miles.
          </p>
        </div>
        {geoMap.map((item) => (
          <button
            className={`btn items-center flex-row gap-2 w-full ${
              selectedItem == item.properties.Code && "active",
              item.show ? 'flex' : 'hidden'
            }`}
            key={item.id}
            onClick={(e) => {
              createPopUp(item, e), flyToLocation(map, item);
            }}
          >
            <div className="w-5 shrink-0">
              <MapPinSvg/>
            </div>
            <span className="flex flex-col text-left">
              <span className="inline-block text-sm">{item.properties.Name}</span>
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
