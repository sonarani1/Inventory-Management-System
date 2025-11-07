import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Bar = styled.header`
  background: ${p => p.theme.colors.navbarBg};
  padding: 14px 24px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  box-shadow: 0 2px 6px ${p => p.theme.colors.shadow};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Container = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.h1`
  font-size: 22px;
  margin: 0;
  color: ${p => p.theme.colors.primary};
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const NavLink = styled(Link)`
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  color: ${p => p.theme.colors.text};
  transition: all 0.2s ease;
  &:hover {
    background: ${p => p.theme.colors.hoverBg || '#dbeafe'};
    color: ${p => p.theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: ${p => p.theme.colors.primaryHover};
  }
`;

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('access');
    navigate('/login');
  };

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/' ||
    location.pathname === '/register';

  return (
    <Bar>
      <Container>
        <Brand>Inventory Manager</Brand>
        <Nav>
          {isAuthPage ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/category">Category</NavLink>
              <LogoutButton onClick={logout}>Logout</LogoutButton>
            </>
          )}
        </Nav>
      </Container>
    </Bar>
  );
};

export default NavBar;