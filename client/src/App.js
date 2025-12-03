import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSnippet from './pages/CreateSnippet';
import ViewSnippet from './pages/ViewSnippet';
import SharedSnippet from './pages/SharedSnippet';
import EditSnippet from './pages/EditSnippet';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="px-6 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <CreateSnippet /> : <Navigate to="/login" />} />
          <Route path="/snippet/:id" element={user ? <ViewSnippet /> : <Navigate to="/login" />} />
          <Route path="/snippet/:id/edit" element={user ? <EditSnippet /> : <Navigate to="/login" />} />
          <Route path="/share/:shareId" element={<SharedSnippet />} />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
