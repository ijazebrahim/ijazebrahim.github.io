import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MyDateRangePicker from "../../components/DateRangePicker";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { VehicleContext } from "../../VehicleContext";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import codeDescriptionsData from "../../data/dtcDescriptions.json";
import ProgressCircle from "../../components/ProgressCircle";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ButtonGroup from "@mui/material/ButtonGroup";

const Errors = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [selectedButton, setSelectedButton] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [data, setData] = useState([]);
  const { selectedActiveVehicle } = useContext(VehicleContext);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("thisWeek");
  const [showData, setShowData] = useState(false);
  const [activeButton, setActiveButton] = useState("thisWeek");

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch data when dateRange changes
    if (dateRange && showData) {
      handleDateRangeSelect(dateRange);
      setShowData(false);
    }
  }, [dateRange, period, showData]);

  useEffect(() => {
    if (dateRange) {
      const [startDate, endDate] = dateRange;

      const isDay = isDateRangeDay(startDate, endDate);
      if (isDay) {
        setSelectedButton("today");
        return;
      }

      const isWeek = isDateRangeWeek(startDate, endDate);
      if (isWeek) {
        setSelectedButton("thisWeek");
        return;
      }

      const isMonth = isDateRangeMonth(startDate, endDate);
      if (isMonth) {
        setSelectedButton("thisMonth");
        return;
      }

      if (period === "thisYear") {
        setSelectedButton("thisYear");
        return;
      }

      const isAllTime = isDateRangeAllTime(startDate, endDate);
      if (isAllTime) {
        setSelectedButton("allTime");
        return;
      }
      setSelectedButton("custom");
    }
  }, [dateRange, period]);

  function isDateRangeAllTime(startDate, endDate) {
    return endDate.getFullYear() - startDate.getFullYear() > 10;
  }

  //check if a date range corresponds to a week
  const isDateRangeWeek = (startDate, endDate) => {
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
    const difference = endDate - startDate;
    return difference <= oneWeekInMillis;
  };

  //check if a date range corresponds to a month
  const isDateRangeMonth = (startDate, endDate) => {
    return (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()
    );
  };

  const isDateRangeDay = (startDate, endDate) => {
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const difference = endDate - startDate;

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Difference (milliseconds):", difference);

    return difference <= oneDayInMillis;
  };
  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleThisMonthClick();
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );
    setDateRange([start, end]);
  }, []);

  const handleDateRangeSelect = async (date) => {
    if (!date || date.length === 0) {
      return;
    }
    setSelectedButton({});
    setIsLoading(true);
    const accessToken = await getToken();
    setDateRange(date);

    const startDate = date[0];
    const endDate = date[1];
    const vehicleId = selectedActiveVehicle;
    const queryType = "custom";

    try {
      const response = await axios.get(
        `${apiUrl}/api/troublecodes/`,
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
      setData(response.data.codes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
  };

  const handleAllTimeClick = () => {
    const today = new Date();
    const start = new Date(1900, 0, 1);
    const end = new Date();
    setDateRange([start, end]);
    setPeriod("allTime");
    setSelectedButton("allTime");
    setShowData(true);
  };
  const handleThisWeekClick = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    const endOfWeek = new Date(today.setDate(diff + 6));

    setSelectedButton("thisWeek");
    setDateRange([startOfWeek, endOfWeek]);
    setPeriod("thisWeek");
    setShowData(true);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setDateRange([today, today]);

    setSelectedButton("today");
    setPeriod("today");
    handleDateRangeSelect([today, today]);
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateRange([start, end]);
    setPeriod("thisMonth");
    setSelectedButton("thisMonth");
    setShowData(true);
  };

  const handlePreviousPeriod = () => {
    if (!dateRange) return;

    const [startDate, endDate] = dateRange;
    let newStartDate, newEndDate;

    if (period === "thisWeek") {
      newStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "thisMonth") {
      newStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() - 1,
        1
      );
      newEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
    } else if (period === "thisYear") {
      newStartDate = new Date(startDate.getFullYear() - 1, 0, 1);
      newEndDate = new Date(
        startDate.getFullYear() - 1,
        11,
        31,
        23,
        59,
        59,
        999
      );
    } else if (period === "today") {
      newStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    }
    setDateRange([newStartDate, newEndDate]);
    setShowData(true);
  };

  const handleNextPeriod = () => {
    if (!dateRange) return;

    const [startDate, endDate] = dateRange;
    let newStartDate, newEndDate;

    if (period === "thisWeek") {
      newStartDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (period === "thisMonth") {
      newStartDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
      newEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 2, 0);
    } else if (period === "thisYear") {
      newStartDate = new Date(endDate.getFullYear() + 1, 0, 1);
      newEndDate = new Date(endDate.getFullYear() + 1, 11, 31, 23, 59, 59, 999);
    } else if (period === "today") {
      newStartDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    }

    setDateRange([newStartDate, newEndDate]);
    setShowData(true);
  };

  const handleRecentClick = async () => {
    setSelectedButton("recent");
    setDateRange(null);

    try {
      const accessToken = await getToken();
      const response = await axios.get(
        `${apiUrl}/api/troublecodes/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            vehicleId: selectedActiveVehicle,
            queryType: "last",
          },
        }
      );
      setData(response.data.codes);
    } catch (error) {
      console.error(error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const timestampDate = new Date(timestamp);
    return timestampDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const codeDescriptions = codeDescriptionsData.reduce((acc, description) => {
    acc[description.Code] = description.Description;
    return acc;
  }, {});

  return (
    <Box m="20px">
      <ProgressCircle isLoading={isLoading} />
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header subtitle="Errors that were detected during the last transfer of data from the mobile app." />
      </Box>

      <Box mb="24px">
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleRecentClick}
            sx={{
              backgroundColor:
                selectedButton === "recent" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            RECENT
          </Button>
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
          <ButtonGroup variant="text" color="inherit" aria-label="navigation">
            <Button
              onClick={handlePreviousPeriod}
              startIcon={<ArrowLeftIcon />}
              style={{ padding: "1px", minWidth: "25px" }}
              disabled={selectedButton === "allTime"}
            />
            <Button
              onClick={handleNextPeriod}
              endIcon={<ArrowRightIcon />}
              style={{ padding: "1px", minWidth: "25px" }}
              disabled={selectedButton === "allTime"}
            />
          </ButtonGroup>
          <MyDateRangePicker
            onChange={handleDateRangeSelect}
            value={dateRange}
          />
        </Stack>
      </Box>

      {/* Errors Grid */}

      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        gap="10px"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={1}
      >
        {data && data.length === 0 && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            <Typography variant="h6" fontWeight="600" color="#F4F4F4">
              No errors recorded.
            </Typography>
          </Box>
        )}
        {data.map((error, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            backgroundColor="#312F3C"
            borderRadius="12px"
            width="50vw"
            border={1}
            borderColor="#312F3C"
            p={2}
            gap={1}
          >
            <Box gap={1} display="flex">
              <WarningAmberIcon sx={{ color: colors.greenAccent[600] }} />
              <Typography>
                Queried at {formatTimestamp(error.queriedAt)}
              </Typography>
            </Box>
            <Typography color="#DA291C">Error Code</Typography>
            <Typography variant="h3" fontWeight="bold">
              {error.code}
            </Typography>
            <Typography color="#DA291C">Error Description</Typography>
            <Typography>
              {codeDescriptions[error.code] || "Description not found"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Errors;
