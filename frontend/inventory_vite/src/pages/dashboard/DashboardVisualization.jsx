import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import API from '../../services/api';


const Section = styled.div`
  margin-top: 40px;
  background: ${(p) => p.theme.colors.card || '#fff'};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Title = styled.h2`
  font-size: 1.6rem;
  color: ${(p) => p.theme.colors.text || '#222'};
  margin: 0;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #fafafa;
  width: 220px;
`;

const GraphGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (min-width: 900px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const GraphCard = styled.div`
  flex: 1;
  background: ${(p) => p.theme.colors.backgroundAlt || '#f9fafb'};
  border-radius: 12px;
  padding: 16px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.05);
`;


const getStockColor = (qty) => {
  if (qty < 20) return '#ef4444'; 
  if (qty <= 60) return '#facc15'; 
  return '#22c55e'; 
};

const getDemandColor = (qty) => {
  // simple thresholds for low/medium/high demand
  if (qty < 5) return '#ef4444';
  if (qty < 15) return '#facc15';
  return '#22c55e';
};

// ---------- Component ----------
const DashboardVisualization = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [inwardData, setInwardData] = useState([]);
  const [outwardData, setOutwardData] = useState([]);

  // Fetch categories
  useEffect(() => {
    API.get('categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Category fetch error:', err));
  }, []);

  // Fetch products (Inward stock)
  const fetchInwardData = async (catId) => {
    if (!catId) {
      setInwardData([]);
      return;
    }
    try {
      const res = await API.get(`products/?category=${catId}`);
      const formatted = res.data.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        fill: getStockColor(p.quantity),
      }));
      setInwardData(formatted);
    } catch (err) {
      console.error('Inward stock fetch error:', err);
    }
  };

  // Fetch outward stock (product-wise total sold units)
const fetchOutwardData = async (catId) => {
  if (!catId) {
    setOutwardData([]);
    return;
  }

  try {
    // Step 1: Fetch products for selected category
    const prodRes = await API.get(`products/?category=${catId}`);
    const products = prodRes.data;

    // Step 2: Fetch orders filtered by selected category
    const orderRes = await API.get(`orders/?category=${catId}`);
    const orders = orderRes.data;

    // Step 3: Build a set/map of product ids in this category
    const productIdSet = new Set(products.map(p => p.id));

    // Step 4: Aggregate order quantities by product id
    const soldTotals = {};
    orders.forEach((order) => {
      const productId = order.product;
      if (productIdSet.has(productId)) {
        soldTotals[productId] = (soldTotals[productId] || 0) + (Number(order.quantity) || 0);
      }
    });

    // Step 5: Map to chart rows in the same product order
    const formatted = products.map((p) => {
      const soldQty = soldTotals[p.id] || 0;
      return {
        name: p.name,
        quantity: soldQty,
        fill: getDemandColor(soldQty),
      };
    });

    setOutwardData(formatted);
  } catch (err) {
    console.error('Outward stock fetch error:', err);
  }
};


  // Fetch data on category change
  useEffect(() => {
    if (selectedCat) {
      fetchInwardData(selectedCat);
      fetchOutwardData(selectedCat);
    }
  }, [selectedCat]);

  return (
    <Section>
      <Header>
        <Title>📊 Visualization</Title>
        <Select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Header>

      <GraphGrid>
        {/* Inward Stock Overview */}
        <GraphCard>
          <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Inward Stock Overview</h3>
          {inwardData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inwardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" name="Current Stock">
                  {inwardData.map((entry, index) => (
                    <Cell key={`cell-in-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: '#888' }}>Select a category to view data</p>
          )}
        </GraphCard>

        {/* Outward Stock Overview */}
        <GraphCard>
          <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Outward Stock (Orders Overview)</h3>
          {outwardData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={outwardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" name="Units Ordered">
                  {outwardData.map((entry, index) => (
                    <Cell key={`cell-out-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: '#888' }}>Select a category to view data</p>
          )}
        </GraphCard>
      </GraphGrid>
    </Section>
  );
};

export default DashboardVisualization;
