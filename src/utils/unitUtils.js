export async function formatData(dataInput, unitPreference) {
  if (Array.isArray(dataInput)) {
    if (unitPreference === "imperial") {
      const convertedDataArray = dataInput.map((data) => {
        const convertedData = {
          ...data,
          ambientTemperature: data.ambientTemperature
            ? {
                maxAmbientTemperature: data.ambientTemperature
                  .maxAmbientTemperature
                  ? data.ambientTemperature.maxAmbientTemperature * 1.8 + 32
                  : null,
                minAmbientTemperature: data.ambientTemperature
                  .minAmbientTemperature
                  ? data.ambientTemperature.minAmbientTemperature * 1.8 + 32
                  : null,
              }
            : {},
          coolantTemperature: data.coolantTemperature
            ? {
                maxCoolantTemperature: data.coolantTemperature
                  .maxCoolantTemperature
                  ? data.coolantTemperature.maxCoolantTemperature * 1.8 + 32
                  : null,
                minCoolantTemperature: data.coolantTemperature
                  .minCoolantTemperature
                  ? data.coolantTemperature.minCoolantTemperature * 1.8 + 32
                  : null,
              }
            : {},
          elevation: data.elevation
            ? {
                gainedElevation: data.elevation.gainedElevation
                  ? data.elevation.gainedElevation * 3.281
                  : null,
                maxElevation: data.elevation.maxElevation
                  ? data.elevation.maxElevation * 3.281
                  : null,
                minElevation: data.elevation.minElevation
                  ? data.elevation.minElevation * 3.281
                  : null,
              }
            : {},
          speed: data.speed
            ? {
                avgSpeed: data.speed.avgSpeed
                  ? data.speed.avgSpeed * 0.621
                  : null,
                maxSpeed: data.speed.maxSpeed
                  ? data.speed.maxSpeed * 0.621
                  : null,
              }
            : {},
          engineLoad: data.engineLoad
            ? {
                maxEngineLoad: data.engineLoad.maxEngineLoad,
                avgEngineLoad: data.engineLoad.avgEngineLoad,
              }
            : {},
          engineSpeed: data.engineSpeed
            ? {
                maxEngineSpeed: data.engineSpeed.maxEngineSpeed,
                avgEngineSpeed: data.engineSpeed.avgEngineSpeed,
              }
            : {},
          totalDistance: data.totalDistance
            ? data.totalDistance * 0.00062137
            : null,
        };
        return convertedData;
      });
      return convertedDataArray;
    } else {
      const convertedDataArray = dataInput.map((data) => {
        const convertedData = {
          ...data,
          totalDistance: data.totalDistance ? data.totalDistance / 1000 : null,
        };
        return convertedData;
      });
      return convertedDataArray;
    }
  } else {
    if (unitPreference === "imperial") {
      const convertedData = {
        ...dataInput,
        ambientTemperature: dataInput.ambientTemperature
          ? {
              maxAmbientTemperature: dataInput.ambientTemperature
                .maxAmbientTemperature
                ? dataInput.ambientTemperature.maxAmbientTemperature * 1.8 + 32
                : null,
              minAmbientTemperature: dataInput.ambientTemperature
                .minAmbientTemperature
                ? dataInput.ambientTemperature.minAmbientTemperature * 1.8 + 32
                : null,
            }
          : {},
        coolantTemperature: dataInput.coolantTemperature
          ? {
              maxCoolantTemperature: dataInput.coolantTemperature
                .maxCoolantTemperature
                ? dataInput.coolantTemperature.maxCoolantTemperature * 1.8 + 32
                : null,
              minCoolantTemperature: dataInput.coolantTemperature
                .minCoolantTemperature
                ? dataInput.coolantTemperature.minCoolantTemperature * 1.8 + 32
                : null,
            }
          : {},
        elevation: dataInput.elevation
          ? {
              gainedElevation: dataInput.elevation.gainedElevation
                ? dataInput.elevation.gainedElevation * 3.281
                : null,
              maxElevation: dataInput.elevation.maxElevation
                ? dataInput.elevation.maxElevation * 3.281
                : null,
              minElevation: dataInput.elevation.minElevation
                ? dataInput.elevation.minElevation * 3.281
                : null,
            }
          : {},
        speed: dataInput.speed
          ? {
              avgSpeed: dataInput.speed.avgSpeed
                ? dataInput.speed.avgSpeed * 0.621
                : null,
              maxSpeed: dataInput.speed.maxSpeed
                ? dataInput.speed.maxSpeed * 0.621
                : null,
            }
          : {},
        engineLoad: dataInput.engineLoad
          ? {
              maxEngineLoad: dataInput.engineLoad.maxEngineLoad,
              avgEngineLoad: dataInput.engineLoad.avgEngineLoad,
            }
          : {},
        engineSpeed: dataInput.engineSpeed
          ? {
              maxEngineSpeed: dataInput.engineSpeed.maxEngineSpeed,
              avgEngineSpeed: dataInput.engineSpeed.avgEngineSpeed,
            }
          : {},
        totalDistance: dataInput.totalDistance
          ? dataInput.totalDistance * 0.00062137
          : null,
      };
      return convertedData;
    } else {
      const convertedData = {
        ...dataInput,
        totalDistance: dataInput.totalDistance
          ? dataInput.totalDistance / 1000
          : null,
      };
      return convertedData;
    }
  }
}
export async function convertTemperature(input, unitPreference) {
  const conversion =
    unitPreference === "imperial"
      ? (temp) => (temp ? temp * 1.8 + 32 : null)
      : (temp) => temp;
  return Array.isArray(input) ? input.map(conversion) : conversion(input);
}

export async function convertDistance(input, unitPreference) {
  const conversion =
    unitPreference === "imperial"
      ? (dist) => (dist ? dist * 0.00062137 : null)
      : (dist) => (dist ? dist / 1000 : null);
  return Array.isArray(input) ? input.map(conversion) : conversion(input);
}

export async function convertElevation(input, unitPreference) {
  const conversion =
    unitPreference === "imperial"
      ? (elev) => (elev ? elev * 3.281 : null)
      : (elev) => elev;
  return Array.isArray(input) ? input.map(conversion) : conversion(input);
}

export async function convertSpeed(input, unitPreference) {
  const conversion =
    unitPreference === "imperial"
      ? (speed) => (speed ? speed * 0.621 : null)
      : (speed) => speed;
  return Array.isArray(input) ? input.map(conversion) : conversion(input);
}

export async function convertFuelConsumption(input, unitPreference) {
  const conversion =
    unitPreference === "imperial"
      ? (fuel) => (fuel ? fuel * 2.35215 : null)
      : (fuel) => fuel;
  return Array.isArray(input) ? input.map(conversion) : conversion(input);
}
