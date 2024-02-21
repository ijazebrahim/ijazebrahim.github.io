import { Box, Typography } from "@mui/material";
import React from 'react'

const helpData = [
    {
        "context": `Here you can find a Quick-Start-Guide and a FAQ-Section. If you still need help please contact our support.`,
        "data": [
            {
                "question": "Journee Quick-Start Guide",
                "answer": [`Log in to your Journee account.`, `If you haven't created a vehicle yet, click on the Vehicle icon in the top-right corner or navigate to your profile to add one.`, `Start recording your trip by clicking on the "Record trip" button in the app and follow the instructions.`, `Once your first recording is started, you can leave your OBD dongle plugged in. The app will automatically handle starting and stopping trips.`],
                "note": 'If you have any questions or encounter any issues, please reach out to our support team for assistance.'
            }
        ]
    },
    {
        "context": "FAQ: Frequently Asked Questions",
        "data": [
            {
                "question": `I can't record trips when I leave the app swiped away for a while.`,
                "description": `If you experience problems with trip-recording while the app is swiped away, please follow these steps:`,
                "answer": [`Check if you have an OBD dongle connected. If so, try unplugging and plugging it back in.`, `If the problem persists, it may indicate that your phone terminates our background service.`, `To minimize this issue, visit <a rel="noreferrer noopener nofollow" target="_blank" href='https://dontkillmyapp.com/'>www.dontkillmyapp.com</a> and follow the instructions provided.`]
            },
            {
                "question": `I have just recorded a trip but can't find it in the trip list.`,
                "answer": `If you recently recorded a trip and can't find it, use the pull-to-refresh feature this should refresh your trips and display it in the list.`
            },
            {
                "question": `When is a trip processing?`,
                "answer": `A trip is recording while your device sends data to our backend. Processing occurs when the trip data is aggregated and analyzed in our backend. Once processing is complete, the trip will be ready to view.`
            }
        ]
    }
]

const Help = () => {

    const mappedItem = helpData.map((context) => {
        const contextName = context.context;

        const mappedContextData = context.data.map((item, index) => {
            const question = item.question;
            const description = item.description || "";
            const contents = item.answer;
            const note = item.note || "";
            return (
                <Box
                    borderRadius="12px"
                    backgroundColor="#312F3C"
                    p={1.5}
                    m={1.5}
                    alignItems="start"
                    width="85%"
                    key={index}
                >
                    <Typography my={0.5} variant="h5">{question}</Typography>

                    {description && (<Typography color="#ffffffb3">{description}</Typography>)}

                    {Array.isArray(contents) ? (
                        <Typography component="ol" color="#ffffffb3">{contents.map((steps, index) => (
                            <Typography component="li" key={index} dangerouslySetInnerHTML={{ __html: steps }}></Typography>
                        ))}</Typography>
                    ) : (
                        <Typography color="#ffffffb3">{contents}</Typography>
                    )}

                    {note && (<Typography color="#ffffffb3">Note: {note}</Typography>)}

                </Box>
            );
        })
        return (
            <Box key={contextName}>
                <Typography my={0.5} variant="h5">{contextName}</Typography>
                {mappedContextData}
            </Box>
        );

    })

    return (
        <Box m="20px">
            {mappedItem}
        </Box >
    );
}

export default Help
