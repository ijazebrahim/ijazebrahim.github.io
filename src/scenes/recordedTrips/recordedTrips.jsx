import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  CircularProgress,
  Skeleton,
  styled,
  Switch,
} from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { tokens } from "../../theme";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
// import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import LocalGasStationOutlined from "@mui/icons-material/LocalGasStationOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import StatBox from "../../components/StatBox";
import Stack from "@mui/material/Stack";
import axios from "axios";
import { useState, useEffect, useContext, useRef } from "react";
import MyDateRangePicker from "../../components/DateRangePicker";
import { ArrowDownwardOutlined, Forward } from "@mui/icons-material";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import { useNavigate } from "react-router-dom";
import { VehicleContext } from "../../VehicleContext";
import InfoIcon from "@mui/icons-material/Info";
import ProgressCircle from "../../components/ProgressCircle";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { parse } from "nth-check";
import UnitPreferenceContext from "../../UnitPreferenceContext.js";
import {
  DEFAULT_UNITS_METRIC,
  DEFAULT_UNITS_IMPERIAL,
} from "../../utils/unitsName.js";
import { formatData } from "../../utils/unitUtils.js";
import { ToggleGroupContext } from "../../ToggleGroupContext.js";

const useIntersectionObserver = (options) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting);
      });
    }, options);

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [options]);

  return [elementRef, isInView];
};

function formatDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = { year: "2-digit", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
}

function formatTimestamp(timestamp) {
  const dateOnly = timestamp.split("T")[0];
  const formattedDate = formatDateFromTimestamp(dateOnly);
  return formattedDate.toUpperCase();
}

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

