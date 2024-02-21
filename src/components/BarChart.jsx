import { Box, Typography, useTheme } from "@mui/material";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
// import { mockBarData as data} from "../data/mockData";
import { React } from "react";
import { useState, useEffect, useRef } from "react";

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

const BarChart = ({
  isDashboard = false,
  data,
  axisLeftLegend,
  indexBy,
  keys,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const roundedData = data.map((item) => {
    const roundedItem = { ...item };
    keys.forEach((key) => {
      roundedItem[key] = Math.round(item[key]);
    });
    return roundedItem;
  });

  useEffect(() => {
    const handleResize = (entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const getYTickValues = () => {
    if (containerHeight < 160) return 2;
    if (containerHeight < 270) return 4;
    if (containerHeight < 500) return 10;
    if (containerHeight < 900) return 15;
    return 11;
  };

  const getTickValues = () => {
    if (!data || data.length === 0) {
      return [];
    }

    if (data.length <= 2) {
      return data.map((item) => item.date);
    }

    const maxTicksForWidth =
      containerWidth < 165
        ? 1
        : containerWidth < 400
        ? 3
        : containerWidth < 700
        ? 5
        : 11;

    const stepSize = Math.ceil(data.length / maxTicksForWidth);

    let tickValues = [];
    for (let i = 0; i < data.length; i += stepSize) {
      tickValues.push(data[i].date);
    }

    if (tickValues[tickValues.length - 1] !== data[data.length - 1].date) {
      tickValues.push(data[data.length - 1].date);
    }

    return tickValues;
  };

  const tickValues = getTickValues();
  const allKeysPresent = data.every((item) => keys.every((key) => key in item));

  return (
    <Box ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ResponsiveBar
        data={allKeysPresent ? roundedData : []}
        theme={{
          grid: {
            line: {
              strokeWidth: 4,
              stroke: "#33313D",
            },
          },
          axis: {
            domain: {
              line: {
                stroke: colors.grey[100],
              },
            },
            legend: {
              text: {
                fill: colors.grey[100],
                fontSize: 9,
              },
            },
            ticks: {
              line: {
                stroke: colors.grey[100],
                strokeWidth: 1,
              },
              text: {
                fill: colors.grey[100],
              },
            },
          },
          legends: {
            text: {
              fill: colors.grey[100],
            },
          },
        }}
        keys={keys}
        indexBy={indexBy}
        margin={{ top: 50, right: 40, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        enableGridX={true}
        colors="#E9394B"
        tooltip={(e) => (
          <Box bgcolor="#1A1825" borderRadius={4} p={2}>
            <Typography variant="body2">
              <DateRangeOutlinedIcon /> Date: {e.indexValue}
            </Typography>
            <Typography variant="body2">
              <NumbersOutlinedIcon /> Value: {parseFloat(e.value.toFixed(0))}
            </Typography>
          </Box>
        )}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "#38bcb2",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "#eed312",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        borderRadius={4}
        borderColor={{
          from: "color",
          modifiers: [["darker", "1.6"]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={
          allKeysPresent
            ? {
                tickSize: 2,
                tickValues,
                tickPadding: 5,
                tickRotation: 0,
                legendPosition: "middle",
                legendOffset: 32,
                format: formatDate,
              }
            : undefined
        }
        axisLeft={{
          tickSize: 2,
          tickPadding: 5,
          tickRotation: 0,
          tickValues: getYTickValues(),
          legend: allKeysPresent ? axisLeftLegend : undefined,
          legendPosition: "middle",
          legendOffset: -40,
        }}
        enableLabel={true}
        enableGridY={false}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={[]}
        role="application"
        barAriaLabel={function (e) {
          return (
            e.id + ": " + e.formattedValue + " in country: " + e.indexValue
          );
        }}
      />
    </Box>
  );
};

export default BarChart;
