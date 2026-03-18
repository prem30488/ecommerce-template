import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const LoginForm = ({ onSubmit }) => {

    const [username, setUsername] = useState("");
    let handleUserNameChange = event => setUsername(event.target.value);

    let handleSubmit = () => {
        onSubmit(username);
    }

    return (
        <div>
            <TextField
                label="Type your username"
                placeholder="Username"
                onChange={handleUserNameChange}
                margin="normal"
                onKeyPress={event => {
                    if (event.key === 'Enter') {
                        handleSubmit();
                    }
                }}
            />
            <br /> &nbsp;
            <Button variant="contained" color="primary" onClick={handleSubmit} >
                Login
            </Button>

        </div>
    )
}

export default LoginForm
