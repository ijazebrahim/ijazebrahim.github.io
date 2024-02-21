import { ToggleGroupContext } from "./ToggleGroupContext";
import { useState } from "react";

export const ToggleGroupProvider = ({ children }) => {
  const [similarTrips, setSimilarTrips] = useState(false);

  return (
    <ToggleGroupContext.Provider value={{ similarTrips, setSimilarTrips }}>
      {children}
    </ToggleGroupContext.Provider>
  );
};
