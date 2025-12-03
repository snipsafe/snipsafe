import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EyeIcon } from '@heroicons/react/24/outline';
import CurrentViewers from '../components/CurrentViewers';

const SharedSnippet = () => {
  const { shareId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSnippet = useCallback(async () => {
    try {
      const response = await axios.get(`/api/snippets/share/${shareId}`);
      setSnippet(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view this snippet.');
      } else if (error.response?.status === 404) {
        setError('Snippet not found.');
      } else {
        setError('Failed to load snippet.');
      }
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchSnippet();
  }, [fetchSnippet]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
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

  return (
    <div className="w-full">
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700">
        <div className="p-8 border-b border-slate-700">
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

            <div className="text-right">
              <div className="text-xs text-slate-500 mb-2">Shared via SnipSafe</div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                snippet.visibility === 'public' ? 'bg-green-900 text-green-300' :
                snippet.visibility === 'organization' ? 'bg-blue-900 text-blue-300' :
                'bg-slate-700 text-slate-300'
              }`}>
                {snippet.visibility}
              </span>
            </div>
          </div>

          {snippet.tags && snippet.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
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
            style={tomorrow}
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
    </div>
  );
};

export default SharedSnippet;
