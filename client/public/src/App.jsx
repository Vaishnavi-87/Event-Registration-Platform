import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        {/* Admin login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;