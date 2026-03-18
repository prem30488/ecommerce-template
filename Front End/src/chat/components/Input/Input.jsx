import React, { useState } from 'react'
import { Button, TextField } from '@mui/material';

const Input = ({ onSendMessage }) => {
    const [text, setText] = useState("")

    let onChange = (e) => {
        setText(e.target.value)
    }

    let onSubmitt = () => {
        setText("")
        onSendMessage(text);
    }

    return (
        <div className="message-input">
            <TextField
                className="inputField"
                label="Type your message here..."
                placeholder="Enter your message and press ENTER"
                onChange={e => onChange(e)}
                margin="normal"
                value={text}
                onKeyPress={event => {
                    if (event.key === 'Enter') {
                        onSubmitt(text);
                    }
                }}
                style={{ height: "30px", width: "80%" }}
            />

            <Button variant="contained" color="primary" onClick={onSubmitt}>
                Send
            </Button>
        </div>
    );
}


export default Input
