import { useTheme, Box, Typography } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
// import { mockBarData as data} from "../data/mockData";
import { React } from "react";



const PieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const margin = { top: 50, right: 0, bottom: 50, left: 0 };

  const styles = {
    root: {
      fontFamily: "consolas, sans-serif",
      textAlign: "center",
      position: "relative",
      height: "250px"
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
      textAlign: "center",
      pointerEvents: "none"
    },
    totalLabel: {
      fontSize: 24
    }
  };




  return (
    <>
      <ResponsivePie
        data={[
          {
            id: "Idle Time",
            label: "Idle Time",
            value: 10,
          },
          { id: "Time in Traffic", label: "Time in Traffic", value: 30 },
          { id: "Moving Time", label: "Moving Time", value: 60 },
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
        enableArcLabels={false}
        arcLabel="id"
        arcLabelsRadiusOffset={0.25}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      />
      <Box style={styles.overlay}>
        <Typography variant="h6" color="#B7A7B4">
          Total Trip Time
        </Typography>
        <Typography variant="h3">00:31:06</Typography>
      </Box>
    </>
  );


};

export default PieChart;