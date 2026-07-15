import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productService, cartService } from "../../application/services";
import { addLocalCartItem } from "../../utils/cartLocal";
import { notifySuccess } from "../../application/services/notify";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      const p = res.data || {};
      setProduct({ ...p, image: p.image || p.imageUrl });
    } catch (err) {
      console.error(err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;
    addLocalCartItem(product, quantity);
    cartService
      .add({ productId: product.id, quantity })
      .catch(() => {});
    notifySuccess(`Đã thêm ${quantity} × "${product.name}" vào giỏ`);
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
            <p className="description">{product.description}</p>

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
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </div>
              <button type="button" className="checkout-btn" onClick={addToCart}>
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
