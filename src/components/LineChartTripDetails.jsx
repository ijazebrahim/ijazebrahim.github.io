import { ResponsiveLine } from "@nivo/line";
import { useTheme, Box, Typography } from "@mui/material";
import { tokens } from "../theme";
// import { mockLineData as data } from "../data/mockData";
import { React } from "react";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import { useState, useEffect, useRef } from 'react';


const LineChartTripDetails = ({ data, dataKeyX, dataKeyY, axisLeftLegend }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
//   const [containerWidth, setContainerWidth] = useState(0);
//   const [containerHeight, setContainerHeight] = useState(0);

  const maxTickValues = 10;

  const numDataPoints = data.length;

  const shouldSkipTicks = numDataPoints > maxTickValues;

  const tickStep = Math.max(1, Math.floor(numDataPoints / maxTickValues));

  const tickValues = shouldSkipTicks
    ? data.map((entry, index) => (index % tickStep === 0 ? entry.distance : null))
    : data.map((entry) => entry.distance);

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
      <ResponsiveLine
        data={[
          {
            id: "distance",
            data: data.map((d) => ({
              x: d[dataKeyX],
              y: d[dataKeyY],
            })),
          },
        ]}
        theme={{
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
        margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        axisBottom={{
          tickRotation: 0,
          tickSize: 2,
          tickValues,
          legend: "m",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 2,
          tickPadding: 5,
          tickRotation: 0,
          legend: axisLeftLegend,
          legendPosition: "middle",
          legendOffset: -35,
        //   tickValues: getYTickValues(),
        }}
        enableGridX={false}
        enableGridY={false}
        enableArea={true}
        enablePoints={false}
        colors="#E9394B"
        lineWidth={3}
        pointSize={5}
        pointColor="#fff"
        pointBorderWidth={1}
        pointBorderColor={{ from: "serieColor" }}
        useMesh={true}
        tooltip={(e) => (
          <Box bgcolor="#1A1825" borderRadius={4} p={2}>
            <Typography variant="body2">
              <DateRangeOutlinedIcon /> Distance: {e.point.data.xFormatted}
            </Typography>
            <Typography variant="body2">
              <NumbersOutlinedIcon /> Value: {e.point.data.yFormatted}
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
};

export default LineChartTripDetails;
