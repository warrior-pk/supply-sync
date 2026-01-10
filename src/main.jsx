import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { BrowserRouter, Routes, Route } from "react-router"
import AdminLayout from "./components/layouts/AdminLayout"
import VendorLayout from "./components/layouts/VendorLayout"
import RootLayout from "./components/layouts/RootLayout"
import LandingPage from "./pages/LandingPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import VendorListingPage from "./pages/VendorListingPage"
import VendorDetailsPage from "./pages/VendorDetailsPage"
import InventoryPage from "./pages/InventoryPage"
import PurchaseOrderPage from "./pages/PurchaseOrderPage"
import NotFoundPage from "./pages/NotFoundPage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import { Toaster } from "./components/ui/sonner"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={ <AdminDashboardPage /> } />
            <Route path="manage/vendors" element={<VendorListingPage />} />
            <Route path="manage/vendors/:vendorId" element={<VendorDetailsPage />} />
            <Route path="manage/inventory" element={<InventoryPage />} />
            <Route path="purchase-orders" element={<PurchaseOrderPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<div>Welcome to Vendor Dashboard</div>} />
            <Route path="purchase-orders" element={<div>Vendor Orders Page</div>} />
            <Route path="purchase-orders/:id" element={<div>Vendor Order Details Page</div>} />
            <Route path="profile" element={<div>Vendor Profile Page</div>} />
            {/* Other invalid vendor routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Other root routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
