import React from 'react';
import styled from 'styled-components';

const FooterBar = styled.footer`
  background: ${p => p.theme.colors.navbarBg};
  border-top: 1px solid ${p => p.theme.colors.border};
  box-shadow: 0 -2px 6px ${p => p.theme.colors.shadow};
  padding: 14px 24px;
  margin-top: 30px;
  text-align: center;
  color: ${p => p.theme.colors.text};
  font-size: 14px;

  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 50;
`;

const Footer = () => {
  return (
    <FooterBar>
      © {new Date().getFullYear()} Efficient Inventory Management System FOr Small Businesses
    </FooterBar>
  );
};

export default Footer;