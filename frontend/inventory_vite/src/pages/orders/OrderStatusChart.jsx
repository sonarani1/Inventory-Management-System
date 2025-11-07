import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import API from "../../services/api";


const Container = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  color: #1f2937;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.label`
  color: #374151;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background-color: #f9fafb;
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
`;

// Helper Function
// Function to return a color based on order status

const getColor = (status) => {
  switch (status) {
    case "Pending":
      return "#facc15"; 
    case "Shipped":
      return "#3b82f6"; 
    case "Completed":
      return "#10b981"; 
    default:
      return "#9ca3af"; 
  }
};


const OrderStatusChart = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    API.get("categories/")
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

// Fetch orders whenever category filter changes
  useEffect(() => {
    const fetchOrders = async () => {
       // If category selected then filter by category 
      const url = selectedCat ? `orders/?category=${selectedCat}` : "orders/";
      const res = await API.get(url);
      const orders = res.data || [];

      
      // Initialize counters for each status

      const statusCounts = {
        Pending: 0,
        Shipped: 0,
        Completed: 0,
      };

        // Loop through orders and count each status
      orders.forEach((o) => {
        const status =
          o.status?.charAt(0).toUpperCase() + o.status?.slice(1).toLowerCase();
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++;
        }
      });

    // Convert object to array format for Recharts
      const data = Object.keys(statusCounts).map((status) => ({
        status,
        count: statusCounts[status],
      }));

      setChartData(data);
    };

    fetchOrders();
  }, [selectedCat]);

  return (
    <Container>
      <Header>
        <Title>Order Status Chart</Title>
        <FilterContainer>
          <Label>Select Category:</Label>
          <Select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FilterContainer>
      </Header>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Number of Orders">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginTop: 30,
          }}
        >
          No orders found
        </div>
      )}
    </Container>
  );
};

export default OrderStatusChart;
