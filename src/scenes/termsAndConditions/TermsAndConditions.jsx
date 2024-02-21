import { Box, useTheme, IconButton } from "@mui/material";
import React, { useState, useEffect } from 'react';
import { tokens } from "../../theme";
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import { useNavigate } from "react-router-dom";
import axios from 'axios';


const TermsAndConditions = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        async function fetchHtmlContent() {
            try {
                const response = await axios.get('https://zwestvanappgrade.blob.core.windows.net/journee/TermsAndConditions.html?sp=r&st=2024-02-16T03:33:36Z&se=2024-02-16T11:33:36Z&sv=2022-11-02&sr=b&sig=ooUQ6TlmqiTuzihzCT0Ov%2BvB%2Fpn%2BoHg%2FH1jhKGWIG5o%3D');
                setHtmlContent(response.data);
            } catch (error) {
                console.error('Error fetching HTML content:', error);
            }
        }

        fetchHtmlContent();
    }, []);

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
            <div>
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>

        </Box>

    );

};

export default TermsAndConditions;