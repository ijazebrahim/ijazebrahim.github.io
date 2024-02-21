import { useTheme, Box, Typography } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
// import { mockBarData as data} from "../data/mockData";
import { React } from "react";

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
const PieChartDashboard = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const margin = { top: 50, right: 0, bottom: 50, left: 0 };
  const totalMovingTime = data.reduce(
    (total, item) => total + item.timemoving,
    0
  );
  const totalTrafficTime = data.reduce(
    (total, item) => total + item.timetraffic,
    0
  );
  const totalIdleTime = data.reduce((total, item) => total + item.timeidle, 0);

  const totalTripTimeInSeconds =
    totalMovingTime + totalTrafficTime + totalIdleTime;

  const styles = {
    root: {
      fontFamily: "consolas, sans-serif",
      textAlign: "center",
      position: "relative",
      height: "250px",
    },
    overlay: {
      position: "absolute",
      top: 0,
      right: margin.right,
      bottom: 0,
      left: margin.left,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 96,
      color: "#FFFFFF",
      // background: "#FFFFFF33",
      textAlign: "center",
      // This is important to preserve the chart interactivity
      pointerEvents: "none",
    },
    totalLabel: {
      fontSize: 24,
    },
  };

  return (
    <>
      <ResponsivePie
        data={[
          {
            id: "Idle Time",
            label: "Idle Time",
            value: totalIdleTime,
          },
          {
            id: "Time in Traffic",
            label: "Time in Traffic",
            value: totalTrafficTime,
          },
          { id: "Moving Time", label: "Moving Time", value: totalMovingTime },
        ]}
        colors={["#4298B5", "#ff0000", "#ffff00"]}
        margin={margin}
        startAngle={-180}
        sortByValue={true}
        innerRadius={0.9}
        padAngle={1}
        cornerRadius={9}
        activeOuterRadiusOffset={8}
        isInteractive={false}
        enableArcLinkLabels={false}
        // arcLinkLabelsSkipAngle={10}
        // arcLinkLabelsTextColor="#333333" // arcLinkLabelsThickness={2}
        // arcLinkLabelsColor={{ from: "color" }}
        enableArcLabels={false}
        arcLabel="id"
        arcLabelsRadiusOffset={0.25}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        // width={380}
        // height={250}
      />
      <Box style={styles.overlay}>
        <Typography variant="h6" color="#B7A7B4">
          Total Trip Time
        </Typography>
        <Typography variant="h3">
          {formatTime(totalTripTimeInSeconds)}
        </Typography>
      </Box>
    </>
  );
};

export default PieChartDashboard;
