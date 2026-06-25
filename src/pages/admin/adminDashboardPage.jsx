import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaDollarSign,
} from "react-icons/fa";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const AdminDashboardPage = () => {
  // TODO: Call API sau

  const totalUsers = 0;
  const totalProducts = 0;
  const totalOrders = 0;
  const totalRevenue = 0;

  const ordersByMonth = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ],
    datasets: [
      {
        label: "Orders",
        data: [],
        borderColor: "#8B5E3C",
        backgroundColor: "#8B5E3C33",
        tension: 0.4,
      },
    ],
  };

  const categoryRatio = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#8B5E3C",
          "#C19A6B",
          "#D8C3A5",
          "#A67B5B",
        ],
      },
    ],
  };

  const orderStatus = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#4CAF50",
          "#FFC107",
          "#2196F3",
          "#F44336",
        ],
      },
    ],
  };

  const productSales = {
    labels: [],
    datasets: [
      {
        label: "Products Sold",
        data: [],
        backgroundColor: "#8B5E3C",
        borderRadius: 8,
      },
    ],
  };

  return (
    <>
      {/* Overview */}

      <div className="mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">

            <FaUsers className="text-4xl text-[#8B5E3C] mb-3" />

            <div className="text-3xl font-bold">
              {totalUsers}
            </div>

            <div className="text-gray-500">
              Total Users
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">

            <FaBoxOpen className="text-4xl text-[#C19A6B] mb-3" />

            <div className="text-3xl font-bold">
              {totalProducts}
            </div>

            <div className="text-gray-500">
              Total Products
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">

            <FaShoppingCart className="text-4xl text-[#A67B5B] mb-3" />

            <div className="text-3xl font-bold">
              {totalOrders}
            </div>

            <div className="text-gray-500">
              Total Orders
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">

            <FaDollarSign className="text-4xl text-green-600 mb-3" />

            <div className="text-3xl font-bold">
              ${totalRevenue}
            </div>

            <div className="text-gray-500">
              Revenue
            </div>

          </div>

        </div>

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl shadow p-5 lg:col-span-2 h-[330px]">

          <h2 className="font-bold text-xl mb-3">
            Orders by Month
          </h2>

          <div className="h-[250px]">

            <Line
              data={ordersByMonth}
              options={chartOptions}
            />

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-5 h-[330px]">

          <h2 className="font-bold text-xl mb-3">
            Product Categories
          </h2>

          <div className="h-[250px] flex items-center justify-center">

            <Doughnut data={categoryRatio} />

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-5 h-[330px]">

          <h2 className="font-bold text-xl mb-3">
            Order Status
          </h2>

          <div className="h-[250px] flex items-center justify-center">

            <Doughnut data={orderStatus} />

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-5 lg:col-span-2 h-[330px]">

          <h2 className="font-bold text-xl mb-3">
            Product Sales
          </h2>

          <div className="h-[250px]">

            <Bar
              data={productSales}
              options={chartOptions}
            />

          </div>

        </div>

      </div>
    </>
  );
};

export default AdminDashboardPage;