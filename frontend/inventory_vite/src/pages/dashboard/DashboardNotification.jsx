import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import styled from 'styled-components';

const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

const COLORS = {
  text: '#1f2937',
  textLight: '#6b7280',
  card: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.05)',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
};

const NotificationsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.md};

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const NotificationCard = styled.div`
  background: ${COLORS.card};
  border-radius: 8px;
  padding: ${SPACING.lg};
  box-shadow: 0 2px 4px ${COLORS.shadow};
`;

const CardTitle = styled.h3`
  font-size: ${FONT_SIZES.xl};
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.md} 0;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

const Section = styled.div`
  margin-bottom: ${SPACING.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: ${FONT_SIZES.md};
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.sm} 0;
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const AlertItem = styled.div`
  padding: ${SPACING.sm} ${SPACING.md};
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${FONT_SIZES.sm};
  border-left: 4px solid ${props => props.borderColor};
  background-color: ${props => props.bgColor};
`;

const ProductName = styled.span`
  font-weight: 500;
  color: ${COLORS.text};
`;

const QuantityBadge = styled.span`
  padding: 2px ${SPACING.xs};
  border-radius: 4px;
  font-size: ${FONT_SIZES.xs};
  font-weight: 600;
  color: ${props => props.textColor};
  background-color: ${props => props.bgColor};
`;

const EmptyState = styled.div`
  padding: ${SPACING.md};
  text-align: center;
  color: ${COLORS.textLight};
  font-size: ${FONT_SIZES.sm};
  font-style: italic;
`;

const Icon = styled.span`
  font-size: ${FONT_SIZES.lg};
`;

const DashboardNotifications = () => {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const [productsRes, ordersRes] = await Promise.all([
          API.get('products/'),
          API.get('orders/'),
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];

        // Filter low stock (quantity < 20)
        const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity < 20);
        setLowStock(lowStockProducts);

        // Filter out of stock (quantity = 0)
        const outOfStockProducts = products.filter(p => p.quantity === 0);
        setOutOfStock(outOfStockProducts);

        // Filter pending orders
        const pending = orders.filter(o => o.status?.toLowerCase() === 'pending');
        setPendingOrders(pending);

      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <NotificationsContainer>
        <NotificationCard>
          <CardTitle>
            <Icon>🔔</Icon>
            Stock Alerts
          </CardTitle>
          <div style={{ textAlign: 'center', padding: SPACING.lg, color: COLORS.textLight }}>
            Loading...
          </div>
        </NotificationCard>
        <NotificationCard>
          <CardTitle>
            <Icon>📦</Icon>
            Pending Orders
          </CardTitle>
          <div style={{ textAlign: 'center', padding: SPACING.lg, color: COLORS.textLight }}>
            Loading...
          </div>
        </NotificationCard>
      </NotificationsContainer>
    );
  }

  const stockAlerts = lowStock.length + outOfStock.length;

  return (
    <NotificationsContainer>
      {/* Stock Alerts Card */}
      <NotificationCard>
        <CardTitle>
          <Icon>🔔</Icon>
          Stock Alerts
          {stockAlerts > 0 && (
            <QuantityBadge
              textColor="#fff"
              bgColor={COLORS.danger}
              style={{ marginLeft: SPACING.sm }}
            >
              {stockAlerts}
            </QuantityBadge>
          )}
        </CardTitle>

        {/* Low Stock Section */}
        <Section>
          <SectionTitle>
            <Icon>⚠️</Icon>
            Low Stock ({lowStock.length})
          </SectionTitle>
          {lowStock.length > 0 ? (
            <AlertList>
              {lowStock.map(product => (
                <AlertItem
                  key={product.id}
                  borderColor={COLORS.warning}
                  bgColor="#fef3c7"
                >
                  <ProductName>{product.name}</ProductName>
                  <QuantityBadge
                    textColor={COLORS.warning}
                    bgColor="#fde68a"
                  >
                    {product.quantity} units
                  </QuantityBadge>
                </AlertItem>
              ))}
            </AlertList>
          ) : (
            <EmptyState>No products with low stock</EmptyState>
          )}
        </Section>

        {/* Out of Stock Section */}
        <Section>
          <SectionTitle>
            <Icon>❌</Icon>
            Out of Stock ({outOfStock.length})
          </SectionTitle>
          {outOfStock.length > 0 ? (
            <AlertList>
              {outOfStock.map(product => (
                <AlertItem
                  key={product.id}
                  borderColor={COLORS.danger}
                  bgColor="#fee2e2"
                >
                  <ProductName>{product.name}</ProductName>
                  <QuantityBadge
                    textColor={COLORS.danger}
                    bgColor="#fecaca"
                  >
                    {product.quantity} units
                  </QuantityBadge>
                </AlertItem>
              ))}
            </AlertList>
          ) : (
            <EmptyState>All products are in stock</EmptyState>
          )}
        </Section>
      </NotificationCard>

      {/* Pending Orders Card */}
      <NotificationCard>
        <CardTitle>
          <Icon>📦</Icon>
          Pending Orders
          {pendingOrders.length > 0 && (
            <QuantityBadge
              textColor="#fff"
              bgColor={COLORS.info}
              style={{ marginLeft: SPACING.sm }}
            >
              {pendingOrders.length}
            </QuantityBadge>
          )}
        </CardTitle>

        <Section>
          {pendingOrders.length > 0 ? (
            <AlertList>
              {pendingOrders.map(order => (
                <AlertItem
                  key={order.id}
                  borderColor={COLORS.info}
                  bgColor="#dbeafe"
                >
                  <ProductName>
                    {order.product_name || (order.product && order.product.name) || 'Unknown Product'}
                  </ProductName>
                  <QuantityBadge
                    textColor={COLORS.info}
                    bgColor="#bfdbfe"
                  >
                    Qty: {order.quantity}
                  </QuantityBadge>
                </AlertItem>
              ))}
            </AlertList>
          ) : (
            <EmptyState>No pending orders</EmptyState>
          )}
        </Section>
      </NotificationCard>
    </NotificationsContainer>
  );
};

export default DashboardNotifications;
