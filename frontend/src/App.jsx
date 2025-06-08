import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import { FinanceProvider } from "@/data/FinanceContext";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./pages/Sidebar";
import TransactionForm from "./data/TransactionForm";
import TransactionsTable from "./data/TransactionsTable";
import SavingsPlanning from "./pages/SavingsPlanning";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./pages/AdminDashboard";
import UserSettings from "./pages/UserSettings";
import AdminSidebar from "./pages/AdminSidebar";
import Recommendations from "./pages/Recommendations";
function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Check if the user is logged in (e.g., by checking for an auth token)
  const isLoggedIn = !!localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  return (
    <FinanceProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        {isLoggedIn && (
          role === "admin"
            ? <AdminSidebar onNavigate={(path) => navigate(path)} />
            : <Sidebar onNavigate={(path) => navigate(path)} />
        )}

        {/* Main Content */}
        <div className={`flex-1 overflow-auto ${isLoggedIn ? "" : "w-full"}`}>
          {!(pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/forgot-password" || pathname === "/reset-password") && !isLoggedIn && (
            <div className="  flex justify-center items-center   bg-purple-800">
              <Navbar routes={routes.filter((route) => route.path !== "/register" && route.path !== "/verify-2fa")} />
            </div>
          )}
          <Routes>
            {routes.map(
              ({ path, element }, key) =>
                element && <Route key={key} exact path={path} element={element} />
            )}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-transaction" element={<TransactionForm />} />
            <Route path="/budget-tracking" element={<TransactionsTable />} />
            <Route path="/savings-planning" element={<SavingsPlanning />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/Admindashboard" element={role === "admin" ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
            <Route path="Usersettings" element={<UserSettings />} />
            <Route path="Recommendations" element={<Recommendations />} />
          
            {/* Default redirection to a valid route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
      {/* Add ToastContainer */}
      <ToastContainer />
    </FinanceProvider>
  );
}

export default App;
