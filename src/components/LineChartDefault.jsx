import { ResponsiveLine } from "@nivo/line";
import { useTheme, Box, Typography } from "@mui/material";
import { tokens } from "../theme";
// import { mockLineChartData as data } from "../data/mockData";
import { React } from "react";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';





const LineChartDefault = ({ axisLeftLegend }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  return (
    <ResponsiveLine
      data={[
        {
          "id": "random",
          "data": [
            {
              "x": "0km",
              "y": 0
            },
            {
              "x": "10km",
              "y": 1
            },
            {
              "x": "20km",
              "y": 206
            },
            {
              "x": "30km",
              "y": 101
            },
            {
              "x": "40km",
              "y": 12
            },
            {
              "x": "50km",
              "y": 205
            },
            {
              "x": "60km",
              "y": 18
            },
            {
              "x": "70km",
              "y": 36
            },
            {
              "x": "80km",
              "y": 132
            }
          ]
        },
      ]}
      theme={{
        //specify custom theme here
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
      yScale={{ type: "linear", min: "auto", max: "auto" }}
      axisBottom={{
        tickRotation: 0,
        tickSize: 2,
        // tickValues,
      }}
      axisLeft={{
        tickSize: 2,
        tickPadding: 5,
        tickRotation: 0,
        legend: axisLeftLegend,
        legendPosition: "middle",
        legendOffset: -35,
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
            <DateRangeOutlinedIcon /> Property: {e.point.data.xFormatted}
          </Typography>
          <Typography variant="body2">
            <NumbersOutlinedIcon /> Value: {e.point.data.yFormatted}
          </Typography>
        </Box>
      )}
    />
  );
};

export default LineChartDefault;
