import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, ShareIcon, HeartIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCounter from '../components/AnimatedCounter';

const Dashboard = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [stats, setStats] = useState({ languages: [], tags: [] });
  const [searchResults, setSearchResults] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const fetchSnippets = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint;
      switch(activeTab) {
        case 'my':
          endpoint = '/api/snippets/my';
          break;
        case 'org':
          endpoint = '/api/snippets/org';
          break;
        case 'shared':
          endpoint = '/api/snippets/shared-with-me';
          break;
        default:
          endpoint = '/api/snippets/my';
      }
      
      const response = await axios.get(endpoint);
      setSnippets(response.data.snippets || response.data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleSearch = useCallback(async (searchTerm, filters) => {
    if (!searchTerm && filters.language === 'all' && !filters.tags && !filters.author) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm && searchTerm.trim()) {
        params.append('q', searchTerm.trim());
      }
      if (filters.language && filters.language !== 'all') {
        params.append('language', filters.language);
      }
      if (filters.tags && filters.tags.trim()) {
        params.append('tags', filters.tags.trim());
      }
      if (filters.author && filters.author.trim()) {
        params.append('author', filters.author.trim());
      }

      console.log('Search params:', params.toString()); // Debug log
      
      const response = await axios.get(`/api/snippets/search?${params.toString()}`);
      setSearchResults(response.data.snippets || []);
      
      toast.success(`Found ${response.data.snippets?.length || 0} snippets`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.error || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/snippets/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set empty stats as fallback
      setStats({ languages: [], tags: [] });
    }
  }, []);

  const toggleFavorite = (snippetId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(snippetId)) {
      newFavorites.delete(snippetId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(snippetId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  useEffect(() => {
    fetchSnippets();
    fetchStats();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, [fetchSnippets, fetchStats]);

  const displaySnippets = searchResults || snippets;
  const recentLanguages = stats.languages.slice(0, 5).map(l => l._id);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyShareLink = async (shareId, title) => {
    const url = `${window.location.origin}/share/${shareId}`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(`Share link for "${title}" copied to clipboard!`);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success(`Share link copied to clipboard!`);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      
      // Show the URL in a prompt as fallback
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
        // For mobile devices, show in a modal or alert
        toast.error('Copy failed. Link: ' + url, { duration: 8000 });
      } else {
        // For desktop, try the fallback method
        try {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            toast.success(`Share link copied to clipboard!`);
          } else {
            toast.error(`Copy failed. Link: ${url}`, { duration: 8000 });
          }
        } catch (fallbackError) {
          toast.error(`Copy failed. Link: ${url}`, { duration: 8000 });
        }
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Enhanced Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl"></div>
        <div className="glass rounded-xl p-6 relative">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-slate-400 flex items-center space-x-2">
                <span className="text-sm">📊</span>
                <AnimatedCounter 
                  end={stats.languages.reduce((total, lang) => total + lang.count, 0)} 
                  suffix=" snippets"
                />
                <span>in your organization</span>
              </p>
            </div>
            <Link
              to="/create"
              className="btn-modern gradient-primary text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Snippet</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="glass rounded-xl p-4">
        <QuickActions recentLanguages={recentLanguages} />
      </div>

      {/* Enhanced Search Bar */}
      <div className="glass rounded-xl p-4 search-glow">
        <SearchBar 
          onSearch={handleSearch}
          languages={stats.languages}
          tags={stats.tags}
        />
      </div>

      {/* Enhanced Tabs */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="border-b border-slate-700/50 bg-slate-800/30">
          <nav className="flex space-x-6 px-4">
            {[
              { key: 'my', label: 'My Snippets', icon: '👤', count: snippets.filter(s => s.author?.username === user?.username).length },
              { key: 'org', label: 'Organization', icon: '🏢' },
              { key: 'shared', label: 'Shared with Me', icon: '📤' },
              ...(favorites.size > 0 ? [{ key: 'favorites', label: 'Favorites', icon: '❤️', count: favorites.size }] : [])
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchResults(null);
                }}
                className={`relative py-3 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                    <AnimatedCounter end={tab.count} />
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {/* Results Header with animation */}
          {searchResults && (
            <div className="mb-4 p-3 glass rounded-lg border border-indigo-500/20 slide-in">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 flex items-center space-x-2 text-sm">
                  <span>🔍</span>
                  <span>Found <AnimatedCounter end={searchResults.length} /> snippets</span>
                </p>
                <button
                  onClick={() => setSearchResults(null)}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Snippets Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Loading your snippets..." />
            </div>
          ) : displaySnippets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-slate-400 text-lg mb-4">
                {searchResults ? 'No snippets found for your search' : 'No snippets found'}
              </p>
              {activeTab === 'my' && !searchResults && (
                <Link
                  to="/create"
                  className="inline-block btn-modern gradient-accent text-white px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Create your first snippet
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {displaySnippets
                .filter(snippet => {
                  if (activeTab === 'favorites') return favorites.has(snippet._id);
                  if (activeTab === 'my') return snippet.author?.username === user?.username;
                  return true;
                })
                .map((snippet, index) => (
                <Link
                  key={snippet._id}
                  to={`/snippet/${snippet._id}`}
                  className="glass rounded-lg p-4 card-hover border border-slate-700/50 cursor-pointer block"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-slate-100 truncate flex-1 mr-2 group-hover:text-indigo-300 transition-colors">
                      {snippet.title}
                    </h3>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs status-badge gradient-primary text-white px-2 py-1 rounded">
                        {snippet.language}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(snippet._id);
                        }}
                        className={`p-1 rounded transition-all duration-200 ${
                          favorites.has(snippet._id)
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <HeartIcon 
                          className="w-4 h-4" 
                          fill={favorites.has(snippet._id) ? 'currentColor' : 'none'} 
                        />
                      </button>
                    </div>
                  </div>

                  {snippet.description && (
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2 opacity-80">
                      {snippet.description}
                    </p>
                  )}

                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {snippet.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/30 hover:bg-indigo-900/70 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                      {snippet.tags.length > 3 && (
                        <span className="text-xs text-slate-400 px-2 py-0.5">
                          +{snippet.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                        {snippet.author?.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs">{snippet.author?.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span className="text-xs">{formatDate(snippet.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3" />
                        <AnimatedCounter end={snippet.views} />
                      </div>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          copyShareLink(snippet.shareId, snippet.title);
                        }}
                        className="tooltip p-1.5 text-slate-400 hover:text-indigo-400 rounded transition-all duration-200"
                        data-tooltip="Copy share link"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      
                      <span className="text-xs text-slate-500 font-medium">
                        Click to view →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
