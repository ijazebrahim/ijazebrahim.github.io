import { Box, Typography, useTheme } from "@mui/material";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
// import { mockBarData as data} from "../data/mockData";
import { React } from "react";
import { useState, useEffect, useRef } from 'react';



const BarChartTripDetails = ({ data, axisLeftLegend, indexBy, keys }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const maxTickValues = 10;

  // Calculate the number of available data points
  const numDataPoints = data.length;

  // Determine whether to skip tick values
  const shouldSkipTicks = numDataPoints > maxTickValues;

  // Calculate tick step based on the available data points
  const tickStep = Math.max(1, Math.floor(numDataPoints / maxTickValues));

  // Calculate the tick values based on whether to skip ticks
  const tickValues = shouldSkipTicks
    ? data.map((entry, index) => (index % tickStep === 0 ? entry.distance : null))
    : data.map((entry) => entry.distance);
//   const containerRef = useRef(null);
//   const [containerWidth, setContainerWidth] = useState(0);
//   const [containerHeight, setContainerHeight] = useState(0);

//   useEffect(() => {
//     const handleResize = entries => {
//       for (let entry of entries) {
//         setContainerWidth(entry.contentRect.width);
//         setContainerHeight(entry.contentRect.height);
//       }
//     };

//     const resizeObserver = new ResizeObserver(handleResize);
//     if (containerRef.current) {
//       resizeObserver.observe(containerRef.current);
//     }

//     return () => {
//       if (containerRef.current) {
//         resizeObserver.unobserve(containerRef.current);
//       }
//     };
//   }, []);

//   const getYTickValues = () => {
//     if (containerHeight < 160) return 2;
//     if (containerHeight < 270) return 4;
//     if (containerHeight < 500) return 10;
//     if (containerHeight < 900) return 15;
//     return 11;
//   };

//   const getTickValues = () => {
//     if (!data || data.length === 0) {
//       return [];
//     }
  
//     if (data.length <= 2) {
//       return data.map(item => item.date);
//     }
  
//     const maxTicksForWidth = containerWidth < 165 ? 1 :
//                              containerWidth < 400 ? 3 :
//                              containerWidth < 700 ? 5 : 11;
  
//     const stepSize = Math.ceil(data.length / maxTicksForWidth);
  
//     let tickValues = [];
//     for (let i = 0; i < data.length; i += stepSize) {
//       tickValues.push(data[i].date);
//     }
  
//     if (tickValues[tickValues.length - 1] !== data[data.length - 1].date) {
//       tickValues.push(data[data.length - 1].date);
//     }
  
//     return tickValues;
//   };

//   const tickValues = getTickValues();


  return (
    <Box style={{ width: "100%", height: '100%' }}>
      <ResponsiveBar
        data={data}
        theme={{
          grid: {
            line: {
              strokeWidth: 4,
              stroke: "#33313D"
            }
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
              <DateRangeOutlinedIcon /> Distance: {e.indexValue}
            </Typography>
            <Typography variant="body2">
              <NumbersOutlinedIcon /> Value: {e.value}
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
        axisBottom={{
          tickSize: 2,
          tickValues,
          tickPadding: 5,
          tickRotation: 0,
          legend: "m",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 2,
          tickPadding: 5,
          tickRotation: 0,
        //   tickValues: getYTickValues(),
          legend: axisLeftLegend,
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
        legends={[
        ]}
        role="application"
        barAriaLabel={function (e) {
          return e.id + ": " + e.formattedValue + " in country: " + e.indexValue;
        }}
      />
    </Box>
  );


};

export default BarChartTripDetails;