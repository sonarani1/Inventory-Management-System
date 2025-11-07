import React from 'react';
import styled from 'styled-components';

const FooterBar = styled.footer`
  background: ${p => p.theme.colors.footerBg};
  border-top: 1px solid ${p => p.theme.colors.border};
  padding: 20px 10px;
  text-align: center;
  color: ${p => p.theme.colors.textLight};
  font-size: 14px;
  margin-top: 40px;
  box-shadow: 0 -1px 4px ${p => p.theme.colors.shadow};
`;

const Footer = () => {
  return (
    <FooterBar>
      © {new Date().getFullYear()} Efficient Inventory Management System For Small Business
    </FooterBar>
  );
};

export default Footer;
