import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Interview */}
        <Route
          path="/interview"
          element={<Interview />}
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* History */}
        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/history/:interviewId"
          element={<History />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;