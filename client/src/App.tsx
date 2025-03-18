import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Assets, Upload } from "./pages";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: Infinity,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="nav">
          <Link className="page-link" to="/assets">
            Assets
          </Link>
          <Link className="page-link" to="/upload">
            Upload Assets
          </Link>
        </div>
        <Routes>
          <Route path="/assets" element={<Assets />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};
