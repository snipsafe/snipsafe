import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EyeIcon, ShareIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ShareModal from '../components/ShareModal';
import CurrentViewers from '../components/CurrentViewers';

const ViewSnippet = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchSnippet = useCallback(async () => {
    try {
      // This would need to be implemented in the backend
      const response = await axios.get(`/api/snippets/${id}`);
      setSnippet(response.data);
    } catch (error) {
      toast.error('Snippet not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSnippet();
  }, [fetchSnippet]);

  const deleteSnippet = async () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await axios.delete(`/api/snippets/${id}`);
        toast.success('Snippet deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete snippet');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Snippet not found</p>
      </div>
    );
  }

  const isAuthor = snippet?.author?._id === user?.id || 
                   snippet?.author?._id === user?.userId ||
                   snippet?.author?.username === user?.username;

  return (
    <div className="w-full">
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-8">
              <h1 className="text-3xl font-bold text-slate-100 mb-3">{snippet.title}</h1>
              {snippet.description && (
                <p className="text-slate-300 text-lg mb-4">{snippet.description}</p>
              )}
              <div className="flex items-center flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <span>By {snippet.author?.username}</span>
                <span>•</span>
                <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{snippet.views} views</span>
                </div>
                <span>•</span>
                <span className="bg-slate-700 px-3 py-1 rounded text-slate-300">
                  {snippet.language}
                </span>
              </div>

              {/* Current Viewers */}
              <div className="mb-4">
                <CurrentViewers snippetId={snippet._id} />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Always show Edit button for testing - remove this condition temporarily */}
              <Link
                to={`/snippet/${id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-200 rounded-lg transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              
              {isAuthor && (
                <button
                  onClick={deleteSnippet}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {snippet.tags && snippet.tags.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={snippet.language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '15px',
              lineHeight: '1.6',
              backgroundColor: '#0f172a',
              padding: '2rem'
            }}
            showLineNumbers
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              fontSize: '14px'
            }}
          >
            {snippet.content}
          </SyntaxHighlighter>
        </div>
      </div>

      {snippet && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          snippet={snippet}
        />
      )}
    </div>
  );
};

export default ViewSnippet;
