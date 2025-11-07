import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api.jsx';
import styled from 'styled-components';

const Wrap = styled.div`
  max-width: 480px;
  margin: 40px auto;
  padding: 20px;
  background: ${(p) => p.theme.colors?.card || '#fff'};
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
`;

const Field = styled.div`
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
`;

const Button = styled.button`
  padding: 10px 14px;
  border-radius: 6px;
  background: ${(p) => p.theme.colors?.primary || '#0d6efd'};
  color: white;
  border: none;
  cursor: pointer;
`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Username Validate
  const validateUsername = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (username.trim().length > 50) {
      setError('Username must be less than 50 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setError('');
    return true;
  };
   // Email Validate
  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (email.trim().length > 254) {
      setError('Email must be less than 254 characters');
      return false;
    }
    setError('');
    return true;
  };
   // Password Validate
  const validatePassword = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password.length > 128) {
      setError('Password must be less than 128 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      setError('Password must contain at least one uppercase and one lowercase letter');
      return false;
    }
    if (!/(?=.*[0-9])/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }
    setError('');
    return true;
  };

   // ConfirmPassword Validate
  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  //FORM SUBMITING 
  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Run all validations before submitting
    if (
      !validateUsername() ||
      !validateEmail() ||
      !validatePassword() ||
      !validateConfirmPassword()
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/register/', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/login');
    } 
    //Showing server Errors
    catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        if (errorData.detail) setError(errorData.detail);
        else if (errorData.message) setError(errorData.message);
        else if (errorData.error) setError(errorData.error);
        else if (errorData.non_field_errors)
          setError(
            Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors[0]
              : errorData.non_field_errors
          );
        else setError('Registration failed. Please check your info.');
      } else if (err.request) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrap>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <Field>
          <label>Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={validateUsername}
            disabled={isLoading}
            maxLength={50}
          />
        </Field>

        <Field>
          <label>Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            disabled={isLoading}
            maxLength={254}
          />
        </Field>

        <Field>
          <label>Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validatePassword}
            disabled={isLoading}
            maxLength={128}
          />
        </Field>

        <Field>
          <label>Confirm Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validateConfirmPassword}
            disabled={isLoading}
            maxLength={128}
          />
        </Field>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Wrap>
  );
};

export default Register;
