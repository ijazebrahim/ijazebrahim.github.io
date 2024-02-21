import { Box, Typography, useTheme } from "@mui/material";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { mockDefaultBarData as data} from "../data/mockData";
import { React } from "react";



const BarChartDefault = ({ axisLeftLegend }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
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
      keys={[
        'y'
    ]}
      indexBy="x"
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
        tickPadding: 5,
        tickRotation: 0,
        // legend: isDashboard ? undefined : "Weekdays", // changed
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 2,
        tickPadding: 5,
        tickRotation: 0,
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
  );


};

export default BarChartDefault;