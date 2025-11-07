import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import styled from 'styled-components';

const Wrap = styled.div`
  max-width: 480px;
  margin: 40px auto;
  padding: 24px;
  background: ${(p) => p.theme.colors.card};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
`;

const Button = styled.button`
  padding: 10px 14px;
  border-radius: 6px;
  border: none;
  color: white;
  background: #2ecc71;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`;

const Message = styled.div`
  margin-top: 12px;
  color: ${(p) => (p.error ? 'red' : 'green')};
  font-weight: 500;
`;

const CategoryForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  //Handling Submit Button Action
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('Category name is required.');
      return;
    }

    try {
      await API.post('categories/', { name });
      setMessage('✅ Category added successfully!');
      setTimeout(() => navigate('/category'), 1000); 
      setName('');
    } catch (err) {
      setMessage(`Failed to Load: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  return (
    <Wrap>
      <h2>Add New Category</h2>
      <form onSubmit={submit}>
        <Field>
          <Label>Category Name</Label>
          <Input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Button type="submit">Add Category</Button>
      </form>
      {message && <Message error={message.startsWith('Failed to Load')}>{message}</Message>}
    </Wrap>
  );
};

export default CategoryForm;
