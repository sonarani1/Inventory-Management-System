import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import styled from 'styled-components';

// Consistent styling constants
const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
};

const COLORS = {
  text: '#1f2937',
  card: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.05)',
  border: '#e5e7eb',
  bg: '#f9fafb',
  primary: '#2b6cb0',
  success: '#10b981',
  danger: '#ef4444',
};

const FONT_SIZES = {
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  xxxl: '2rem',
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md};
  gap: ${SPACING.md};
  flex-wrap: wrap;
`;

const AddButton = styled(Link)`
  background: ${COLORS.success};
  color: white;
  padding: ${SPACING.sm} ${SPACING.md};
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: ${FONT_SIZES.md};
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
  }
`;

const Select = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: ${FONT_SIZES.sm};
  background-color: ${COLORS.card};
`;

const Label = styled.label`
  font-size: ${FONT_SIZES.sm};
  font-weight: 500;
  color: ${COLORS.text};
  margin-right: ${SPACING.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${COLORS.card};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px ${COLORS.shadow};
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

const ActionButton = styled(Link)`
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: 5px;
  text-decoration: none;
  font-size: ${FONT_SIZES.sm};
  margin-right: ${SPACING.sm};
  display: inline-block;
  color: white;
  background: ${p => (p.$type === "edit" ? "#3498db" : "#e74c3c")};
  transition: all 0.2s ease;

  &:hover {
    background: ${p => (p.$type === "edit" ? "#2471a3" : "#c0392b")};
  }
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  
  const load = async (category = '') => {
    const url = category ? `products/?category=${category}` : 'products/';
    const res = await API.get(url);
    setProducts(res.data);
    setPage(1);
  };
  
  const loadCategories = async () => {
    try {
      const res = await API.get('categories/');
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); loadCategories(); }, []);
  

  const onCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCat(val);
    load(val);
  };

  //Delete Button
  const remove = async (id) => {
    if (!window.confirm('Delete product?')) return;
    await API.delete(`products/${id}/`);
    load();
  };

  return (
    <Wrap>
      <PageTitle>Products</PageTitle>

      <HeaderRow>
        <AddButton to="/products/new">+ Add Product</AddButton>
        <div>
          <Label htmlFor="prod-cat">Select Category</Label>
          <Select id="prod-cat" value={selectedCat} onChange={onCategoryChange}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </HeaderRow>

      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>SKU</TableHeaderCell>
            <TableHeaderCell>Quantity</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHeader>

        <tbody>
          {products.slice((page-1)*pageSize, page*pageSize).map(p => (
            <tr key={p.id}>
              <TableCell>{p.category_name ? p.category_name : p.category?.name}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell>{p.quantity}</TableCell>
              <TableCell>{p.price}</TableCell>
              <TableCell>
                <ActionButton $type="edit" to={`/products/${p.id}/edit`}>
                  Edit
                </ActionButton>

                <ActionButton
                  $type="delete"
                  as="button"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </ActionButton>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination for 5 rows per page */}
      <PaginationContainer>
        <PaginationButton onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
          Prev
        </PaginationButton>
        <span>
          Page {page} of {Math.max(1, Math.ceil(products.length / pageSize))}
        </span>
        <PaginationButton
          onClick={() => setPage(p => Math.min(Math.ceil(products.length / pageSize) || 1, p+1))}
          disabled={page >= Math.ceil(products.length / pageSize)}
        >
          Next
        </PaginationButton>
      </PaginationContainer>
    </Wrap>
  );
};

export default Products;
