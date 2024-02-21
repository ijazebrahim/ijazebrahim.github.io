import React from "react";
import {
  Avatar,
  Box,
  Typography,
  useTheme,
  Chip,
  IconButton,
} from "@mui/material";
import { tokens } from "../../theme";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import LocalGasStationOutlined from "@mui/icons-material/LocalGasStationOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import StatBox from "../../components/StatBox";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { ArrowDownwardOutlined } from "@mui/icons-material";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import ProgressCircle from "../../components/ProgressCircle";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { VehicleContext } from "../../VehicleContext.js";
import UnitPreferenceContext from "../../UnitPreferenceContext.js";
import {
  DEFAULT_UNITS_IMPERIAL,
  DEFAULT_UNITS_METRIC,
} from "../../utils/unitsName.js";
import { formatData } from "../../utils/unitUtils.js";
import { ToggleGroupContext } from "../../ToggleGroupContext.js";

const apiUrl = process.env.REACT_APP_API_URL;

const getToken = async () => {
  try {
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    const accessToken = tokenResponse.idToken;
    return accessToken;
  } catch (error) {
    console.error(error);
  }
};
const formatDate = (dateString) => {
  if (!dateString) {
    return "Error: Invalid input";
  }

  const date = new Date(dateString);

  const isDateFormat = !isNaN(date.getTime()) && dateString.includes("-");

  const isMonthYearFormat =
    isNaN(date.getTime()) && dateString.match(/^\w{3}\s\d{4}$/);

  if (isDateFormat) {
    const options = { year: "2-digit", month: "short", day: "2-digit" };
    const formattedDateString = date.toLocaleDateString("en-US", options);
    return formattedDateString.toUpperCase();
  } else if (isMonthYearFormat) {
    const [month, year] = dateString.split(" ");

    const formattedDateString = `${month} ${year}`;
    return formattedDateString.toUpperCase();
  } else {
    return dateString.toUpperCase();
  }
};
const StyledCircle = ({ colorPalette, index }) => {
  return (
    <Box
      sx={{
        height: 18,
        width: 18,
        backgroundColor: colorPalette[index % colorPalette.length],
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
};
const headers = [
  { title: "", height: "204px" },
  {
    title: "Total Distance",
    height: "44px",
    icon: <SpeedOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />,
  },
  {
    title: "",
    subtitle: "SPEED",
    height: "44px",
    icon: <SpeedOutlinedIcon sx={{ color: "#b7bf10", fontSize: "26px" }} />,
  },
  {
    title: "Avg Speed",
    height: "44px",
    icon: <SpeedOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />,
  },
  {
    title: "Max Speed",
    height: "44px",
    icon: <SpeedOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />,
  },
  {
    title: "",
    subtitle: "FUEL",
    height: "44px",
    icon: (
      <LocalGasStationOutlined sx={{ color: "#b7bf10", fontSize: "26px" }} />
    ),
  },
  {
    title: "Fuel Consumption",
    height: "44px",
    icon: (
      <LocalGasStationOutlined sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Fuel Spent",
    height: "44px",
    icon: (
      <MonetizationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "",
    subtitle: "TIME",
    height: "44px",
    icon: (
      <CalendarMonthOutlinedIcon sx={{ color: "#b7bf10", fontSize: "26px" }} />
    ),
  },
  {
    title: "Trip Time",
    height: "44px",
    icon: (
      <CalendarMonthOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Moving Time",
    height: "44px",
    icon: (
      <CalendarMonthOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Stops",
    height: "44px",
    icon: <CircleOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />,
  },
  {
    title: "Time in Traffic",
    height: "44px",
    icon: (
      <CalendarMonthOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Idle Time",
    height: "44px",
    icon: (
      <CalendarMonthOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "",
    subtitle: "ELEVATION",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#b7bf10", fontSize: "26px" }} />
    ),
  },
  {
    title: "Max Elevation",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Min Elevation",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Elevation Gain",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Uphill",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Downhill",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "",
    subtitle: "ENGINE",
    height: "44px",
    icon: (
      <ConstructionOutlinedIcon sx={{ color: "#b7bf10", fontSize: "26px" }} />
    ),
  },
  {
    title: "Max Eng. load",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
  {
    title: "Max Eng. speed",
    height: "44px",
    icon: (
      <LocationOnOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
    ),
  },
];
const HeaderColumn = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="space-evenly"
    alignItems="center"
    sx={{
      position: "sticky",
      top: "0",
      left: "0",
      zIndex: 1000,
      height: "1360px",
    }}
  >
    {headers.map((header, index) => (
      <Box
        key={index}
        width={"270px"}
        mb={"8px"}
        borderRadius={header.title === "" ? "" : "12px"}
        justifyContent={"flex-start"}
        display="flex"
        alignItems="center"
        sx={{
          height: header.height,
          color: "#FFFFFF",
          backgroundColor: header.title === "" ? "#1A1825" : "#25222F",
          position: "sticky",
          top: "0",
          zIndex: header.subtitle ? 1000 : header.title === "" ? 1100 : 1000,
        }}
      >
        {header.title === "" ? (
          <Typography
            sx={{
              marginLeft: "10%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {header.icon}
            <span>{header.subtitle}</span>
          </Typography>
        ) : (
          ""
        )}
        <Typography variant="subtitle1" sx={{ marginLeft: "20%" }}>
          {header.title === "" ? (
            ""
          ) : (
            <SwapVertIcon sx={{ color: "#FFFFFF", fontSize: "40px" }} />
          )}
          {header.title}
        </Typography>
      </Box>
    ))}
  </Box>
);
const NoDataComponent = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      height="80vh"
      width="100vw"
      sx={{
        backgroundColor: "#25222F",
        padding: 4,
        borderRadius: 2,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <SentimentDissatisfiedIcon
        sx={{ fontSize: 80, color: "#757575", mb: 2 }}
      />
      <Typography variant="h4" color="white" gutterBottom>
        No Trips Available
      </Typography>
      <Typography
        variant="subtitle1"
        color="gray"
        sx={{ textAlign: "center", maxWidth: "80%" }}
      >
        Select a different vehicle or add new trips to see them here.
      </Typography>
    </Box>
  );
};
function generateColorPalette(numRows) {
  const palette = [];
  const hueStep = 360 / numRows;

  for (let i = 0; i < numRows; i++) {
    const hue = i * hueStep;
    const color = `hsl(${hue}, 70%, 50%)`;
    palette.push(color);
  }

  return palette;
}
const TagPlaceholder = () => (
  <Box
    sx={{
      display: "inline-block",
      height: "32px",
      width: "75px",
      visibility: "hidden",
    }}
  />
);

const TableHeader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [removingTripId, setRemovingTripId] = useState(null);
  const [selectedTripIds, setSelectedTripIds] = useState(() => {
    const storedIds = localStorage.getItem("selectedTripIds");
    return storedIds ? JSON.parse(storedIds) : [];
  });
  const { unitPreference } = useContext(UnitPreferenceContext);
  const [unitName, setUnitName] = useState(DEFAULT_UNITS_METRIC);

  const [selectedTripData, setSelectedTripData] = useState([]);
  const { selectedActiveVehicle } = useContext(VehicleContext);
  const colorPalette = generateColorPalette(selectedTripIds.length);
  const { similarTrips } = useContext(ToggleGroupContext);

  useEffect(() => {
    if (unitPreference === "imperial") {
      setUnitName(DEFAULT_UNITS_IMPERIAL);
    } else {
      setUnitName(DEFAULT_UNITS_METRIC);
    }
  }, [unitPreference]);

  useEffect(() => {
    const fetchDataForTrips = async () => {
      setIsLoading(true);
      // const tripIdsParam = selectedTripIds.join("%2C");
      try {
        const accessToken = await getToken();
        const response = await axios.get(
          `${apiUrl}/api/trips?vehicleId=${selectedActiveVehicle}&queryType=all`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const formattedDate = await formatData(
          response.data.filter((item) => {
            return selectedTripIds.includes(item.id);
          }),
          unitPreference
        );
        setSelectedTripData(formattedDate);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (selectedTripIds.length > 0) {
      fetchDataForTrips();
    }
  }, [selectedTripIds, selectedActiveVehicle]);

  const handleRemoveTrip = (tripId) => {
    setRemovingTripId(tripId);

    setTimeout(() => {
      const updatedTripIds = selectedTripIds.filter((id) => id !== tripId);
      setSelectedTripIds(updatedTripIds);
      localStorage.setItem("selectedTripIds", JSON.stringify(updatedTripIds));
      window.dispatchEvent(new Event("local-storage-update"));
      const updatedTripData = selectedTripData.filter(
        (item) => item.id !== tripId
      );
      setSelectedTripData(updatedTripData);
      setRemovingTripId(null);
    }, 500);
  };

  const theme = useTheme();
  const statBoxWidth = theme.common.compareStatboxWidth;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        maxWidth:
          Array.isArray(selectedTripData) && selectedTripData.length > 0
            ? "80vw"
            : "92vw",
        maxHeight: "80vh",
      }}
    >
      <ProgressCircle isLoading={isLoading} />
      {Array.isArray(selectedTripData) && selectedTripData.length > 0 ? (
        <Box
          component="span"
          display="flex"
          justifyContent="flex-start"
          m={1}
          borderRadius="12px"
          gap={2}
          sx={{
            height: "1360px",
            whiteSpace: "nowrap",
          }}
        >
          <HeaderColumn />
          {selectedTripData.map((item, index) => (
            <div key={item.id}>
              <Box
                width={"270px"}
                height={"204px"}
                display="flex"
                flexDirection="column"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                overflowY="auto"
                sx={{
                  position: "sticky",
                  top: "0",
                  zIndex: 1,
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                  transform:
                    removingTripId === item.id ? "scaleY(0)" : "scaleY(1)",
                  transition: "transform 0.5s ease-out",
                  transformOrigin: "bottom",
                }}
              >
                <IconButton
                  onClick={() => handleRemoveTrip(item.id)}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    color: "white",
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  width="100%"
                >
                  {/* Includes avatar and date */}
                  <Box
                    display="flex"
                    flexDirection="row"
                    mb="18px"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                  >
                    <CalendarMonthOutlinedIcon
                      sx={{ color: "#AFB710", fontSize: "40px" }}
                    />

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#E9394B" }}
                    >
                      {/* {new Date(item.date).toLocaleDateString()}{" "} */}
                      {formatDate(item.date)}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="row">
                    <StyledCircle colorPalette={colorPalette} index={index} />{" "}
                    <Typography ml="4px" variant="h6" sx={{ color: "#FFFFFF" }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Box
                    ml="30px"
                    display="flex"
                    flexDirection="row"
                    maxWidth="100%"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {item &&
                    item.tags &&
                    Array.isArray(item.tags) &&
                    item.tags.length > 0 ? (
                      item.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          variant="outlined"
                          color="primary"
                          sx={{
                            color: "yellow",
                            backgroundColor: "#44414f",
                          }}
                        />
                      ))
                    ) : (
                      <TagPlaceholder />
                    )}
                  </Box>

                  {/* Includes origin */}
                  <Box display="flex" flexDirection="row">
                    <Typography ml="4px" variant="h6" sx={{ color: "#B7A7B4" }}>
                      {item.time && item.time.startTime
                        ? new Date(item.time.startTime)
                            .toISOString()
                            .substr(11, 5)
                        : null}
                      {/* Format start time */}
                    </Typography>
                    <CircleOutlinedIcon
                      sx={{ color: "#B7A7B4", fontSize: "20px" }}
                    />
                    <Typography
                      ml="4px"
                      variant="h6"
                      sx={{
                        color: "#B7A7B4",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "40%",
                      }}
                      title={
                        item.origin && item.origin.title
                          ? item.origin.title
                          : "N.A."
                      }
                    >
                      {item.origin && item.origin.title
                        ? item.origin.title
                        : "N.A."}
                    </Typography>
                  </Box>

                  {/* Includes arrow */}
                  <Box ml="35px">
                    <ArrowDownwardOutlined
                      sx={{ color: "#B7A7B4", fontSize: "20px" }}
                    />
                  </Box>

                  {/* includes destination */}
                  <Box display="flex" flexDirection="row">
                    <Typography ml="4px" variant="h6" sx={{ color: "#B7A7B4" }}>
                      {item.time && item.time.endTime
                        ? new Date(item.time.endTime)
                            .toISOString()
                            .substr(11, 5)
                        : null}
                      {/* Format end time */}
                    </Typography>
                    <CircleOutlinedIcon
                      sx={{ color: "#B7A7B4", fontSize: "20px" }}
                    />
                    <Typography
                      ml="4px"
                      variant="h6"
                      sx={{
                        color: "#B7A7B4",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "50%",
                      }}
                      title={
                        item.destination && item.destination.title
                          ? item.destination.title
                          : "N.A."
                      }
                    >
                      {item.destination && item.destination.title
                        ? item.destination.title
                        : "N.A."}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Additional Stats Boxes for each trip */}
              <Box
                key={`${item.id}-distance`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Total Distance"
                  value={
                    item.totalDistance ? item.totalDistance.toFixed(2) : "0.00"
                  }
                  unit={unitName.Distance}
                  color="black"
                />
              </Box>
              <Box
                width={statBoxWidth}
                height="44px"
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#1A1825"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
              ></Box>
              <Box
                key={`${item.id}-avgSpeed`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Avg Speed"
                  value={
                    item.speed && item.speed.avgSpeed
                      ? item.speed.avgSpeed.toFixed(2)
                      : "N.A"
                  }
                  unit={unitName.Speed}
                />
              </Box>
              <Box
                key={`${item.id}-maxSpeed`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Max Speed"
                  value={
                    item.speed && item.speed.maxSpeed
                      ? item.speed.maxSpeed.toFixed(2)
                      : "N.A"
                  }
                  unit={unitName.Speed}
                />
              </Box>
              {/* Fuel cat */}
              <Box
                width={statBoxWidth}
                height="44px"
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#1A1825"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
              ></Box>
              <Box
                key={`${item.id}-fuelConsumption`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                {/* {item.fuelConsumption && ( */}
                <StatBox
                  title="Fuel Consumption"
                  value="N.A"
                  unit={unitName.fuelConsumption}
                />
                {/* )} */}
              </Box>
              <Box
                key={`${item.id}-fuelSpent`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                {/* {item.fuelSpent && ( */}
                <StatBox
                  title="Fuel Spent"
                  value="N.A"
                  unit={unitName.fuelSpent}
                />
                {/* )} */}
              </Box>
              {/* Time cat */}
              <Box
                width={statBoxWidth}
                height="44px"
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#1A1825"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
              ></Box>
              <Box
                key={`${item.id}-tripTime`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Trip Time"
                  value={
                    item.time && item.time.tripTime
                      ? (item.time.tripTime / 60).toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.tripTime}
                />
              </Box>
              <Box
                key={`${item.id}-movingTime`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Moving Time"
                  value={
                    item.time && item.time.movingTime
                      ? (item.time.movingTime / 60).toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.tripTime}
                />
              </Box>
              <Box
                key={`${item.id}-stops`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                {/* {item.stops && */}
                <StatBox title="Stops" value="N.A" unit="" />
              </Box>
              <Box
                key={`${item.id}-timeInTraffic`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Time in Traffic"
                  value={
                    item.time && item.time.trafficTime
                      ? item.time.trafficTime
                      : "N.A"
                  }
                  unit={unitName.tripTime}
                />
              </Box>
              <Box
                key={`${item.id}-idleTime`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Idle Time"
                  value={
                    item.time && item.time.idleTime ? item.time.idleTime : "N.A"
                  }
                  unit={unitName.tripTime}
                />
              </Box>
              {/* Elevation */}
              <Box
                width={statBoxWidth}
                height="44px"
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#1A1825"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
              ></Box>
              <Box
                key={`${item.id}-maxElevation`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Max Elevation"
                  value={
                    item.elevation && item.elevation.maxElevation
                      ? item.elevation.maxElevation.toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.Elevation}
                />
              </Box>
              <Box
                key={`${item.id}-minElevation`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Min Elevation"
                  value={
                    item.elevation && item.elevation.minElevation
                      ? item.elevation.minElevation.toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.Elevation}
                />
              </Box>
              <Box
                key={`${item.id}-gainedElevation`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Elevation Gain"
                  value={
                    item.elevation && item.elevation.gainedElevation
                      ? item.elevation.gainedElevation.toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.Elevation}
                />
              </Box>
              <Box
                key={`${item.id}-lostElevation`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox title="Uphill" value="N.A" unit="" />
              </Box>
              <Box
                key={`${item.id}-uphill`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox title="Downhill" value="N.A" unit="" />
              </Box>
              {/* Engine */}
              <Box
                width={statBoxWidth}
                height="44px"
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#1A1825"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
              ></Box>
              <Box
                key={`${item.id}-maxEngineLoad`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Max Eng. load"
                  value={
                    item.engineLoad && item.engineLoad.maxEngineLoad
                      ? item.engineLoad.maxEngineLoad.toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.EngineLoad}
                />
              </Box>
              <Box
                key={`${item.id}-maxEngineSpeed`}
                width={statBoxWidth}
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                backgroundColor="#25222F"
                mb="8px"
                borderRadius="12px"
                p={1}
                position="relative"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#434255",
                  },
                }}
              >
                <StatBox
                  title="Max Eng. speed"
                  value={
                    item.engineSpee && item.engineSpeed.maxEngineSpeed
                      ? item.engineSpeed.maxEngineSpeed.toFixed(0)
                      : "N.A"
                  }
                  unit={unitName.EngineSpeed}
                />
              </Box>
            </div>
          ))}
        </Box>
      ) : (
        <NoDataComponent />
      )}
    </div>
  );
};

export default TableHeader;
