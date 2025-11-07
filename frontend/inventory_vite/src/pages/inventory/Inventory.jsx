import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import styled from 'styled-components';

const Wrap = styled.div`
  max-width: var(--max-width);
  margin: 24px auto;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CategorySelect = styled.select`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: white;
  font-size: 14px;
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
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f4f4f4;
`;

const Status = styled.span`
  color: ${(p) =>
    p.qty > 30 ? 'green' :
    p.qty > 0 ? 'orange' :
    'red'};
  font-weight: 600;
`;

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const load = async () => {
    try {
      const res = await API.get('products/');
      const data = res.data;
      setProducts(data);
      setFiltered(data);


      // Extracting distinct category names
      const uniqueCategories = [...new Set(
        data.map(item => item.category_name ? item.category_name : item.category?.name)
      )];
      setCategories(uniqueCategories);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setActiveCategory(value);

    if (value === "All") {
      setFiltered(products);
    } else {
      setFiltered(products.filter(p =>
        (p.category_name ? p.category_name : p.category?.name) === value
      ));
    }
    setPage(1);
  };

  return (
    <Wrap>

     {/* creating category dropdown coloum */}

      <Header>
        <h3>Inventory Overview</h3>

        <CategorySelect value={activeCategory} onChange={handleCategoryChange}>
          <option value="All">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </CategorySelect>
      </Header>

      <Table>
        <thead>
          <tr>
            <Th>Category</Th>
            <Th>Product Name</Th>
            <Th>SKU</Th>
            <Th>Quantity</Th>
            <Th>Status</Th>
          </tr>
        </thead>

        <tbody>
          {filtered.slice((page-1)*pageSize, page*pageSize).map((p) => {
            let statusLabel = "";

            if (p.quantity <= 0) {
              statusLabel = "Out of Stock";
            } else if (p.quantity <= 30) {
              statusLabel = "Low Stock";
            } else {
              statusLabel = "In Stock";
            }

            return (
              <tr key={p.id}>
                <Td>{p.category_name ? p.category_name : p.category?.name}</Td>
                <Td>{p.name}</Td>
                <Td>{p.sku}</Td>
                <Td>{p.quantity}</Td>
                <Td>
                  <Status qty={p.quantity}>{statusLabel}</Status>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
        <span>Page {page} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</span>
        <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / pageSize) || 1, p+1))} disabled={page >= Math.ceil(filtered.length / pageSize)}>Next</button>
      </div>
    </Wrap>
  );
};

export default Inventory;