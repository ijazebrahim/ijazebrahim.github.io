import { Box } from "@mui/material";
import TableHeader from "./tableHeader";


const CompareTrips = () => {
  return (
    <Box m="20px">
      <Box mb="24px" sx={{ overflow: "auto"}}>
        <TableHeader />
      </Box>
    </Box>
  );
};

export default CompareTrips;