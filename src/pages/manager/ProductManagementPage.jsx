import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/manager/productManagementPage.css";

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    image: "",
    description: "",
  });

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/products"
      );

      setProducts(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải sản phẩm");

      const demo = [
        {
          id: 1,
          name: "Modern Sofa",
          price: 5000000,
          image: "",
          description: "Sofa hiện đại",
        },
      ];

      setProducts(demo);
      setFiltered(demo);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const data = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(data);
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      price: 0,
      image: "",
      description: "",
    });
    setIsOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm(product);
    setIsOpen(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveProduct = async () => {
    try {
      if (editingProduct) {
        await axios.put(
          `https://localhost:5001/api/products/${editingProduct.id}`,
          form
        );

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? form : p
          )
        );
      } else {
        const res = await axios.post(
          "https://localhost:5001/api/products",
          form
        );

        setProducts((prev) => [...prev, res.data]);
      }

      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lưu sản phẩm thất bại");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;

    try {
      await axios.delete(
        `https://localhost:5001/api/products/${id}`
      );

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  // pagination
  const totalPages = Math.ceil(filtered.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = filtered.slice(
    startIndex,
    startIndex + pageSize
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="product-management-page">
      <h2>Product Management</h2>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={fetchProducts}>Reload</button>

        <button onClick={openCreate}>+ Add Product</button>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.name}</td>
                    <td>
                      {p.price?.toLocaleString()} đ
                    </td>

                    <td>
                      <button
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(p.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No products found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">
            <button onClick={() => changePage(currentPage - 1)}>
              Prev
            </button>

            <span>
              Page {currentPage} / {totalPages || 1}
            </span>

            <button onClick={() => changePage(currentPage + 1)}>
              Next
            </button>
          </div>
        </>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {editingProduct ? "Edit Product" : "Add Product"}
            </h3>

            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="image"
              placeholder="Image URL"
              value={form.image}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <button onClick={saveProduct}>
              Save
            </button>

            <button onClick={() => setIsOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagementPage;