import React, { useEffect } from "react";
import axios from "axios";

const GetNPS = ( selectedItem, setGeoMapItem, setIsLoading ) => {
    //fetch data when selectedItem is changed/update
    useEffect(() => {
      const fetchMapItemData = async () => {
        setIsLoading(true);
        try {
          const { data } = await axios.get(
            `https://developer.nps.gov/api/v1/parks?parkCode=${selectedItem}&limit=1&api_key=${
              import.meta.env.VITE_NPS_KEY
            }`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );
          setGeoMapItem(data);
        } catch (err) {
          console.log(err.message);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchMapItemData();
    }, [selectedItem]);

}

export default GetNPS;
