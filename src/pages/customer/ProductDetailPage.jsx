import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../styles/customer/productDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const demoCatalog = {
    1: {
      id: 1,
      name: "Modern Sofa",
      price: 5000000,
      category: "Sofa",
      description:
        "Sofa vải cao cấp với khung gỗ tự nhiên, đệm mút hồi phục chậm, mang lại sự thoải mái và vẻ đẹp tinh tế cho phòng khách của bạn.",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
    },
    2: {
      id: 2,
      name: "Wood Table",
      price: 2000000,
      category: "Table",
      description:
        "Bàn gỗ sồi nguyên khối, hoàn thiện dầu tự nhiên, bền bỉ theo thời gian và phù hợp với mọi phong cách nội thất.",
      image:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80",
    },
    3: {
      id: 3,
      name: "Office Chair",
      price: 1500000,
      category: "Chair",
      description:
        "Ghế làm việc công thái học, tựa lưng nâng đỡ cột sống và chất liệu lưới thoáng khí cho những giờ làm việc dài.",
      image:
        "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=80",
    },
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `https://localhost:5001/api/products/${id}`
      );

      setProduct(res.data);
    } catch (err) {
      console.error(err);
      const fallback = demoCatalog[id] || demoCatalog[1];
      setProduct(fallback);
    } finally {
      setLoading(false);
    }
  };

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () =>
    setQuantity((q) => (q > 1 ? q - 1 : 1));

  const addToCart = async () => {
    try {
      await axios.post("https://localhost:5001/api/cart", {
        productId: product.id,
        quantity,
      });

      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      alert("Thêm vào giỏ hàng thất bại");
    }
  };

  return (
    <div className="product-detail-page">
      {loading && <p>Loading product...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && product && (
        <div className="product-container">
          {/* IMAGE */}
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>

          {/* INFO */}
          <div className="product-info">
            <h2>{product.name}</h2>

            <p className="price">
              {product.price?.toLocaleString()} đ
            </p>

            <p className="description">
              {product.description}
            </p>

            {/* QUANTITY */}
            <div className="quantity">
              <button onClick={decreaseQty}>-</button>
              <span>{quantity}</span>
              <button onClick={increaseQty}>+</button>
            </div>

            {/* ADD TO CART */}
            <button className="add-to-cart" onClick={addToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* RELATED PRODUCTS (demo) */}
      <div className="related">
        <h3>Related Products</h3>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;
