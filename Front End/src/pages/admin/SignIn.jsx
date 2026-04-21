import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button } from '@mui/material';
import Alert from 'react-s-alert';
import { login } from '../../util/APIUtils';
import { ACCESS_TOKEN } from '../../constants';
import { useNavigate } from "react-router-dom";
const SignIn = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSignIn = () => {
    // Implement your sign-in logic here
    const loginRequest = Object.assign({}, {
      email: email,
      password: password
    });
    login(loginRequest)
      .then(response => {
        localStorage.setItem(ACCESS_TOKEN, response.accessToken);
        Alert.success("You're successfully logged in!");
        setAuthenticated(true);
        navigate("/dashboard");
        window.location.reload();
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
  };

  return (
    <React.Fragment>
      <div style={{ paddingTop: "100px" }}></div>

      <Container maxWidth="xs" style={{ paddingBottom: "20px" }}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h2" align="center">Sign In</Typography>
          <form >
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default SignIn;
