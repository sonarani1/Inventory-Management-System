import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import API from "../../services/api";
import OrderStatusChart from "./OrderStatusChart";


const Page = styled.div`
  padding: 50px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  color: #1f2937;
`;

const Button = styled.button`
  background-color: ${(p) => (p.danger ? "#ef4444" : "#10b981")};
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: ${(p) => (p.danger ? "#dc2626" : "#10b981")};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${(p) => p.theme.colors.card};
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #f4f4f4;
`;

const Select = styled.select`
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  
  // Function to fetch all orders ( by category if selected)
  const fetchOrders = async (category = '') => {
    try {
      const url = category ? `orders/?category=${category}` : 'orders/';
      const res = await API.get(url);
      setOrders(res.data);
      setPage(1);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    }
  };

// Fetch orders and categories when page loads first time
  useEffect(() => {
    fetchOrders();
    API.get('categories/').then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  // Triggered when user selects a category from dropdown
  const onCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCat(val);
    fetchOrders(val);
  };


  // Function to change order status (Pending ,Shipped , Completed)
  const changeStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`orders/${orderId}/`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  // Delete order after confirmation
  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`orders/${orderId}/`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <>
      <Page>
        <Header>
          <Title>Orders</Title>
          <Link to="/orders/new">
            <Button>Add Order</Button>
          </Link>
        </Header>
        <div style={{ marginBottom: 24 }}>
  <OrderStatusChart />
</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <label htmlFor="orders-cat" style={{ marginRight: 8 }}>Select Category</label>
          <select id="orders-cat" value={selectedCat} onChange={onCategoryChange}>
            <option value="">All</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>Order</Th>
              <Th>Product</Th>
              <Th>Quantity</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {orders.slice((page-1)*pageSize, page*pageSize).map((o) => {
              const disabled = o.status?.toLowerCase() !== "pending";
              return (
                <tr key={o.id}>
                  <Td>{o.product_category_name}</Td>
                  <Td>Order #{o.id}</Td>
                  <Td>{o.product_name}</Td>
                  <Td>{o.quantity}</Td>
                  <Td>
                    <Select
                      value={o.status || "pending"}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      disabled={disabled}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                    </Select>
                  </Td>
                  <Td>
                    <Link to={`/orders/${o.id}/edit`}>
                      <Button disabled={disabled}>Edit</Button>
                    </Link>{" "}
                    <Button
                      danger
                      disabled={disabled}
                      onClick={() => handleDelete(o.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

            {/* {pagination} */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
          <span>Page {page} of {Math.max(1, Math.ceil(orders.length / pageSize))}</span>
          <button onClick={() => setPage(p => Math.min(Math.ceil(orders.length / pageSize) || 1, p+1))} disabled={page >= Math.ceil(orders.length / pageSize)}>Next</button>
        </div>
      </Page>
    </>
  );
};

export default Orders;
