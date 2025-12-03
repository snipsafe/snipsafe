import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CheckIcon, XMarkIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const EditSnippet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    language: 'javascript',
    description: '',
    tags: '',
    visibility: 'private'
  });

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 
    'rust', 'swift', 'kotlin', 'typescript', 'jsx', 'tsx', 'html', 'css', 'scss',
    'json', 'xml', 'yaml', 'sql', 'bash', 'shell', 'powershell', 'markdown', 'plaintext'
  ];

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const response = await axios.get(`/api/snippets/${id}`);
      const snippetData = response.data;
      
      setSnippet(snippetData);
      setFormData({
        title: snippetData.title || '',
        content: snippetData.content || '',
        language: snippetData.language || 'javascript',
        description: snippetData.description || '',
        tags: snippetData.tags ? snippetData.tags.join(', ') : '',
        visibility: snippetData.visibility || 'private'
      });
    } catch (error) {
      console.error('Error fetching snippet:', error);
      toast.error('Failed to load snippet');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updateData = {
        ...formData,
        tags: tagsArray
      };

      await axios.put(`/api/snippets/${id}`, updateData);
      toast.success('Snippet updated successfully!');
      navigate(`/snippet/${id}`);
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast.error(error.response?.data?.error || 'Failed to update snippet');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/snippet/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading snippet..." />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">Snippet not found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-100">Edit Snippet</h1>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {previewMode ? <CodeBracketIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter snippet title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of your snippet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="react, javascript, api (comma-separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="private">Private</option>
                <option value="organization">Organization</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Code *
              </label>
              <span className="text-xs text-slate-400">
                {formData.content.length} characters, {formData.content.split('\n').length} lines
              </span>
            </div>
            
            {previewMode ? (
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={formData.language}
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                  showLineNumbers
                >
                  {formData.content || '// Your code will appear here...'}
                </SyntaxHighlighter>
              </div>
            ) : (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={20}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="Paste or type your code here..."
                required
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors flex items-center space-x-2"
            >
              <XMarkIcon className="w-5 h-5" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <CheckIcon className="w-5 h-5" />
              <span>{saving ? 'Updating...' : 'Update Snippet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSnippet;
