import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatBox = ({ value, property, icon, unit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box display="flex" flexDirection="row" width="100%" m="0 30px">
      <Box display="flex" alignItems="center" >
        <Box>
          {icon}
        </Box>
        <Box display="flex" justifyContent="space-between" >
          <Typography p="12px" variant="h6" sx={{ color: colors.grey[100] }}>
            {property}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ color: colors.grey[100] }}
        >
          {value}
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: colors.greenAccent[500] }}
          paddingLeft="4px"
          marginTop="4px"
        >
          {unit}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;

