import React, { useEffect, useState } from "react";
import API from "../../services/api";
import styled from "styled-components";

const Wrap = styled.div`
  max-width: var(--max-width);
  margin: 24px auto;
  padding: 16px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Button = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  background: ${(p) => (p.variant === "danger" ? "#e74c3c" : "#2ecc71")};
  font-weight: 600;
  transition: 0.2s ease;
  &:hover {
    opacity: 0.9;
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
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f4f4f4;
`;

const Category = () => {
  const [products, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const load = async () => {
    try {
      const res = await API.get("categories/");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  //Asking Before Deleting
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await API.delete(`categories/${id}/`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Wrap>
      <HeaderRow>
        <h3>Category</h3>
        <Button
          variant="success"
          onClick={() => (window.location.href = "/category/new")}
        >
          + Add Category
        </Button>
      </HeaderRow>

      <Table>
        <thead>
          <tr>
            <Th>Category Name</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {products.slice((page - 1) * pageSize, page * pageSize).map((p) => (
            <tr key={p.id}>
              <Td>{p.name}</Td>
              <Td>
                <Button variant="danger" onClick={() => remove(p.id)}>
                  Delete
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/*Pagination*/}
      <div
        style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(products.length / pageSize))}
        </span>
        <button
          onClick={() =>
            setPage((p) =>
              Math.min(Math.ceil(products.length / pageSize) || 1, p + 1)
            )
          }
          disabled={page >= Math.ceil(products.length / pageSize)}
        >
          Next
        </button>
      </div>
    </Wrap>
  );
};

export default Category;
