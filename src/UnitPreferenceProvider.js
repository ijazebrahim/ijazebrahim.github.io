import React, { useState, useEffect } from "react";
import UnitPreferenceContext from "./UnitPreferenceContext";

function UnitPreferenceProvider({ children }) {
  const [unitPreference, setUnitPreference] = useState(
    localStorage.getItem("unitPreference") || "metric"
  );

  useEffect(() => {
    localStorage.setItem("unitPreference", unitPreference);
  }, [unitPreference]);

  return (
    <UnitPreferenceContext.Provider
      value={{ unitPreference, setUnitPreference }}
    >
      {children}
    </UnitPreferenceContext.Provider>
  );
}

export default UnitPreferenceProvider;
