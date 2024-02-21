import { createContext, useState, useEffect } from 'react';

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [selectedActiveVehicle, setSelectedValue] = useState("");

  useEffect(() => {
    const storedValue = localStorage.getItem('selectedActiveVehicle');
    if (storedValue) {
      setSelectedValue(storedValue);
    }
  }, []);

  const handleChange = (value) => {
    setSelectedValue(value);
    localStorage.setItem('selectedActiveVehicle', value);
  };

  return (
    <VehicleContext.Provider value={{ selectedActiveVehicle, setSelectedValue: handleChange }}>
      {children}
    </VehicleContext.Provider>
  );
};