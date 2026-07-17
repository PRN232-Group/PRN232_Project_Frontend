import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService, cartService } from "../../application/services";
import { addLocalCartItem } from "../../utils/cartLocal";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { isProductInStock } from "../../domain/roles";
import UserContext from "../../contexts/UserContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      const p = res.data || {};
      setProduct({ ...p, image: p.image || p.imageUrl });
      setQuantity(1);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const inStock = isProductInStock(product);

  const addToCart = async () => {
    if (!product) return;
    if (!inStock) {
      notifyError(`«${product.name}» đã hết hàng`);
      return;
    }
    if (!user) {
      notifyError("Vui lòng đăng nhập để thêm vào giỏ (kiểm tra tồn kho)");
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    setAdding(true);
    try {
      await cartService.add({ productId: product.id, quantity });
      addLocalCartItem(product, quantity);
      notifySuccess(`Đã thêm ${quantity} × «${product.name}» vào giỏ`);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Không thêm được vào giỏ";
      notifyError(msg);
      if (/hết hàng|không đủ|chỉ còn/i.test(msg)) {
        await fetchProduct();
        setQuantity(1);
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-detail-page page">
      {loading && <p>Đang tải sản phẩm...</p>}
      {!loading && !product && <p className="error">Không tìm thấy sản phẩm</p>}

      {!loading && product && (
        <div className="product-container">
          <div className="product-image">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=60";
              }}
            />
            {!inStock && (
              <span className="stock-badge is-out detail">Hết hàng</span>
            )}
          </div>
          <div className="product-info">
            <h2>{product.name}</h2>
            <p className="price">
              {Number(product.price || 0).toLocaleString("vi-VN")} ₫
              {product.marketPrice > product.price && (
                <span className="price-market">
                  {Number(product.marketPrice).toLocaleString("vi-VN")} ₫
                </span>
              )}
            </p>
            {product.marketPrice > product.price && (
              <p className="price-save">
                Rẻ hơn ~{" "}
                {Number(product.marketPrice - product.price).toLocaleString(
                  "vi-VN"
                )}{" "}
                ₫ so với giá thị trường
              </p>
            )}
            <p className="stock-status">
              {inStock ? (
                <span className="stock-pill is-ok">
                  Còn {Number(product.stock)} sản phẩm
                </span>
              ) : (
                <span className="stock-pill is-out">Hết hàng</span>
              )}
            </p>
            <p className="description">{product.description}</p>
            <p className="quote-hint">
              Mua lẻ: thêm vào giỏ. Cần báo giá theo gói? Thêm SP vào{" "}
              <a href="/cart">giỏ hàng</a> rồi gửi yêu cầu báo giá tại đó.
            </p>

            {product.specs && (
              <div className="product-specs">
                <h3>Thông số kỹ thuật</h3>
                <table>
                  <tbody>
                    {product.specs.dimensions && (
                      <tr>
                        <th>Kích thước</th>
                        <td>{product.specs.dimensions}</td>
                      </tr>
                    )}
                    {product.specs.material && (
                      <tr>
                        <th>Vật liệu</th>
                        <td>{product.specs.material}</td>
                      </tr>
                    )}
                    {product.specs.origin && (
                      <tr>
                        <th>Xuất xứ</th>
                        <td>{product.specs.origin}</td>
                      </tr>
                    )}
                    {product.specs.finish && (
                      <tr>
                        <th>Hoàn thiện</th>
                        <td>{product.specs.finish}</td>
                      </tr>
                    )}
                    {product.specs.weightKg != null && (
                      <tr>
                        <th>Trọng lượng</th>
                        <td>{product.specs.weightKg} kg</td>
                      </tr>
                    )}
                    {product.specs.warrantyMonths != null && (
                      <tr>
                        <th>Bảo hành</th>
                        <td>{product.specs.warrantyMonths} tháng</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="product-actions">
              <div className="qty-control">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(Number(product.stock) || 1, q + 1)
                    )
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="checkout-btn"
                disabled={!inStock || adding}
                onClick={addToCart}
              >
                {!inStock ? "Hết hàng" : adding ? "Đang thêm…" : "Thêm vào giỏ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
