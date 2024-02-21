import { Box, useTheme, IconButton, Typography } from "@mui/material";
import { tokens } from "../../theme";
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import { useNavigate } from "react-router-dom";



const LegalStatements = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const aboutText = "WIP: These Terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions written in here. You must not use this Website if you disagree with any of these Website Standard Terms and Conditions.";

  return (
    <Box m="20px">

      <Box display="flex" justifyContent="flex-start" >
        <IconButton onClick={() => navigate("/settings")} >
          <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "30px" }} />
        </IconButton>
      </Box>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
      </Box>

      {/* Legal Statements WebPortal Grid */}

      <Box
        height="100vh"
        gap="10px"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={1}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center">
          <Typography variant="h5">{aboutText}</Typography>
        </Box>
      </Box>
    </Box>
  );

};

export default LegalStatements;