const MapItem = ({ item, waypoints, customStartMarker, customEndMarker }) => {
  const [mapRef, mapInView] = useIntersectionObserver({
    rootMargin: "0px",
    threshold: 0.1,
  });
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (mapInView && waypoints?.[item.id] && waypoints[item.id]?.length > 0) {
      setIsMapLoaded(true);
    }
  }, [mapInView, waypoints, item.id]);

  const getBounds = () => {
    if (waypoints?.[item.id] && waypoints[item.id].length > 0) {
      return [
        waypoints[item.id][0],
        waypoints[item.id][waypoints[item.id].length - 1],
      ];
    }
    return null;
  };

  const bounds = getBounds();
  return (
    <Box
      ref={mapRef}
      display="flex"
      width="125vw"
      marginLeft="-10px"
      style={{
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        opacity: mapInView ? 1 : 0,
        transform: mapInView ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {isMapLoaded && bounds ? (
        <MapContainer
          attributionControl={false}
          bounds={bounds}
          style={{ flex: "auto", height: "300px", zIndex: "0" }}
        >
          {waypoints?.[item.id] && (
            <>
              <TileLayer url="https://atlas.microsoft.com/map/tile/png?api-version=1&layer=basic&style=dark&tileSize=512&view=Auto&zoom={z}&x={x}&y={y}&subscription-key=6vuNs7oLJKeZR-z9RUSKw0wlXtq6oTjBB-_t9BWPwhU" />
              <Polyline positions={waypoints[item.id]} color="red" />
              <Marker position={waypoints[item.id][0]} icon={customStartMarker}>
                <Popup>Start</Popup>
              </Marker>
              <Marker
                position={waypoints[item.id][waypoints[item.id].length - 1]}
                icon={customEndMarker}
              >
                <Popup>End</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      ) : (
        <Box
          display="flex"
          width="100%"
          marginLeft="-10px"
          style={{
            height: "300px",
            backgroundColor: "#25222F",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ":hover": {
              backgroundColor: "#434255",
            },
          }}
        >
          <CircularProgress size={60} sx={{ color: "yellow" }} />
          <Typography variant="h3" sx={{ color: "white", marginLeft: "10px" }}>
            Loading map...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const RecordedTrips = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedButton, setSelectedButton] = useState("allTime");
  const [waypoints, setWaypoints] = useState([]);
  const [dateRange, setDateRange] = useState([
    new Date(2020, 0, 1),
    new Date(),
  ]);

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { selectedActiveVehicle } = useContext(VehicleContext);
  const [averageConsumption, setAverageConsumption] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(() => {
    const savedTags = localStorage.getItem("selectedTags");
    if (savedTags) {
      const parsedTags = JSON.parse(savedTags);
      const allExist = parsedTags.every((tag) => tags.includes(tag));
      return allExist ? parsedTags : [];
    }
    return [];
  });

  const [totalDistance, setTotalDistance] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [period, setPeriod] = useState("thisWeek");
  const [showData, setShowData] = useState(false);
  const [isAlltimeLoaded, setIsAlltimeLoaded] = useState(false);
  const [notification, setNotification] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [selectedDayMonth, setSelectedDayMonth] = useState(null);
  const [selectedDayWeek, setSelectedDayWeek] = useState(null);
  const [selectDay, setSelectDay] = useState(null);
  const [selectDayRange, setSelectDayRange] = useState(null);
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);
  // const [similarTrips, setSimilarTrips] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [hoveredItems, setHoveredItems] = useState({});
  const [unitName, setUnitName] = useState(DEFAULT_UNITS_METRIC);
  const { unitPreference, setUnitPreference } = useContext(
    UnitPreferenceContext
  );
  const { similarTrips, setSimilarTrips } = useContext(ToggleGroupContext);
  const [stats, setStats] = useState({
    totalTrips: 0,
    roundedTotalDistance: 0,
    maxSpeed: 0,
    averageConsumption: 0,
  });
  const [enableCompare, setEnableCompare] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [selectedItems, setSelectedItems] = useState(() => {
    const savedItems = localStorage.getItem("selectedTripIds");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  useEffect(() => {
    if (
      selectedItems &&
      selectedItems.length > 0 &&
      similarTrips &&
      data.length > 0
    ) {
      setSelectedGroup(() => {
        const trip = data.find((item) => {
          return selectedItems.includes(item.id);
        });
        return trip ? [trip.origin, trip.destination] : selectedGroup;
      });
      setSelectedTrips(selectedGroup);
    } else {
      setSelectedGroup([]);
    }
  }, [selectedItems, similarTrips, data]);
  useEffect(() => {
    if (unitPreference === "imperial") {
      setUnitName(DEFAULT_UNITS_IMPERIAL);
    } else {
      setUnitName(DEFAULT_UNITS_METRIC);
    }
  }, [unitPreference]);

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black,
      fontSize: "24px",
    },
  }));

  const SimilarTripsToggle = styled((props) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#B7BF10" : "#65C466",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#33cf4d",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));
  useEffect(() => {
    try {
      const storedDateRange = localStorage.getItem("dateRange");
      if (storedDateRange) {
        const parsedDateRange = JSON.parse(storedDateRange);
        if (Array.isArray(parsedDateRange) && parsedDateRange.length === 2) {
          const validatedDateRange = parsedDateRange.map((d) => new Date(d));
          if (validatedDateRange.every((date) => !isNaN(date.getTime()))) {
            setDateRange(validatedDateRange);
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing date range from localStorage:", error);
    }

    localStorage.setItem(
      "dateRange",
      JSON.stringify(dateRange.map((d) => d.toISOString()))
    );
  }, []);

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

  const handleSimilarTripsToggle = () => {
    setSimilarTrips((prev) => !prev);
    setSelectedTrips([]);
    setSelectedGroup([]);
    switch (selectedButton) {
      case "allTime":
        setSelectedYear(null);
        break;
      case "thisYear":
        setSelectedMonthYear(null);
        break;
      case "thisMonth":
        setSelectedDayMonth(null);
        break;
      case "thisWeek":
        setSelectedDayWeek(null);
        break;
      case "today":
        setSelectDay(null);
        break;
      case "custom":
        setSelectDayRange(null);
        break;
      default:
        break;
    }
    // setSelectDayRange(null);
    // setSelectDay(null);
    // setSelectedMonthYear(null);
    // setSelectedYear(null);
    // setSelectedDayMonth(null);
    // setSelectedDayWeek(null);

    localStorage.removeItem("selectedTripIds");
    window.dispatchEvent(new Event("local-storage-update"));
    setSelectedItems([]);
    setShowData(true);
  };
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedMonthYear(null);
  };

  const handleMonthYearSelect = (monthYear) => {
    setSelectedMonthYear(monthYear);
  };

  const handleDayMonthSelect = (dayMonth) => {
    setSelectedDayMonth(dayMonth);
  };

  const handleDayWeekSelect = (dayWeek) => {
    setSelectedDayWeek(dayWeek);
  };
  const handleDayRangeSelect = (dayRange) => {
    setSelectDayRange(dayRange);
  };
  const handleTripSelect = (tripData) => {
    setSelectedTrips(tripData);
  };

  useEffect(() => {
    const getStoredDateRange = () => {
      const storedDateRange = localStorage.getItem("dateRange");
      if (storedDateRange) {
        const parsedDateRange = JSON.parse(storedDateRange);
        return parsedDateRange.map((d) => new Date(d));
      }
      return null;
    };

    const storedDateRange = getStoredDateRange();

    if (storedDateRange) {
      handleDateRangeSelect(storedDateRange);
    } else if (selectedActiveVehicle) {
      localStorage.removeItem("dateRange");
      handleAllTimeClick(selectedActiveVehicle);
    }
  }, [selectedActiveVehicle]);

  useEffect(() => {
    if (dateRange && showData) {
      handleDateRangeSelect(dateRange);
      setShowData(false);
    }
  }, [dateRange, showData]);

  const handleDateRangeSelect = async (date) => {
    if (!date || date.length === 0) {
      return;
    }

    // const dateRangeToStore = date.map((d) => d.toISOString());
    // localStorage.setItem("dateRange", JSON.stringify(dateRangeToStore));
    localStorage.setItem(
      "dateRange",
      JSON.stringify(date.map((date) => date.toLocaleString()))
    );

    setIsLoading(true);
    const accessToken = await getToken();
    setDateRange(date);

    const startDate = date[0];
    const endDate = date[1];
    const vehicleId = selectedActiveVehicle;
    const queryType = "custom";

    const tagsParameter = selectedTags
      .map((tag) => `tags[]=${encodeURIComponent(tag)}`)
      .join("&");

    try {
      const response = await axios.get(
        `${apiUrl}/api/trips/?${tagsParameter}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            start: startDate,
            end: endDate,
            vehicleId,
            queryType,
          },
        }
      );

      const filteredData = response.data.filter(
        (item) => item.status === "ready"
      );
      const invertedData = filteredData.reverse();
      const convertedInversedData = await formatData(
        invertedData,
        unitPreference
      );

      // Set the inverted data
      setData(convertedInversedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDateRangeClick = (date) => {
    if (date) {
      setSelectedButton("custom");
      setSelectDayRange(null);
      setIsDateRangeSelected(true);
      date[0].setHours(0, 0, 0, 0);
      date[1].setHours(23, 59, 59, 999);
      // setDateRange([startDate, endDate]);
      setDateRange(date);
      // setSelectedTrips(null);
      setShowData(true);
    } else {
      setIsDateRangeSelected(false);
    }
  };
  const handleOnOpen = () => {
    setSelectDayRange(null);
  };
  const handleThisYearClick = () => {
    const today = new Date();
    const year = today.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date();
    setDateRange([start, end]);
    setPeriod("thisYear");
    setSelectedButton("thisYear");
    setShowData(true);
    setSelectedMonthYear(null);
    setSelectedDayMonth(null);
    setSelectedYear(year);
    // setSelectedTrips(null);
  };

  const handleAllTimeClick = () => {
    // const today = new Date();
    const start = new Date(2020, 0, 1);
    const end = new Date();
    setDateRange([start, end]);
    setPeriod("allTime");
    setSelectedButton("allTime");
    setShowData(true);
    setSelectedYear(null);
    setSelectedMonthYear(null);
    setSelectedDayMonth(null);
    // setSelectedTrips(null);
  };

  const handleThisWeekClick = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.getFullYear(), today.getMonth(), diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), diff + 6);
    end.setHours(23, 59, 59, 999);
    setDateRange([start, end]);
    setPeriod("thisWeek");
    setSelectedButton("thisWeek");
    setSelectedDayWeek(null);
    setSelectedYear(today.getFullYear());
    setSelectedMonthYear(today.toLocaleString("default", { month: "short" }));
    setSelectedDayMonth(null);
    // setSelectedTrips(null);
    setShowData(true);
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateRange([start, end]);
    setPeriod("thisMonth");
    setSelectedButton("thisMonth");
    setSelectedDayMonth(null);
    setSelectedYear(today.getFullYear());
    setSelectedMonthYear(today.toLocaleString("default", { month: "short" }));
    // setSelectedTrips(null);
    setShowData(true);
  };

  const handleTodayClick = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    setDateRange([todayStart, todayEnd]);

    setSelectedButton("today");
    setPeriod("today");
    setSelectedDayMonth(todayStart.getDate());
    setSelectedYear(todayStart.getFullYear());
    setSelectedMonthYear(
      todayStart.toLocaleString("default", { month: "short" })
    );
    setSelectDay(todayStart.getDate());
    // setSelectedTrips(null);
    setShowData(true);
  };

  const customEndMarker = new L.Icon({
    iconUrl:
      "https://driveinsightsstorage.blob.core.windows.net/driveinsightscontainer/LocationEndMarker.png",
    iconAnchor: [16, 16],
  });

  const customStartMarker = new L.Icon({
    iconUrl:
      "https://driveinsightsstorage.blob.core.windows.net/driveinsightscontainer/LocationStartMarker.png",
    iconAnchor: [2, 8],
  });

  useEffect(() => {
    localStorage.setItem("selectedTags", JSON.stringify(selectedTags));
  }, [selectedTags]);

  const handleTagChange = (event) => {
    setSelectedTags(event.target.value);
  };

  // Fetch Tags

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = await getToken();
        const response = await fetch(
          `${apiUrl}/api/trips/tags/${selectedActiveVehicle}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    if (selectedActiveVehicle) {
      fetchData();
    }
  }, [selectedActiveVehicle]);

  useEffect(() => {
    handleDateRangeSelect(dateRange);
  }, [selectedTags]);

  const truncateTag = (tag) => {
    return tag.length > 20 ? `${tag.substring(0, 20)}...` : tag;
  };

  const fetchWaypoints = async (tripId) => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const requestBody = {
        tripIds: [tripId],
      };

      const response = await fetch(`${apiUrl}/api/trips/waypoints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (
          data &&
          data.length > 0 &&
          data[0].coordinates &&
          data[0].coordinates.values
        ) {
          const convertedPoints = data[0].coordinates.values
            .map((coordinate) => {
              if (coordinate && coordinate.latitude && coordinate.longitude) {
                return [coordinate.latitude, coordinate.longitude];
              } else {
                console.error("Invalid coordinate:", coordinate);
                return null;
              }
            })
            .filter((point) => point !== null);
          setIsLoading(false);
          return convertedPoints;
        } else {
          throw new Error("Coordinates are not defined in the response.");
        }
      } else {
        throw new Error("Failed to fetch waypoints");
      }
    } catch (error) {
      console.error("Error fetching waypoints:", error);
      setIsLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const fetchPromises = data.map((item) =>
        fetchWaypoints(item.id).then((waypointsData) => {
          return { id: item.id, waypoints: waypointsData };
        })
      );
      Promise.all(fetchPromises)
        .then((waypointsArray) => {
          const waypointsDict = {};
          waypointsArray.forEach((waypointsItem) => {
            waypointsDict[waypointsItem.id] = waypointsItem.waypoints;
          });
          setWaypoints(waypointsDict);
        })
        .catch((error) => {
          // Handle errors here
          console.error("Error fetching waypoints:", error);
        });
    }
  }, [data]);

  useEffect(() => {
    if (selectedItems.length > 0 && similarTrips) {
      setSelectedGroup(selectedTrips);
    } else {
      setSelectedGroup([]);
    }
  }, [selectedItems, similarTrips]);

  useEffect(() => {
    if (
      selectedTrips &&
      selectedTrips.length > 0 &&
      similarTrips &&
      selectedGroup.length > 0
    ) {
      if (
        selectedTrips[0]?.title !== selectedGroup[0]?.title ||
        (selectedTrips[1] &&
          selectedGroup[1] &&
          selectedTrips[1]?.title !== selectedGroup[1]?.title)
      ) {
        setEnableCompare(false);
      } else {
        setEnableCompare(true);
      }
    }
  }, [selectedTrips, similarTrips, selectedGroup]);

  useEffect(() => {
    localStorage.setItem("selectedTripIds", JSON.stringify(selectedItems));
    window.dispatchEvent(new Event("local-storage-update"));
  }, [selectedItems]);

  const handleSelectedItems = (id, event) => {
    event.stopPropagation();
    setSelectedItems((prevSelectedItems) => {
      let newSelectedItems;
      let message;

      if (prevSelectedItems.includes(id)) {
        newSelectedItems = prevSelectedItems.filter((item) => item !== id);
        message = `Trip removed successfully`;
      } else {
        newSelectedItems = [...prevSelectedItems, id];
        message = `Trip added successfully`;
      }

      setNotification(message);
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
      }, 500);
      return newSelectedItems;
    });
    if (selectedTrips.length > 0 && similarTrips) {
      setSelectedGroup(selectedTrips);
    }
  };

  const getIcon = () => {
    if (notification.includes("added")) {
      return (
        <CheckCircleIcon
          style={{ color: "green", fontSize: 60, marginBottom: 20 }}
        />
      );
    } else if (notification.includes("removed")) {
      return (
        <CancelIcon style={{ color: "red", fontSize: 60, marginBottom: 20 }} />
      );
    }
  };

  function sortAlphabetically(arr) {
    const customSort = (a, b) => {
      const normalizedA = a.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const normalizedB = b.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      const isSpecialA = !/^[a-zA-Z0-9]/.test(a);
      const isSpecialB = !/^[a-zA-Z0-9]/.test(b);

      if (isSpecialA && !isSpecialB) {
        return -1;
      }
      if (!isSpecialA && isSpecialB) {
        return 1;
      }

      if (normalizedA < normalizedB) {
        return -1;
      }
      if (normalizedA > normalizedB) {
        return 1;
      }
      return 0;
    };

    return [...arr].sort(customSort);
  }

  const [yearFilteredData, setYearFilteredData] = useState([]);
  const [monthFilteredData, setMonthFilteredData] = useState([]);
  const [dayFilteredData, setDayFilteredData] = useState([]);
  const [weekFilteredData, setWeekFilteredData] = useState([]);
  const [todayFilteredData, setTodayFilteredData] = useState([]);
  const [customFilteredData, setCustomFilteredData] = useState([]);

  const filterDataForDatesInRange = (selectDayRange) => {
    if (selectDayRange) {
      const day = selectDayRange.getDate();
      const month = selectDayRange.getMonth();
      const year = selectDayRange.getFullYear();

      return data.filter((item) => {
        const itemDate = new Date(item.date);

        return (
          itemDate.getDate() === day &&
          itemDate.getMonth() === month &&
          itemDate.getFullYear() === year
        );
      });
    } else {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);

        return itemDate >= startDate && itemDate <= endDate;
      });
    }
  };

  useEffect(() => {
    setCustomFilteredData(filterDataForDatesInRange(selectDayRange));
  }, [selectDayRange, selectedButton, dateRange, data]);

  useEffect(() => {
    const filteredData = selectedYear
      ? data.filter(
          (item) => new Date(item.date).getFullYear() === selectedYear
        )
      : data;
    setYearFilteredData(filteredData);
  }, [selectedYear, data]);

  const filterData = (selectedMonthYear) => {
    if (selectedMonthYear) {
      const [month, year] = selectedMonthYear.split(" ");
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === parseInt(year, 10) &&
          itemDate.getMonth() === monthIndex
        );
      });
    }
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === selectedYear;
    });
  };
  useEffect(() => {
    setMonthFilteredData(filterData(selectedMonthYear));
  }, [selectedMonthYear, selectedButton, selectedYear, data]);

  const filterDayData = (selectedDayMonth) => {
    if (selectedDayMonth) {
      const day = selectedDayMonth;
      const month = selectedMonthYear;
      const monthIndex = new Date(`${month} 1, 2021`).getMonth();
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === monthIndex &&
          itemDate.getDate() === parseInt(day, 10)
        );
      });
    } else {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === currentYear &&
          itemDate.getMonth() === currentMonth
        );
      });
    }
  };
  const filterTodayData = (selectDay) => {
    if (selectDay) {
      const day = selectDay;
      const month = selectedMonthYear;
      const monthIndex = new Date(`${month} 1, 2021`).getMonth();
      const currentYear = new Date().getFullYear();
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === monthIndex &&
          itemDate.getDate() === parseInt(day, 10) &&
          itemDate.getFullYear() === currentYear
        );
      });
    } else {
      return null;
    }
  };

  useEffect(() => {
    setTodayFilteredData(filterTodayData(selectDay));
  }, [selectDay, selectedButton, selectedMonthYear, data]);

  useEffect(() => {
    setDayFilteredData(filterDayData(selectedDayMonth));
  }, [selectedDayMonth, selectedButton, selectedMonthYear, data]);

  const filterWeekData = (selectedDayWeek) => {
    if (selectedDayWeek) {
      const day = selectedDayWeek.getDate();
      const month = selectedDayWeek.getMonth();
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === month &&
          itemDate.getDate() === parseInt(day, 10)
        );
      });
    } else {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
  };

  useEffect(() => {
    setWeekFilteredData(filterWeekData(selectedDayWeek));
  }, [selectedDayWeek, selectedButton, dateRange, data]);

  const getMonthsWithData = () => {
    const months = new Set();
    data.forEach((item) => {
      const itemDate = new Date(item.date);
      if (itemDate.getFullYear() === selectedYear) {
        months.add(itemDate.getMonth());
      }
    });
    return Array.from(months);
  };

  const renderMonths = () => {
    const monthsWithData = getMonthsWithData();
    const now = new Date();
    const currentMonth = now.getMonth();

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const orderedMonths = months.slice(0, currentMonth + 1).reverse();

    return orderedMonths
      .map((month, index) => {
        const monthIndex = months.indexOf(month);
        if (monthsWithData.includes(monthIndex)) {
          const monthYear = `${month}, ${now.getFullYear()}`;

          return (
            <Box
              key={monthYear}
              onClick={() => handleMonthYearSelect(monthYear, false)}
              display={"flex"}
              justifyContent={"flex-start"}
              gap={1}
              alignItems={"center"}
              backgroundColor={
                monthYear === selectedMonthYear ? "#434255" : "#25222F"
              }
              mb="8px"
              borderRadius="12px"
              p={1}
              position="relative"
              sx={{
                height: "10vh",
                fontSize: "24px",
                cursor: "pointer",
                ":hover": {
                  backgroundColor: "#434255",
                },
              }}
            >
              <CalendarMonthOutlinedIcon
                sx={{
                  color: colors.greenAccent[600],
                  fontSize: "40px",
                }}
              />
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "#E9394B" }}
                >
                  {monthYear}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: "#F4F4F4" }}
                >
                  {filterData(monthYear).length} Trips
                </Typography>
              </Box>
            </Box>
          );
        }
        return null;
      })
      .filter((month) => month !== null);
  };

  const getYearsWithData = () => {
    const years = new Set();
    data.forEach((item) => {
      const year = new Date(item.date).getFullYear();
      years.add(year);
    });
    return Array.from(years);
  };

  const renderYear = () => {
    const yearsWithData = getYearsWithData();
    const today = new Date();
    const currentYear = today.getFullYear();
    const years = [];
    for (let i = currentYear; i >= 2020; i--) {
      if (yearsWithData.includes(i)) {
        years.push(i);
      }
    }
    return years.map((year) => (
      <Box
        key={year}
        onClick={() => handleYearSelect(year, false)}
        display={"flex"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        backgroundColor={year === selectedYear ? "#434255" : "#25222F"}
        mb="8px"
        borderRadius="12px"
        p={1}
        position="relative"
        gap={1}
        sx={{
          height: "10vh",
          fontSize: "24px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#434255",
          },
        }}
      >
        <CalendarMonthOutlinedIcon
          sx={{
            color: colors.greenAccent[600],
            fontSize: "40px",
          }}
        />
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: "#E9394B" }}>
            {year}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#F4F4F4" }}>
            {data.reduce(
              (count, item) =>
                new Date(item.date).getFullYear() === year ? count + 1 : count,
              0
            )}{" "}
            Trips
          </Typography>
        </Box>
      </Box>
    ));
  };

  const renderDays = () => {
    const days = new Set();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    data.forEach((item) => {
      const itemDate = new Date(item.date);
      if (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      ) {
        days.add(itemDate.getDate());
      }
    });
    return Array.from(days).map((day) => (
      <Box
        key={day}
        display={"flex"}
        onClick={() => handleDayMonthSelect(day, false)}
        justifyContent={"flex-start"}
        alignItems={"center"}
        backgroundColor={day === selectedDayMonth ? "#434255" : "#25222F"}
        mb="8px"
        borderRadius="12px"
        p={1}
        position="relative"
        gap={1}
        sx={{
          height: "10vh",
          fontSize: "24px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#434255",
          },
        }}
      >
        <CalendarMonthOutlinedIcon
          sx={{
            color: colors.greenAccent[600],
            fontSize: "40px",
          }}
        />
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: "#E9394B" }}>
            {day}
            {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
            {", "}
            {months[currentMonth]}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#F4F4F4" }}>
            {filterDayData(day).length} Trips
          </Typography>
        </Box>
      </Box>
    ));
  };

  const renderWeeks = () => {
    const weeks = new Set();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    data.forEach((item) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      itemDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      if (itemDate >= startDate && itemDate <= endDate) {
        const weekString = itemDate.toISOString().split("T")[0];
        if (filterWeekData(new Date(weekString)).length > 0) {
          weeks.add(weekString);
        }
      }
    });
    return Array.from(weeks).map((weekString) => {
      const week = new Date(weekString);
      return (
        <Box
          key={weekString}
          display={"flex"}
          onClick={() => handleDayWeekSelect(week, false)}
          justifyContent={"flex-start"}
          alignItems={"center"}
          backgroundColor={
            week.getTime() === selectedDayWeek?.getTime()
              ? "#434255"
              : "#25222F"
          }
          mb="8px"
          borderRadius="12px"
          p={1}
          position="relative"
          gap={1}
          sx={{
            height: "10vh",
            fontSize: "24px",
            cursor: "pointer",
            ":hover": {
              backgroundColor: "#434255",
            },
          }}
        >
          <CalendarMonthOutlinedIcon
            sx={{
              color: colors.greenAccent[600],
              fontSize: "40px",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#E9394B" }}
            >
              {week.getDate()}
              {week.getDate() % 10 === 1 && week.getDate() !== 11
                ? "st"
                : week.getDate() % 10 === 2 && week.getDate() !== 12
                ? "nd"
                : week.getDate() % 10 === 3 && week.getDate() !== 13
                ? "rd"
                : "th"}
              {", "}
              {months[week.getMonth()]}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#F4F4F4" }}
            >
              {filterWeekData(week).length} Trips
            </Typography>
          </Box>
        </Box>
      );
    });
  };

  const renderDay = () => {
    const today = new Date();

    return (
      <Box
        display={"flex"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        backgroundColor={"#25222F"}
        mb="8px"
        borderRadius="12px"
        p={1}
        position="relative"
        gap={1}
        sx={{
          height: "10vh",
          fontSize: "24px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#434255",
          },
        }}
      >
        <CalendarMonthOutlinedIcon
          sx={{
            color: colors.greenAccent[600],
            fontSize: "40px",
          }}
        />
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: "#E9394B" }}>
            {today.getDate()}
            {today.getDate() % 10 === 1 && today.getDate() !== 11
              ? "st"
              : today.getDate() % 10 === 2 && today.getDate() !== 12
              ? "nd"
              : today.getDate() % 10 === 3 && today.getDate() !== 13
              ? "rd"
              : "th"}
            {", "}
            {today.toLocaleString("default", { month: "short" })}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#F4F4F4" }}>
            {filterDayData().length} Trips
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderCustom = () => {
    const Days = new Set();
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    data.forEach((item) => {
      const itemDate = new Date(item.date);
      if (itemDate >= startDate && itemDate <= endDate) {
        const dayString = itemDate.toISOString().split("T")[0];
        Days.add(dayString);
      }
    });

    const sortedDays = Array.from(Days).sort(
      (a, b) => new Date(b) - new Date(a)
    );
    return sortedDays.map((dayString) => {
      const day = new Date(dayString);
      return (
        <Box
          key={dayString}
          display={"flex"}
          onClick={() => handleDayRangeSelect(day, false)}
          justifyContent={"flex-start"}
          alignItems={"center"}
          backgroundColor={
            day.getTime() === selectedDayWeek?.getTime() ? "#434255" : "#25222F"
          }
          mb="8px"
          borderRadius="12px"
          p={1}
          position="relative"
          gap={1}
          sx={{
            height: "10vh",
            fontSize: "24px",
            cursor: "pointer",
            ":hover": {
              backgroundColor: "#434255",
            },
          }}
        >
          <CalendarMonthOutlinedIcon
            sx={{
              color: colors.greenAccent[600],
              fontSize: "40px",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#E9394B" }}
            >
              {day.getDate()}
              {day.getDate() % 10 === 1 && day.getDate() !== 11
                ? "st"
                : day.getDate() % 10 === 2 && day.getDate() !== 12
                ? "nd"
                : day.getDate() % 10 === 3 && day.getDate() !== 13
                ? "rd"
                : "th"}
              {", "}
              {months[day.getMonth()]}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#F4F4F4" }}
            >
              {filterDataForDatesInRange(day).length} Trips
            </Typography>
          </Box>
        </Box>
      );
    });
  };

  const groupTripsByOriginAndDestination = () => {
    if (typeof data !== "object") {
      console.error("Data is not an object:", data);
      return [];
    }

    const groupedTrips = Object.values(data).reduce((groups, trip) => {
      const { origin, destination } = trip;
      const key = `${origin.title}-${destination.title}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(trip);
      return groups;
    }, {});

    return Object.values(groupedTrips);
  };
  const renderSimilarTrips = () => {
    if (similarTrips) {
      const groupedTrips = groupTripsByOriginAndDestination();
      return groupedTrips.map((group, index) => {
        const trip = group[0];
        const { origin, destination } = trip;
        return (
          <Box
            key={index}
            onClick={() => handleTripSelect([origin, destination])}
            display={"flex"}
            justifyContent={"flex-start"}
            alignItems={"center"}
            backgroundColor={
              selectedTrips &&
              selectedTrips[0]?.title === origin.title &&
              selectedTrips[1]?.title === destination.title
                ? "#434255"
                : "#25222F"
            }
            mb="8px"
            borderRadius="12px"
            p={1}
            position="relative"
            gap={1}
            overflow={"hidden"}
            sx={{
              minHeight: "125px",
              height: "10vh",
              fontSize: "24px",
              cursor: "pointer",
              ":hover": {
                backgroundColor: "#434255",
              },
              border:
                selectedGroup &&
                origin.title === selectedGroup[0]?.title &&
                destination.title === selectedGroup[1]?.title
                  ? "1px solid #B7BF10"
                  : "none",
            }}
          >
            <Box
              display={"flex"}
              flexDirection={"column"}
              sx={{
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Box display={"flex"} alignItems={"center"}>
                <LocationOnOutlinedIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
                <Box
                  display={"flex"}
                  gap={1}
                  onMouseEnter={() =>
                    setHoveredItems({ ...hoveredItems, [index]: true })
                  }
                  onMouseLeave={() =>
                    setHoveredItems({ ...hoveredItems, [index]: false })
                  }
                >
                  <Box
                    width={"9vw"}
                    maxWidth={"100%"}
                    sx={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#E9394B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: hoveredItems[index] ? "normal" : "nowrap",
                    }}
                  >
                    {origin.title}
                  </Box>
                  <Forward />
                  <Box
                    width={"9vw"}
                    maxWidth={"100%"}
                    sx={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#E9394B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: hoveredItems[index] ? "normal" : "nowrap",
                    }}
                  >
                    {destination.title}
                  </Box>
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#F4F4F4", paddingLeft: "1vw" }}
              >
                {group.length} Trips
              </Typography>
            </Box>
          </Box>
        );
      });
    }
  };

  const calculateStats = (filteredData) => {
    if (filteredData === null || filteredData.length === 0) {
      setIsStatsLoaded(true);
      return {
        totalTrips: 0,
        roundedTotalDistance: 0,
        maxSpeed: 0,
        averageConsumption: 0,
      };
    }
    if (similarTrips && selectedTrips && selectedTrips.length === 2) {
      filteredData = filteredData.filter((item) => {
        const origin = selectedTrips[0]?.title;
        const destination = selectedTrips[1]?.title;
        return (
          item.origin &&
          item.origin.title === origin &&
          item.destination &&
          item.destination.title === destination
        );
      });
    }
    const totalTrips = filteredData.length;
    const totalDistance = filteredData.reduce(
      (sum, item) => sum + item.totalDistance,
      0
    );
    const roundedTotalDistance = Number(totalDistance.toFixed(2));

    const maxSpeedcal = filteredData.reduce((max, item) => {
      const speeds = Object.values(item.speed);
      const itemMaxSpeed = Math.max(...speeds);
      return Math.max(max, itemMaxSpeed);
    }, 0);
    const maxSpeed = Number(maxSpeedcal.toFixed(2));

    const averageConsumption = filteredData.reduce(
      (sum, item) => sum + item.averageConsumption,
      0
    );
    setIsStatsLoaded(true);
    return {
      totalTrips,
      roundedTotalDistance,
      maxSpeed,
      averageConsumption,
    };
  };

  useEffect(() => {
    setIsStatsLoaded(false);
    let newStats = null;
    if (selectedButton === "allTime" || selectedYear !== null) {
      newStats = calculateStats(yearFilteredData);
    } else if (
      selectedButton === "thisYear" &&
      similarTrips &&
      selectedTrips &&
      selectedTrips.length === 2
    ) {
      newStats = calculateStats(yearFilteredData);
    }
    if (selectedButton === "thisYear" && selectedMonthYear !== null) {
      newStats = calculateStats(monthFilteredData);
    } else if (
      selectedButton === "thisYear" &&
      similarTrips &&
      selectedTrips &&
      selectedTrips.length === 2
    ) {
      newStats = calculateStats(monthFilteredData);
    }
    if (selectedButton === "thisMonth" && selectedDayMonth !== null) {
      newStats = calculateStats(dayFilteredData);
    } else if (
      selectedButton === "thisMonth" &&
      similarTrips &&
      selectedTrips &&
      selectedTrips.length === 2
    ) {
      newStats = calculateStats(dayFilteredData);
    }
    if (selectedButton === "thisWeek" && selectedDayWeek !== null) {
      newStats = calculateStats(weekFilteredData);
    } else if (
      selectedButton === "thisWeek" &&
      similarTrips &&
      selectedTrips &&
      selectedTrips.length === 2
    ) {
      newStats = calculateStats(weekFilteredData);
    }
    if (selectedButton === "today" && selectDay !== null) {
      newStats = calculateStats(todayFilteredData);
    } else if (
      selectedButton === "today" &&
      similarTrips &&
      selectedTrips &&
      selectedTrips.length === 2
    ) {
      newStats = calculateStats(todayFilteredData);
    }
    if (selectedButton === "custom" && selectDayRange !== null) {
      newStats = calculateStats(customFilteredData);
    } else if (
      selectedButton === "custom" &&
      similarTrips &&
      selectedTrips &&
      selectedTrips.length === 2
    ) {
      newStats = calculateStats(customFilteredData);
    }

    if (newStats !== null) {
      setStats(newStats);
    }
  }, [
    selectedButton,
    similarTrips,
    dateRange,
    yearFilteredData,
    monthFilteredData,
    dayFilteredData,
    weekFilteredData,
    todayFilteredData,
    customFilteredData,
    selectedYear,
    selectedMonthYear,
    selectedDayMonth,
    selectedDayWeek,
    selectDay,
    selectDayRange,
    selectedTrips,
  ]);

  return (
    <Box m="20px">
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#1A1825",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getIcon()}
          <Typography
            id="modal-modal-description"
            variant="h3"
            sx={{ textAlign: "center" }}
          >
            {notification}
          </Typography>
        </Box>
      </Modal>
      <ProgressCircle isLoading={isLoading} />
      <Box mb="24px" display={"flex"} justifyContent={"space-between"}>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <Button
            onClick={handleAllTimeClick}
            sx={{
              backgroundColor:
                selectedButton === "allTime" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            ALL TIME
          </Button>
          <Button
            onClick={handleThisYearClick}
            sx={{
              backgroundColor:
                selectedButton === "thisYear" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            YEAR
          </Button>
          <Button
            onClick={handleThisMonthClick}
            sx={{
              backgroundColor:
                selectedButton === "thisMonth" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            MONTH
          </Button>
          <Button
            onClick={handleThisWeekClick}
            sx={{
              backgroundColor:
                selectedButton === "thisWeek" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            WEEK
          </Button>
          <Button
            onClick={handleTodayClick}
            sx={{
              backgroundColor:
                selectedButton === "today" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            DAY
          </Button>
          <MyDateRangePicker
            onChange={handleCustomDateRangeClick}
            value={dateRange}
            loading={isLoading}
            onOpen={handleOnOpen}
          />
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="demo-select-small">Tags</InputLabel>
            <Select
              labelId="demo-select-small"
              id="demo-select-small"
              multiple
              value={selectedTags}
              label="Tags"
              onChange={handleTagChange}
              renderValue={(selected) =>
                selected
                  .map((tag) =>
                    tag.length > 20 ? `${tag.substring(0, 20)}...` : tag
                  )
                  .join(", ")
              }
            >
              {sortAlphabetically(tags).map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {truncateTag(tag)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
          <Typography
            variant="h4"
            sx={{ color: "#F4F4F4", marginRight: "8px" }}
          >
            Similar Trips:{" "}
          </Typography>

          <SimilarTripsToggle
            checked={similarTrips}
            onChange={handleSimilarTripsToggle}
            disabled={isLoading}
          />
          <CustomTooltip title="When this toggled, trips with similar starting and ending locations will be grouped together.">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </CustomTooltip>
        </Box>
      </Box>

      {/* Overview Grid */}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="60px"
        gap="10px"
        borderRadius="12px"
        marginBottom={2}
      >
        {data && data.length === 0 && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            <Typography variant="h6" fontWeight="600" color="#F4F4F4">
              No trips recorded.
            </Typography>
          </Box>
        )}
        {/* ROW 1 */}

        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          {isStatsLoaded ? (
            <StatBox
              value={stats.totalTrips}
              property="Total Trips"
              icon={
                <LocationOnOutlinedIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          ) : (
            <Skeleton
              variant="rectangular"
              width={"100%"}
              height={"100%"}
              animation="wave"
            />
          )}
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          {isStatsLoaded ? (
            <StatBox
              value={stats.roundedTotalDistance || "N.A"}
              property="Total Distance"
              unit={unitName.Distance}
              icon={<img src="distanceIcon.png" alt="Distance Icon" />}
            />
          ) : (
            <Skeleton
              variant="rectangular"
              width={"100%"}
              height={"100%"}
              animation="wave"
            />
          )}
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          {isStatsLoaded ? (
            <StatBox
              value={stats.maxSpeed || "N.A"}
              property="Max Speed"
              unit={unitName.Speed}
              icon={
                <SpeedOutlinedIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          ) : (
            <Skeleton
              variant="rectangular"
              width={"100%"}
              height={"100%"}
              animation="wave"
            />
          )}
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          {isStatsLoaded ? (
            <StatBox
              value={
                stats.averageConsumption
                  ? stats.averageConsumption.toFixed(2)
                  : "N.A"
              }
              property="Avg. Consumption"
              unit={unitName.fuelConsumption}
              icon={
                <LocalGasStationOutlined
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          ) : (
            <Skeleton
              variant="rectangular"
              width={"100%"}
              height={"100%"}
              animation="wave"
            />
          )}
        </Box>
      </Box>

      {/* GRID & CHARTS */}

      {/* Group Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        // gridTemplateRows={["repeat(3, 1fr)", "repeat(3, 1fr)", "repeat(2, 1fr)"]}
        // gridAutoRows="minmax(80px, auto)"
        height="73vh"
        gap="10px"
        borderRadius="12px"
        backgroundColor="#1F1D29"
        position={"relative"}
        p={1}
      >
        <Box gridColumn={"span 3"} borderRadius={"12px"}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignContent={"center"}
            alignItems="stretch"
            mb="12px"
            height="71vh"
            overflow="auto"
          >
            {/* {selectedYear && renderMonths()} */}
            {similarTrips
              ? renderSimilarTrips()
              : selectedButton === "allTime" && yearFilteredData?.length > 0
              ? renderYear()
              : selectedButton === "thisYear" && monthFilteredData?.length > 0
              ? renderMonths()
              : selectedButton === "thisMonth" && dayFilteredData?.length > 0
              ? renderDays()
              : selectedButton === "thisWeek" && weekFilteredData?.length > 0
              ? renderWeeks()
              : selectedButton === "today" && todayFilteredData?.length > 0
              ? renderDay()
              : selectedButton === "custom" && customFilteredData?.length > 0
              ? renderCustom()
              : null}
          </Box>
        </Box>
        {/* Data Grid */}
        <Box gridColumn="span 9" gridRow="span 3" borderRadius="12px">
          <Box
            gridColumn="span 9"
            borderRadius="12px"
            p={1}
            height="71vh"
            overflow="auto"
          >
            {selectedButton === "allTime" && yearFilteredData?.length > 0 ? (
              (similarTrips && selectedTrips !== null
                ? yearFilteredData.filter((item) => {
                    const origin = selectedTrips[0]?.title;
                    const destination = selectedTrips[1]?.title;
                    return (
                      item.origin &&
                      item.origin.title === origin &&
                      item.destination &&
                      item.destination.title === destination
                    );
                  })
                : yearFilteredData
              ).map((item) => (
                // yearFilteredData.map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
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
                  <CustomTooltip
                    title={
                      enableCompare
                        ? ""
                        : "Comparison can only be performed between trips that belong to the same group."
                    }
                    sx={{
                      fontSize: "24px",
                    }}
                  >
                    <CompareArrowsOutlinedIcon
                      key={item.id}
                      onClick={(event) => {
                        if (!enableCompare) return;
                        handleSelectedItems(item.id, event);
                      }}
                      sx={{
                        position: "absolute",
                        color: !enableCompare
                          ? "red"
                          : selectedItems.includes(item.id)
                          ? "yellow"
                          : "white",
                        top: "24px",
                        right: "26px",
                        zIndex: "2000",
                        transform: "scale(2)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: enableCompare ? "scale(3.3)" : "scale(2)",
                        },
                      }}
                    />
                  </CustomTooltip>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "24px",
                      right: "12px",
                    }}
                    onClick={() => navigate("/trip-details")}
                  >
                    {/* <ArrowForwardIosOutlinedIcon /> */}
                  </IconButton>
                  {/* <LaunchIcon sx={{ position: 'absolute', top: "54px", right: "12px" }} /> */}
                  {/* <CompareArrowsOutlinedIcon sx={{ position: 'absolute', top: "24px", right: "12px" }} /> */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    onClick={() => {
                      navigate(`/trip-details/id/${item.id}`);
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      mb="18px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CalendarMonthOutlinedIcon
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "40px",
                        }}
                      />

                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: "#E9394B" }}
                      >
                        {formatDate(item.date)}
                      </Typography>
                      {item.tags?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {item.tags.map((tag, index) => {
                            const displayTag =
                              tag.length > 20
                                ? `${tag.substring(0, 20)}...`
                                : tag;

                            return (
                              <Box
                                key={index}
                                sx={{
                                  backgroundColor: "#312F3C",
                                  color: "#B7BF10",
                                  padding: "8px",
                                  margin: "5px",
                                  borderRadius: "18px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              >
                                {displayTag}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.startTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.origin?.title}
                      </Typography>
                    </Box>
                    <Box ml="35px">
                      <ArrowDownwardOutlined
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.endTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.destination?.title}
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="row">
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 8px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.speed?.maxSpeed !== null
                              ? item.speed.maxSpeed.toFixed(0)
                              : "N.A"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Speed}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Max Speed</Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.totalDistance
                              ? item.totalDistance.toFixed(2)
                              : "0.00"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Distance}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Distance</Typography>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            N.A
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.fuelConsumption}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Fuel Consumption
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {(item.time?.tripTime / 3600).toFixed(2)}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.tripTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Duration</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {/* Map countainer box */}
                  <MapItem
                    item={item}
                    waypoints={waypoints}
                    customStartMarker={customStartMarker}
                    customEndMarker={customEndMarker}
                  />
                </Box>
              ))
            ) : selectedButton === "thisYear" &&
              monthFilteredData?.length > 0 ? (
              (similarTrips && selectedTrips !== null
                ? monthFilteredData.filter((item) => {
                    const origin = selectedTrips[0]?.title;
                    const destination = selectedTrips[1]?.title;
                    return (
                      item.origin &&
                      item.origin.title === origin &&
                      item.destination &&
                      item.destination.title === destination
                    );
                  })
                : monthFilteredData
              ).map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
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
                  <CustomTooltip
                    title={
                      enableCompare
                        ? ""
                        : "Comparison can only be performed between trips that belong to the same group."
                    }
                  >
                    <CompareArrowsOutlinedIcon
                      key={item.id}
                      onClick={(event) => {
                        if (!enableCompare) return;
                        handleSelectedItems(item.id, event);
                      }}
                      sx={{
                        position: "absolute",
                        color: !enableCompare
                          ? "red"
                          : selectedItems.includes(item.id)
                          ? "yellow"
                          : "white",
                        top: "24px",
                        right: "26px",
                        zIndex: "2000",
                        transform: "scale(2)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: enableCompare ? "scale(3.3)" : "scale(2)",
                        },
                      }}
                    />
                  </CustomTooltip>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "24px",
                      right: "12px",
                    }}
                    onClick={() => navigate("/trip-details")}
                  >
                    {/* <ArrowForwardIosOutlinedIcon /> */}
                  </IconButton>
                  {/* <LaunchIcon sx={{ position: 'absolute', top: "54px", right: "12px" }} /> */}
                  {/* <CompareArrowsOutlinedIcon sx={{ position: 'absolute', top: "24px", right: "12px" }} /> */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    onClick={() => {
                      navigate(`/trip-details/id/${item.id}`);
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      mb="18px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CalendarMonthOutlinedIcon
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "40px",
                        }}
                      />

                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: "#E9394B" }}
                      >
                        {formatDate(item.date)}
                      </Typography>
                      {item.tags?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {item.tags.map((tag, index) => {
                            const displayTag =
                              tag.length > 20
                                ? `${tag.substring(0, 20)}...`
                                : tag;

                            return (
                              <Box
                                key={index}
                                sx={{
                                  backgroundColor: "#312F3C",
                                  color: "#B7BF10",
                                  padding: "8px",
                                  margin: "5px",
                                  borderRadius: "18px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              >
                                {displayTag}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.startTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.origin?.title}
                      </Typography>
                    </Box>
                    <Box ml="35px">
                      <ArrowDownwardOutlined
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.endTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.destination?.title}
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="row">
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 8px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.speed?.maxSpeed !== null
                              ? item.speed.maxSpeed.toFixed(0)
                              : "N.A"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Speed}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Max Speed</Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.totalDistance
                              ? item.totalDistance.toFixed(2)
                              : "0.00"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Distance}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Distance</Typography>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            N.A
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.fuelConsumption}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Fuel Consumption
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {(item.time?.tripTime / 3600).toFixed(2)}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.tripTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Duration</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {/* Map countainer box */}
                  <MapItem
                    item={item}
                    waypoints={waypoints}
                    customStartMarker={customStartMarker}
                    customEndMarker={customEndMarker}
                  />
                </Box>
              ))
            ) : selectedButton === "thisMonth" &&
              dayFilteredData?.length > 0 ? (
              (similarTrips && selectedTrips !== null
                ? dayFilteredData.filter((item) => {
                    const origin = selectedTrips[0]?.title;
                    const destination = selectedTrips[1]?.title;
                    return (
                      item.origin &&
                      item.origin.title === origin &&
                      item.destination &&
                      item.destination.title === destination
                    );
                  })
                : dayFilteredData
              ).map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
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
                  <CustomTooltip
                    title={
                      enableCompare
                        ? ""
                        : "Comparison can only be performed between trips that belong to the same group."
                    }
                  >
                    <CompareArrowsOutlinedIcon
                      key={item.id}
                      onClick={(event) => {
                        if (!enableCompare) return;
                        handleSelectedItems(item.id, event);
                      }}
                      sx={{
                        position: "absolute",
                        color: !enableCompare
                          ? "red"
                          : selectedItems.includes(item.id)
                          ? "yellow"
                          : "white",
                        top: "24px",
                        right: "26px",
                        zIndex: "2000",
                        transform: "scale(2)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: enableCompare ? "scale(3.3)" : "scale(2)",
                        },
                      }}
                    />
                  </CustomTooltip>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "24px",
                      right: "12px",
                    }}
                    onClick={() => navigate("/trip-details")}
                  >
                    {/* <ArrowForwardIosOutlinedIcon /> */}
                  </IconButton>
                  {/* <LaunchIcon sx={{ position: 'absolute', top: "54px", right: "12px" }} /> */}
                  {/* <CompareArrowsOutlinedIcon sx={{ position: 'absolute', top: "24px", right: "12px" }} /> */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    onClick={() => {
                      navigate(`/trip-details/id/${item.id}`);
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      mb="18px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CalendarMonthOutlinedIcon
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "40px",
                        }}
                      />

                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: "#E9394B" }}
                      >
                        {formatDate(item.date)}
                      </Typography>
                      {item.tags?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {item.tags.map((tag, index) => {
                            const displayTag =
                              tag.length > 20
                                ? `${tag.substring(0, 20)}...`
                                : tag;

                            return (
                              <Box
                                key={index}
                                sx={{
                                  backgroundColor: "#312F3C",
                                  color: "#B7BF10",
                                  padding: "8px",
                                  margin: "5px",
                                  borderRadius: "18px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              >
                                {displayTag}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.startTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.origin?.title}
                      </Typography>
                    </Box>
                    <Box ml="35px">
                      <ArrowDownwardOutlined
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.endTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.destination?.title}
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="row">
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 8px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.speed?.maxSpeed !== null
                              ? item.speed.maxSpeed.toFixed(0)
                              : "N.A"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Speed}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Max Speed</Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.totalDistance
                              ? item.totalDistance.toFixed(2)
                              : "0.00"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Distance}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Distance</Typography>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            N.A
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.fuelConsumption}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Fuel Consumption
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {(item.time?.tripTime / 3600).toFixed(2)}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.tripTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Duration</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {/* Map countainer box */}
                  <MapItem
                    item={item}
                    waypoints={waypoints}
                    customStartMarker={customStartMarker}
                    customEndMarker={customEndMarker}
                  />
                </Box>
              ))
            ) : selectedButton === "thisWeek" &&
              weekFilteredData?.length > 0 ? (
              (similarTrips && selectedTrips !== null
                ? weekFilteredData.filter((item) => {
                    const origin = selectedTrips[0]?.title;
                    const destination = selectedTrips[1]?.title;
                    return (
                      item.origin &&
                      item.origin.title === origin &&
                      item.destination &&
                      item.destination.title === destination
                    );
                  })
                : weekFilteredData
              ).map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
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
                  <CustomTooltip
                    title={
                      enableCompare
                        ? ""
                        : "Comparison can only be performed between trips that belong to the same group."
                    }
                  >
                    <CompareArrowsOutlinedIcon
                      key={item.id}
                      onClick={(event) => {
                        if (!enableCompare) return;
                        handleSelectedItems(item.id, event);
                      }}
                      sx={{
                        position: "absolute",
                        color: !enableCompare
                          ? "red"
                          : selectedItems.includes(item.id)
                          ? "yellow"
                          : "white",
                        top: "24px",
                        right: "26px",
                        zIndex: "2000",
                        transform: "scale(2)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: enableCompare ? "scale(3.3)" : "scale(2)",
                        },
                      }}
                    />
                  </CustomTooltip>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "24px",
                      right: "12px",
                    }}
                    onClick={() => navigate("/trip-details")}
                  >
                    {/* <ArrowForwardIosOutlinedIcon /> */}
                  </IconButton>
                  {/* <LaunchIcon sx={{ position: 'absolute', top: "54px", right: "12px" }} /> */}
                  {/* <CompareArrowsOutlinedIcon sx={{ position: 'absolute', top: "24px", right: "12px" }} /> */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    onClick={() => {
                      navigate(`/trip-details/id/${item.id}`);
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      mb="18px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CalendarMonthOutlinedIcon
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "40px",
                        }}
                      />

                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: "#E9394B" }}
                      >
                        {formatDate(item.date)}
                      </Typography>
                      {item.tags?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {item.tags.map((tag, index) => {
                            const displayTag =
                              tag.length > 20
                                ? `${tag.substring(0, 20)}...`
                                : tag;

                            return (
                              <Box
                                key={index}
                                sx={{
                                  backgroundColor: "#312F3C",
                                  color: "#B7BF10",
                                  padding: "8px",
                                  margin: "5px",
                                  borderRadius: "18px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              >
                                {displayTag}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.startTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.origin?.title}
                      </Typography>
                    </Box>
                    <Box ml="35px">
                      <ArrowDownwardOutlined
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.endTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.destination?.title}
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="row">
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 8px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.speed?.maxSpeed !== null
                              ? item.speed.maxSpeed.toFixed(0)
                              : "N.A"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Speed}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Max Speed</Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.totalDistance
                              ? item.totalDistance.toFixed(2)
                              : "0.00"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Distance}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Distance</Typography>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            N.A
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.fuelConsumption}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Fuel Consumption
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {(item.time?.tripTime / 3600).toFixed(2)}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.tripTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Duration</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {/* Map countainer box */}
                  <MapItem
                    item={item}
                    waypoints={waypoints}
                    customStartMarker={customStartMarker}
                    customEndMarker={customEndMarker}
                  />
                </Box>
              ))
            ) : selectedButton === "today" && todayFilteredData?.length > 0 ? (
              (similarTrips && selectedTrips !== null
                ? todayFilteredData.filter((item) => {
                    const origin = selectedTrips[0]?.title;
                    const destination = selectedTrips[1]?.title;
                    return (
                      item.origin &&
                      item.origin.title === origin &&
                      item.destination &&
                      item.destination.title === destination
                    );
                  })
                : todayFilteredData
              ).map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
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
                  <CustomTooltip
                    title={
                      enableCompare
                        ? ""
                        : "Comparison can only be performed between trips that belong to the same group."
                    }
                  >
                    <CompareArrowsOutlinedIcon
                      key={item.id}
                      onClick={(event) => {
                        if (!enableCompare) return;
                        handleSelectedItems(item.id, event);
                      }}
                      sx={{
                        position: "absolute",
                        color: !enableCompare
                          ? "red"
                          : selectedItems.includes(item.id)
                          ? "yellow"
                          : "white",
                        top: "24px",
                        right: "26px",
                        zIndex: "2000",
                        transform: "scale(2)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: enableCompare ? "scale(3.3)" : "scale(2)",
                        },
                      }}
                    />
                  </CustomTooltip>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "24px",
                      right: "12px",
                    }}
                    onClick={() => navigate("/trip-details")}
                  >
                    {/* <ArrowForwardIosOutlinedIcon /> */}
                  </IconButton>
                  {/* <LaunchIcon sx={{ position: 'absolute', top: "54px", right: "12px" }} /> */}
                  {/* <CompareArrowsOutlinedIcon sx={{ position: 'absolute', top: "24px", right: "12px" }} /> */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    onClick={() => {
                      navigate(`/trip-details/id/${item.id}`);
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      mb="18px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CalendarMonthOutlinedIcon
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "40px",
                        }}
                      />

                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: "#E9394B" }}
                      >
                        {formatDate(item.date)}
                      </Typography>
                      {item.tags?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {item.tags.map((tag, index) => {
                            const displayTag =
                              tag.length > 20
                                ? `${tag.substring(0, 20)}...`
                                : tag;

                            return (
                              <Box
                                key={index}
                                sx={{
                                  backgroundColor: "#312F3C",
                                  color: "#B7BF10",
                                  padding: "8px",
                                  margin: "5px",
                                  borderRadius: "18px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              >
                                {displayTag}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.startTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.origin?.title}
                      </Typography>
                    </Box>
                    <Box ml="35px">
                      <ArrowDownwardOutlined
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                    </Box>
                    <Box display="flex" flexDirection="row">
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.time?.endTime.substring(11, 16)}
                      </Typography>
                      <CircleOutlinedIcon
                        sx={{ color: "#B7A7B4", fontSize: "20px" }}
                      />
                      <Typography
                        ml="4px"
                        variant="h6"
                        sx={{ color: "#B7A7B4" }}
                      >
                        {item.destination?.title}
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="row">
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 8px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.speed?.maxSpeed !== null
                              ? item.speed.maxSpeed.toFixed(0)
                              : "N.A"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Speed}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Max Speed</Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {item.totalDistance
                              ? item.totalDistance.toFixed(2)
                              : "0.00"}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.Distance}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Distance</Typography>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            N.A
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.fuelConsumption}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Fuel Consumption
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        borderRadius="12px"
                        p="14px 14px 14px 0px"
                        mb="9px"
                      >
                        <Box display="flex">
                          <Typography
                            color={colors.grey[100]}
                            variant="h2"
                            fontWeight="800"
                          >
                            {(item.time?.tripTime / 3600).toFixed(2)}
                          </Typography>
                          <Typography
                            display="flex"
                            alignItems="flex-end"
                            color={colors.greenAccent[600]}
                            paddingBottom="2px"
                          >
                            {unitName.tripTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="#B7A7B4">Trip Duration</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {/* Map countainer box */}
                  <MapItem
                    item={item}
                    waypoints={waypoints}
                    customStartMarker={customStartMarker}
                    customEndMarker={customEndMarker}
                  />
                </Box>
              ))
            ) : selectedButton === "custom" &&
              customFilteredData?.length > 0 ? (
              (similarTrips && selectedTrips !== null
                ? customFilteredData.filter((item) => {
                    const origin = selectedTrips[0]?.title;
                    const destination = selectedTrips[1]?.title;
                    return (
                      item.origin &&
                      item.origin.title === origin &&
                      item.destination &&
                      item.destination.title === destination
                    );
                  })
                : customFilteredData
              ).map((item) => {
                return (
                  <Box
                    key={item.id}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
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
                    <CustomTooltip
                      title={
                        enableCompare
                          ? ""
                          : "Comparison can only be performed between trips that belong to the same group."
                      }
                    >
                      <CompareArrowsOutlinedIcon
                        key={item.id}
                        onClick={(event) => {
                          if (!enableCompare) return;
                          handleSelectedItems(item.id, event);
                        }}
                        sx={{
                          position: "absolute",
                          color: !enableCompare
                            ? "red"
                            : selectedItems.includes(item.id)
                            ? "yellow"
                            : "white",
                          top: "24px",
                          right: "26px",
                          zIndex: "2000",
                          transform: "scale(2)",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: enableCompare
                              ? "scale(3.3)"
                              : "scale(2)",
                          },
                        }}
                      />
                    </CustomTooltip>
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: "24px",
                        right: "12px",
                      }}
                      onClick={() => navigate("/trip-details")}
                    >
                      {/* <ArrowForwardIosOutlinedIcon /> */}
                    </IconButton>
                    {/* <LaunchIcon sx={{ position: 'absolute', top: "54px", right: "12px" }} /> */}
                    {/* <CompareArrowsOutlinedIcon sx={{ position: 'absolute', top: "24px", right: "12px" }} /> */}
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                      width="100%"
                      onClick={() => {
                        navigate(`/trip-details/id/${item.id}`);
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection="row"
                        mb="18px"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <CalendarMonthOutlinedIcon
                          sx={{
                            color: colors.greenAccent[600],
                            fontSize: "40px",
                          }}
                        />

                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{ color: "#E9394B" }}
                        >
                          {formatDate(item.date)}
                        </Typography>
                        {item.tags?.length > 0 && (
                          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                            {item.tags.map((tag, index) => {
                              const displayTag =
                                tag.length > 20
                                  ? `${tag.substring(0, 20)}...`
                                  : tag;

                              return (
                                <Box
                                  key={index}
                                  sx={{
                                    backgroundColor: "#312F3C",
                                    color: "#B7BF10",
                                    padding: "8px",
                                    margin: "5px",
                                    borderRadius: "18px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {displayTag}
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                      <Box display="flex" flexDirection="row">
                        <Typography
                          ml="4px"
                          variant="h6"
                          sx={{ color: "#B7A7B4" }}
                        >
                          {item.time?.startTime.substring(11, 16)}
                        </Typography>
                        <CircleOutlinedIcon
                          sx={{ color: "#B7A7B4", fontSize: "20px" }}
                        />
                        <Typography
                          ml="4px"
                          variant="h6"
                          sx={{ color: "#B7A7B4" }}
                        >
                          {item.origin?.title}
                        </Typography>
                      </Box>
                      <Box ml="35px">
                        <ArrowDownwardOutlined
                          sx={{ color: "#B7A7B4", fontSize: "20px" }}
                        />
                      </Box>
                      <Box display="flex" flexDirection="row">
                        <Typography
                          ml="4px"
                          variant="h6"
                          sx={{ color: "#B7A7B4" }}
                        >
                          {item.time?.endTime.substring(11, 16)}
                        </Typography>
                        <CircleOutlinedIcon
                          sx={{ color: "#B7A7B4", fontSize: "20px" }}
                        />
                        <Typography
                          ml="4px"
                          variant="h6"
                          sx={{ color: "#B7A7B4" }}
                        >
                          {item.destination?.title}
                        </Typography>
                      </Box>

                      <Box display="flex" flexDirection="row">
                        <Box
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="flex-start"
                          borderRadius="12px"
                          p="14px 14px 14px 8px"
                          mb="9px"
                        >
                          <Box display="flex">
                            <Typography
                              color={colors.grey[100]}
                              variant="h2"
                              fontWeight="800"
                            >
                              {item.speed?.maxSpeed !== null
                                ? item.speed.maxSpeed.toFixed(0)
                                : "N.A"}
                            </Typography>
                            <Typography
                              display="flex"
                              alignItems="flex-end"
                              color={colors.greenAccent[600]}
                              paddingBottom="2px"
                            >
                              {unitName.Speed}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography color="#B7A7B4">Max Speed</Typography>
                          </Box>
                        </Box>
                        <Box
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="flex-start"
                          borderRadius="12px"
                          p="14px 14px 14px 0px"
                          mb="9px"
                        >
                          <Box display="flex">
                            <Typography
                              color={colors.grey[100]}
                              variant="h2"
                              fontWeight="800"
                            >
                              {item.totalDistance
                                ? item.totalDistance.toFixed(2)
                                : "0.00"}
                            </Typography>
                            <Typography
                              display="flex"
                              alignItems="flex-end"
                              color={colors.greenAccent[600]}
                              paddingBottom="2px"
                            >
                              {unitName.Distance}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography color="#B7A7B4">
                              Trip Distance
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="flex-start"
                          borderRadius="12px"
                          p="14px 14px 14px 0px"
                          mb="9px"
                        >
                          <Box display="flex">
                            <Typography
                              color={colors.grey[100]}
                              variant="h2"
                              fontWeight="800"
                            >
                              N.A
                            </Typography>
                            <Typography
                              display="flex"
                              alignItems="flex-end"
                              color={colors.greenAccent[600]}
                              paddingBottom="2px"
                            >
                              {unitName.fuelConsumption}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography color="#B7A7B4">
                              Fuel Consumption
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="flex-start"
                          borderRadius="12px"
                          p="14px 14px 14px 0px"
                          mb="9px"
                        >
                          <Box display="flex">
                            <Typography
                              color={colors.grey[100]}
                              variant="h2"
                              fontWeight="800"
                            >
                              {(item.time?.tripTime / 3600).toFixed(2)}
                            </Typography>
                            <Typography
                              display="flex"
                              alignItems="flex-end"
                              color={colors.greenAccent[600]}
                              paddingBottom="2px"
                            >
                              {unitName.tripTime}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography color="#B7A7B4">
                              Trip Duration
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    {/* Map countainer box */}
                    <MapItem
                      item={item}
                      waypoints={waypoints}
                      customStartMarker={customStartMarker}
                      customEndMarker={customEndMarker}
                    />
                  </Box>
                );
              })
            ) : (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                  No trips recorded.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RecordedTrips;