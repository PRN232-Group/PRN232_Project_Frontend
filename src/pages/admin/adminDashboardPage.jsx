import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  analyticsService,
  categoryService,
  orderService,
  productService,
  userService,
} from "../../application/services";
import { formatVnd } from "../../domain/roles";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const clay = "#b0784f";
const clayDark = "#8a5b34";
const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#4a423b", font: { family: "Poppins" } } } },
};

const AdminDashboardPage = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ordersByMonth, setOrdersByMonth] = useState({
    labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"],
    datasets: [
      {
        label: "Đơn hàng",
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: clay,
        backgroundColor: "rgba(176,120,79,0.2)",
        tension: 0.4,
      },
    ],
  });
  const [categoryRatio, setCategoryRatio] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [clay, clayDark, "#ddc0a1", "#c49a6c", "#5f7d55", "#efe9e1"],
      },
    ],
  });
  const [orderStatus, setOrderStatus] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: ["#d19a3f", clay, "#5f7d55", "#c8493c"] }],
  });
  const [productSales, setProductSales] = useState({
    labels: [],
    datasets: [
      {
        label: "Đã bán",
        data: [],
        backgroundColor: clay,
        borderRadius: 8,
      },
    ],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, users, products, orders, categories, best] =
          await Promise.all([
            analyticsService.getManagerDashboard(),
            userService.getAll(),
            productService.getAll(),
            orderService.getAll(),
            categoryService.getAll(),
            analyticsService.getBestSelling(),
          ]);
        const d = dash.data || {};
        const userList = users.data || [];
        const productList = products.data || [];
        const orderList = orders.data || [];
        const catList = categories.data || [];
        const bestList = best.data || [];

        setTotalUsers(d.totalUsers ?? userList.length);
        setTotalProducts(d.totalProducts ?? productList.length);
        setTotalOrders(d.totalOrders ?? orderList.length);
        setTotalRevenue(
          d.totalRevenue ??
            orderList.reduce((s, o) => s + (o.totalPrice || 0), 0)
        );

        const monthCounts = Array(7).fill(0);
        orderList.forEach((o) => {
          const m = new Date(o.createdAt).getMonth();
          if (m >= 0 && m < 7) monthCounts[m] += 1;
        });
        setOrdersByMonth((prev) => ({
          ...prev,
          datasets: [{ ...prev.datasets[0], data: monthCounts }],
        }));

        setCategoryRatio({
          labels: catList.map((c) => c.name),
          datasets: [
            {
              data: catList.map(
                (c) => productList.filter((p) => p.categoryId === c.id).length
              ),
              backgroundColor: [
                clay,
                clayDark,
                "#ddc0a1",
                "#c49a6c",
                "#5f7d55",
                "#efe9e1",
              ],
            },
          ],
        });

        const statusMap = {};
        orderList.forEach((o) => {
          statusMap[o.status] = (statusMap[o.status] || 0) + 1;
        });
        setOrderStatus({
          labels: Object.keys(statusMap),
          datasets: [
            {
              data: Object.values(statusMap),
              backgroundColor: ["#d19a3f", clay, "#5f7d55", "#c8493c"],
            },
          ],
        });

        setProductSales({
          labels: bestList.map((p) => p.name),
          datasets: [
            {
              label: "Đã bán",
              data: bestList.map((p) => p.soldQuantity || p.sold || 0),
              backgroundColor: clay,
              borderRadius: 8,
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="staff-page">
      <h2>Tổng quan Admin</h2>
      <p className="staff-page-sub">
        Người dùng, catalog và đơn hàng — cùng palette Interior Studio.
      </p>

      <div className="staff-kpi-grid">
        <div className="staff-kpi">
          <span>Người dùng</span>
          <strong>{totalUsers}</strong>
        </div>
        <div className="staff-kpi">
          <span>Sản phẩm</span>
          <strong>{totalProducts}</strong>
        </div>
        <div className="staff-kpi">
          <span>Đơn hàng</span>
          <strong>{totalOrders}</strong>
        </div>
        <div className="staff-kpi">
          <span>Doanh thu</span>
          <strong className="is-clay">{formatVnd(totalRevenue)}</strong>
        </div>
      </div>

      <div className="staff-split" style={{ marginBottom: 16 }}>
        <div className="staff-chart-card">
          <h3>Đơn theo tháng</h3>
          <div className="chart-wrap">
            <Line data={ordersByMonth} options={chartOpts} />
          </div>
        </div>
        <div className="staff-chart-card">
          <h3>Tỷ lệ danh mục</h3>
          <div className="chart-wrap">
            <Doughnut data={categoryRatio} options={chartOpts} />
          </div>
        </div>
      </div>
      <div className="staff-split">
        <div className="staff-chart-card">
          <h3>Trạng thái đơn</h3>
          <div className="chart-wrap">
            <Doughnut data={orderStatus} options={chartOpts} />
          </div>
        </div>
        <div className="staff-chart-card">
          <h3>Bán chạy</h3>
          <div className="chart-wrap">
            <Bar data={productSales} options={chartOpts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
