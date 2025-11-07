import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api.jsx';
import styled from 'styled-components';

const Wrap = styled.div`max-width:480px;margin:40px auto;padding:20px;background:${p=>p.theme.colors.card};border-radius:8px;`;
const Field = styled.div`margin-bottom:12px;`;
const Input = styled.input`width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;`;
const Button = styled.button`padding:10px 14px;border-radius:6px;background:${p=>p.theme.colors.primary};color:white;border:none;cursor:pointer;`;

const Login = () => {
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate();

// validating login form

  const validateForm = () => {
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
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password.length > 128) {
      setError('Password must be less than 128 characters');
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post('/login/', { username: username.trim(), password });
      if (res.data.access || res.data.token) {
        localStorage.setItem('access', res.data.access || res.data.token);
        if (res.data.refresh) {
          localStorage.setItem('refresh', res.data.refresh);
        }
        setUsername('');
        setPassword('');
        navigate('/dashboard');
      } else {
        setError('Login failed: invalid response');
      }
    } 

    // showing server errors
    catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
        } else {
          setError('Login failed. Please check your credentials.');
        }
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
      <h2>Login</h2>
      <form onSubmit={submit}>
        <Field>
          <label>Username</label>
          <Input 
            value={username} 
            onChange={e=>setUsername(e.target.value)} 
            disabled={isLoading}
            maxLength={50}
          />
        </Field>
        <Field>
          <label>Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            disabled={isLoading}
            maxLength={128}
          />
        </Field>
        {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Wrap>
  );
};

export default Login;