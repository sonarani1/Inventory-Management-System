import React, { useEffect, useState } from "react";
import API from "../services/api";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Inventory from "./Inventory";
import DashboardVisualization from "./DashboardVisualization";
import DashboardNotifications from "./DashboardNotifications";

// Consistent styling constants
const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

const COLORS = {
  text: "#1f2937",
  textLight: "#6b7280",
  card: "#ffffff",
  shadow: "rgba(0, 0, 0, 0.05)",
  border: "#e5e7eb",
  bg: "#f9fafb",
  primary: "#2b6cb0",
};

const FONT_SIZES = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  xxl: "1.5rem",
  xxxl: "2rem",
};

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${SPACING.lg};
`;

const PageTitle = styled.h2`
  font-size: ${FONT_SIZES.xxxl};
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.lg} 0;
`;

const Card = styled.div`
  background: ${COLORS.card};
  border-radius: 8px;
  padding: ${SPACING.lg};
  box-shadow: 0 2px 4px ${COLORS.shadow};
  margin-bottom: ${SPACING.md};
`;

const CardTitle = styled.h3`
  font-size: ${FONT_SIZES.xl};
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.md} 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md};
`;

const Select = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: ${FONT_SIZES.sm};
  background-color: ${COLORS.card};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: ${COLORS.bg};
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: ${SPACING.md};
  font-weight: 600;
  font-size: ${FONT_SIZES.sm};
  color: ${COLORS.text};
  border-bottom: 2px solid ${COLORS.border};
`;

const TableCell = styled.td`
  padding: ${SPACING.md};
  border-bottom: 1px solid ${COLORS.border};
  font-size: ${FONT_SIZES.md};
  color: ${COLORS.text};
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.md};
  margin-top: ${SPACING.md};
  justify-content: center;
`;

const PaginationButton = styled.button`
  padding: ${SPACING.xs} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  background: ${COLORS.card};
  cursor: pointer;
  font-size: ${FONT_SIZES.sm};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${COLORS.bg};
    border-color: ${COLORS.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  font-size: ${FONT_SIZES.sm};
  font-weight: 500;
  color: ${COLORS.text};
  margin-right: ${SPACING.sm};
`;

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [chart, setChart] = useState([]);
  const [dashCatList, setDashCatList] = useState([]);
  const [dashCat, setDashCat] = useState("");
  const [prodOrderRows, setProdOrderRows] = useState([]);
  const [poPage, setPoPage] = useState(1);
  const poPageSize = 2;

  useEffect(() => {
    const load = async () => {
      try {
        const s = await API.get("dashboard/stats/");
        setStats(s.data);
      } catch (e) {
        console.error(e);
      }
      try {
        const c = await API.get("dashboard/stock-chart/");
        const payload = c.data || {};
        const dates = payload.dates || payload.date || [];
        const levels = payload.stock_levels || payload.stock || [];
        const merged = Array.isArray(dates)
          ? dates.map((d, i) => ({ date: d, stock: levels[i] ?? 0 }))
          : [];
        setChart(merged);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Load category list for dashboard summary card
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("categories/");
        setDashCatList(res.data || []);
      } catch (e) {
        /* noop */
      }
    })();
  }, []);

  // Load product + orders summary when category changes
  useEffect(() => {
    const loadSummary = async () => {
      if (!dashCat) {
        setProdOrderRows([]);
        return;
      }
      try {
        const [prodRes, orderRes] = await Promise.all([
          API.get(`products/?category=${dashCat}`),
          API.get(`orders/?category=${dashCat}`),
        ]);

        const products = prodRes.data || [];
        const orders = orderRes.data || [];

        const counts = new Map();
        orders.forEach((o) => {
          const name =
            o.product_name || (o.product && o.product.name) || "Unknown";
          counts.set(name, (counts.get(name) || 0) + (Number(o.quantity) || 0));
        });

        const rows = products.map((p) => ({
          name: p.name,
          orders: counts.get(p.name) || 0,
        }));
        setProdOrderRows(rows);
        setPoPage(1);
      } catch (e) {
        // ignore
      }
    };
    loadSummary();
  }, [dashCat]);

  return (
    <Wrap>
      <PageTitle>Dashboard</PageTitle>

      {/* Notifications & Alerts Card */}
      <DashboardNotifications />

      {/* Dashboard summary: Category -> product and orders count (2 rows with pagination) */}
      <Card>
        <HeaderRow>
          <CardTitle>Category Summary</CardTitle>
          <div>
            <Label htmlFor="dash-cat">Select Category</Label>
            <Select
              id="dash-cat"
              value={dashCat}
              onChange={(e) => setDashCat(e.target.value)}
            >
              <option value="">—</option>
              {dashCatList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </HeaderRow>
        <div>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Orders</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {prodOrderRows
                .slice((poPage - 1) * poPageSize, poPage * poPageSize)
                .map((r, idx) => (
                  <tr key={idx}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.orders}</TableCell>
                  </tr>
                ))}
            </tbody>
          </Table>
          <PaginationContainer>
            <PaginationButton
              onClick={() => setPoPage((p) => Math.max(1, p - 1))}
              disabled={poPage === 1}
            >
              Prev
            </PaginationButton>
            <span>
              Page {poPage} of{" "}
              {Math.max(1, Math.ceil((prodOrderRows.length || 0) / poPageSize))}
            </span>
            <PaginationButton
              onClick={() =>
                setPoPage((p) =>
                  Math.min(
                    Math.ceil((prodOrderRows.length || 0) / poPageSize) || 1,
                    p + 1
                  )
                )
              }
              disabled={
                poPage >= Math.ceil((prodOrderRows.length || 0) / poPageSize)
              }
            >
              Next
            </PaginationButton>
          </PaginationContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Stock Levels Over Time</CardTitle>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="stock" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <DashboardVisualization />
      {/* Inventory Table below chart */}
      <Inventory />
    </Wrap>
  );
};

export default Dashboard;
