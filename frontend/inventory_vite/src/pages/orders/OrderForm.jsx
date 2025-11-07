import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 60px auto;
  padding: 32px 24px;
  background: ${(p) => p.theme.colors.card || '#fff'};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 28px;
  color: ${(p) => p.theme.colors.text || '#222'};
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #fafafa;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
`;

const SubmitButton = styled.button`
  background-color: #10b981;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  flex: 1;
  margin-right: 10px;

  &:hover {
    background-color: #059669;
  }
`;

const CancelButton = styled.button`
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  flex: 1;

  &:hover {
    background-color: #dc2626;
  }
`;

const Message = styled.div`
  text-align: center;
  margin-top: 14px;
  color: ${({ success }) => (success ? '#16a34a' : '#dc2626')};
  font-weight: 500;
`;

// Component
const OrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [formCategory, setFormCategory] = useState('');
  const [formData, setFormData] = useState({ product: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load categories
  useEffect(() => {
    API.get('categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Category fetch error:', err));
  }, []);

  // If editing, load existing order details
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      API.get(`orders/${id}/`)
        .then((res) => {
          const order = res.data;
          const productId = order.product;
          
          // Pre-fill quantity and product fields
          setFormData({
            product: String(productId),
            quantity: String(order.quantity || ''),
          });
          
          // Get the category of that product to show in dropdown
          API.get(`products/${productId}/`)
            .then((prodRes) => {
              const prod = prodRes.data;
              if (prod.category) {
                setFormCategory(String(prod.category));
              }
            })
            .catch((err) => {
              console.error('Product fetch error:', err);
            });
        })
        .catch((err) => {
          console.error('Order fetch error:', err);
          setMessage('Failed to load order data');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Fetch products based on category
  useEffect(() => {
    if (formCategory) {
      API.get(`products/?category=${formCategory}`)
        .then((res) => setProducts(res.data))
        .catch((err) => console.error('Product fetch error:', err));
    } else {
      setProducts([]);
    }
  }, [formCategory]);

  // Submit Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCategory || !formData.product || !formData.quantity) {
      setMessage('Please fill all fields properly');
      return;
    }

    if (formData.quantity <= 0) {
      setMessage('Quantity must be greater than 0');
      return;
    }

    try {
      const payload = {
        product: parseInt(formData.product),
        quantity: parseInt(formData.quantity),
        status: 'Pending',
      };

      if (isEdit) {
        // Update existing order
        await API.put(`orders/${id}/`, payload);
        setMessage('✅ Order updated successfully!');
      } else {
        // Add new order
        await API.post('orders/', payload);
        
        // Fetch updated product quantity and check product quantity after adding
        try {
          const prodRes = await API.get(`products/${parseInt(formData.product)}/`);
          const remaining = prodRes.data?.quantity ?? null;
          if (remaining !== null && remaining < 10) {
            alert('Add more products, selling fast');
          }
        } catch (e) { /* ignore */ }
        setMessage('✅ Order added successfully!');
      }
      
      setTimeout(() => navigate('/orders'), 1200);
    } catch (err) {
      console.error('Order save error:', err);
      setMessage(isEdit ? '❌ Failed to update order' : '❌ Failed to add order');
    }
  };

  return (
    <Container>
      <Title>{isEdit ? 'Edit Order' : 'Add New Order'}</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading order data...</div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Category</Label>
            <Select
              value={formCategory}
              onChange={(e) => {
                setFormCategory(e.target.value);
                setFormData({ ...formData, product: '' });
              }}
              disabled={isEdit}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>Product</Label>
            <Select
              name="product"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              disabled={!formCategory || isEdit}
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>Quantity</Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value || 0) })
              }
              min="1"
            />
          </Field>

          <ButtonRow>
            <SubmitButton type="submit">{isEdit ? 'Update Order' : 'Add Order'}</SubmitButton>
            <CancelButton type="button" onClick={() => navigate('/orders')}>
              Cancel
            </CancelButton>
          </ButtonRow>

          {message && (
            <Message success={message.includes('successfully')}>
              {message}
            </Message>
          )}
        </Form>
      )}
    </Container>
  );
};

export default OrderForm;
