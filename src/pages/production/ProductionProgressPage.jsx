import React, { useEffect, useState } from "react";
import { productionService } from "../../application/services";

const ProductionProgressPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      // TODO: đổi API backend
      const res = await productionService.getProgress();

      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching production progress:", error);

      // fallback demo data
      setOrders([
        {
          id: 1,
          customerName: "Nguyen Van A",
          status: "PREPARING",
        },
        {
          id: 2,
          customerName: "Tran Thi B",
          status: "SHIPPING",
        },
        {
          id: 3,
          customerName: "Le Van C",
          status: "PENDING",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const steps = ["PENDING", "PREPARING", "PACKING", "SHIPPING", "DELIVERED"];

  const getStepIndex = (status) => steps.indexOf(status);

  if (loading) {
    return <div className="progress-loading">Loading progress...</div>;
  }

  return (
    <div className="production-progress-page">
      <h2>Production Progress Tracking</h2>

      <div className="progress-list">
        {orders.map((order) => {
          const currentStep = getStepIndex(order.status);

          return (
            <div className="progress-card" key={order.id}>
              <div className="info">
                <h3>Order #{order.id}</h3>
                <p>{order.customerName}</p>
                <p>Status: {order.status}</p>
              </div>

              {/* PROGRESS BAR */}
              <div className="progress-bar">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={`step ${
                      index <= currentStep ? "active" : ""
                    }`}
                  >
                    <span className="dot" />
                    <span className="label">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionProgressPage;