import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import styled from 'styled-components';

const Wrap = styled.div`
  max-width:480px;
  margin:24px auto;
  padding:16px;
  background:${p=>p.theme.colors.card};
  border-radius:8px;
`;
const Field = styled.div`margin-bottom:12px;`;
const Input = styled.input`
  width:100%;
  padding:10px;
  border:1px solid #ddd;
  border-radius:6px;
`;
const Select = styled.select`
  width:100%;
  padding:10px;
  border:1px solid #ddd;
  border-radius:6px;
`;
const Button = styled.button`
  padding:10px 14px;
  border-radius:6px;
  background:${p=>p.theme.colors.primary};
  color:white;
  border:none;
  cursor:pointer;
`;

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    name: '',
    sku: '',
    quantity: 0,
    price: 0.0,
    category: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch categories
    API.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(() => {});

    // If editing product
    if (id) {
      API.get(`/products/${id}/`)
        .then(res => setData(res.data))
        .catch(() => {});
    }
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      sku: (data.sku || '').trim(),
      name: (data.name || '').trim(),
      quantity: Number.isFinite(+data.quantity) ? Math.max(0, parseInt(data.quantity, 10) || 0) : 0,
      price: Number.isFinite(+data.price) ? Math.max(0, parseFloat(data.price)) : 0,
    };
    if (!payload.sku) {
      setErrors({ sku: "SKU is required" });
      return;
    }
    try {
      setErrors({});
      if (id) await API.put(`/products/${id}/`, payload);
      else await API.post('/products/', payload);
      navigate('/products');
    } catch (err) {
      const resp = err?.response;
      // Try to extract field-level error. Fallback to general error.
      let nextErrors = {};
      if (resp?.status === 400 && resp.data) {
        if (resp.data.sku) {
          nextErrors.sku = Array.isArray(resp.data.sku)
            ? resp.data.sku.join(', ')
            : String(resp.data.sku);
        } else if (resp.data.message || resp.data.type === 'api_error') {
          nextErrors.sku = "SKU already exists or is invalid.";
        }
        setErrors(nextErrors);
        return;
      }
      setErrors({ sku: null, other: "Failed to save product" });
    }
  };

  return (
    <Wrap>
      <h2>{id ? 'Edit' : 'Add'} Product</h2>
      <form onSubmit={submit}>

        {/* Category Select */}
        <Field>
          <label>Category</label>
          <Select
            value={data.category || ''}
            onChange={e => setData({ ...data, category: e.target.value })}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
        </Field>

        <Field>
          <label>Name</label>
          <Input
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            required
          />
        </Field>

        <Field>
          <label>SKU</label>
          <Input
            value={data.sku}
            onChange={e => setData({ ...data, sku: e.target.value })}
            required
          />
          {errors.sku && (
            <div style={{ color: '#dc2626', marginTop: 6 }}>
              {errors.sku}
            </div>
          )}
        </Field>

        <Field>
          <label>Quantity</label>
          <Input
            type="number"
            min="0"
            value={data.quantity}
            onChange={e => setData({ ...data, quantity: parseInt(e.target.value || 0) })}
            required
          />
        </Field>

        <Field>
          <label>Price</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={data.price}
            onChange={e => setData({ ...data, price: parseFloat(e.target.value || 0) })}
            required
          />
        </Field>

        {/* Display any other error */}
        {errors.other && (
            <div style={{ color: '#dc2626', marginTop: 6 }}>
              {errors.other}
            </div>
        )}

        <Button type="submit">Save</Button>
      </form>
    </Wrap>
  );
};

export default ProductForm;
