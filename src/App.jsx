import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import ScrollToTop from "./components/common/ScrollToTop"
import AppLayout from "./layouts/AppLayout"
import AdminLayout from "./layouts/AdminLayout"
import HomePage from "./components/Home/HomePage"
import ProductPage from "./components/Products/ProductPage"
import ProductDetails from "./components/Products/ProductDetails"
import Cart from "./pages/Cart"
import Wishlist from "./pages/Wishlist"
import Checkout from "./pages/Checkout"
import About from "./pages/About"
import Login from "./components/Login"
import Signup from "./components/Signup"
import { AdminRoute, SalespersonRoute, LogisticsRoute } from "./components/PrivateRoutes"
import AdminAnalytics from "./components/Dashboard/AdminAnalytics"
import ManageOrders from "./components/Dashboard/ManageOrders"
import ManageProducts from "./components/Dashboard/ManageProducts"
import ManageCategories from "./components/Dashboard/ManageCategories"
import ManageCoupons from "./components/Dashboard/ManageCoupons"
import ManageStaff from "./components/Dashboard/ManageStaff"
import SalespersonDashboard from "./pages/SalespersonDashboard"
import LogisticsDashboard from "./pages/LogisticsDashboard"
import UserAccount from "./pages/UserAccount"
import { syncUserWishlistWithDB } from "./utils/cartStore"

export default function App() {
  useEffect(() => {
    syncUserWishlistWithDB()
  }, [])

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Store Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ProductPage />} />
          <Route path="sale" element={<ProductPage isSalePage={true} />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="account" element={<UserAccount />} />
          <Route path="orders" element={<UserAccount />} />
          <Route path="track" element={<UserAccount />} />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup initialMode="signup" />} />

        {/* Protected Dashboard with Role-Based Access */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/analytics" replace />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="coupons" element={<ManageCoupons />} />
          <Route path="team" element={<ManageStaff />} />
        </Route>

        {/* Dedicated Salesperson Invoicing & Billing Portal */}
        <Route
          path="/salesperson"
          element={
            <SalespersonRoute>
              <SalespersonDashboard />
            </SalespersonRoute>
          }
        />

        {/* Dedicated Logistics & Courier Dispatch Portal */}
        <Route
          path="/logistics"
          element={
            <LogisticsRoute>
              <LogisticsDashboard />
            </LogisticsRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
