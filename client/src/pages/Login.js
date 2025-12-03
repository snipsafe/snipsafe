import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, authConfig, loginWithAzure } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let success = false;
    if (authConfig.authMode === 'local') {
      success = await login(formData.email, formData.password);
    } else if (authConfig.authMode === 'azure_ad') {
      success = await loginWithAzure(formData.email, formData.password);
    }
    
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  if (!authConfig) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            Sign in to SnipSafe
          </h2>
          {authConfig.authMode === 'azure_ad' && (
            <p className="mt-2 text-center text-sm text-slate-400">
              Use your organization Microsoft account
            </p>
          )}
          {authConfig.authMode === 'local' && authConfig.allowRegistration && (
            <p className="mt-2 text-center text-sm text-slate-400">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                create a new account
              </Link>
            </p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                {authConfig.authMode === 'azure_ad' ? 'Microsoft Email' : 'Email address'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-slate-100 bg-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={authConfig.authMode === 'azure_ad' ? 'user@company.com' : 'Enter your email'}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-slate-100 bg-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 
                authConfig.authMode === 'azure_ad' ? 'Sign in with Microsoft' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
