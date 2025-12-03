import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CreateSnippet = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    language: 'javascript',
    visibility: 'private',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();

  const languages = [
    'javascript', 'python', 'java', 'typescript', 'go', 'rust', 'c', 'cpp',
    'csharp', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash', 'plaintext'
  ];

  // Add keyboard shortcut handler
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    // Handle paste from clipboard
    const urlParams = new URLSearchParams(window.location.search);
    const pastedContent = localStorage.getItem('pastedContent');
    const templateContent = localStorage.getItem('templateContent');

    if (urlParams.get('paste') === 'true' && pastedContent) {
      const detectedLanguage = detectLanguage(pastedContent);
      setFormData(prev => ({
        ...prev,
        content: pastedContent,
        language: detectedLanguage,
        title: generateTitle(pastedContent, detectedLanguage)
      }));
      localStorage.removeItem('pastedContent');
      toast.success('Content pasted from clipboard!');
    } else if (urlParams.get('template') === 'true' && templateContent) {
      const template = JSON.parse(templateContent);
      setFormData(prev => ({
        ...prev,
        content: template.template,
        language: template.language,
        title: template.name
      }));
      localStorage.removeItem('templateContent');
      toast.success(`Template "${template.name}" loaded!`);
    }

    // Add keyboard shortcut for save
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.target.tagName === 'TEXTAREA') {
        e.preventDefault();
        handleSubmit(e);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && e.target.tagName === 'TEXTAREA') {
        // Let the browser handle normal paste
        setTimeout(() => {
          if (e.target.value && !formData.title) {
            const detectedLanguage = detectLanguage(e.target.value);
            const generatedTitle = generateTitle(e.target.value, detectedLanguage);
            setFormData(prev => ({
              ...prev,
              language: detectedLanguage,
              title: generatedTitle
            }));
          }
        }, 100);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [formData.title]); // Keep the dependency as is

  const detectLanguage = (content) => {
    const patterns = {
      'jsx': /import React|export default|className=|<\/\w+>/,
      'javascript': /function\s+\w+|const\s+\w+\s*=|console\.log|\.js$/,
      'python': /def \w+|import \w+|print\(|class \w+|\.py$/,
      'java': /public class|import java|public static void main|\.java$/,
      'css': /\.\w+\s*{|#\w+\s*{|@media|\.css$/,
      'html': /<html|<head|<body|<!DOCTYPE|\.html$/,
      'json': /^\s*[{[]/,
      'sql': /SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE TABLE/i,
      'typescript': /interface \w+|type \w+|\.ts$|: string|: number/,
      'php': /<\?php|function \w+|class \w+|echo /,
      'bash': /^#!\/bin\/bash|echo |grep |awk /
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) return lang;
    }
    return 'plaintext';
  };

  const generateTitle = (content, language) => {
    if (!content || content.trim().length === 0) {
      return '';
    }

    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet`;

    // Extract meaningful patterns from different languages
    const firstLine = lines[0].trim();
    const allContent = content.toLowerCase();

    // JavaScript/TypeScript patterns
    if (language === 'javascript' || language === 'jsx' || language === 'typescript') {
      // Function declarations
      const funcMatch = firstLine.match(/(?:function|const|let|var|export function)\s+(\w+)/);
      if (funcMatch) return `${funcMatch[1]} function`;
      
      // Class declarations
      const classMatch = firstLine.match(/(?:class|export class)\s+(\w+)/);
      if (classMatch) return `${classMatch[1]} class`;
      
      // React components
      const reactMatch = firstLine.match(/import React|export default/);
      if (reactMatch) return 'React Component';
      
      // API endpoints
      if (allContent.includes('app.get') || allContent.includes('app.post')) return 'API Endpoint';
      if (allContent.includes('router.') || allContent.includes('express')) return 'Express Route';
    }

    // Python patterns
    if (language === 'python') {
      const defMatch = firstLine.match(/def\s+(\w+)/);
      if (defMatch) return `${defMatch[1]} function`;
      
      const classMatch = firstLine.match(/class\s+(\w+)/);
      if (classMatch) return `${classMatch[1]} class`;
      
      if (allContent.includes('flask') || allContent.includes('@app.route')) return 'Flask API';
      if (allContent.includes('django')) return 'Django Component';
      if (allContent.includes('pandas') || allContent.includes('numpy')) return 'Data Analysis Script';
    }

    // Java patterns
    if (language === 'java') {
      const classMatch = firstLine.match(/public class\s+(\w+)/);
      if (classMatch) return `${classMatch[1]} class`;
      
      const methodMatch = content.match(/public static void main/);
      if (methodMatch) return 'Main Application';
    }

    // SQL patterns
    if (language === 'sql') {
      if (allContent.includes('select')) return 'Database Query';
      if (allContent.includes('create table')) return 'Table Schema';
      if (allContent.includes('insert')) return 'Data Insert Script';
      if (allContent.includes('update')) return 'Data Update Script';
    }

    // CSS patterns
    if (language === 'css') {
      if (allContent.includes('@media')) return 'Responsive Styles';
      if (allContent.includes('animation') || allContent.includes('keyframes')) return 'CSS Animation';
      if (allContent.includes('grid') || allContent.includes('flexbox')) return 'Layout Styles';
      return 'CSS Styles';
    }

    // HTML patterns
    if (language === 'html') {
      if (allContent.includes('<form')) return 'HTML Form';
      if (allContent.includes('<nav')) return 'Navigation Component';
      if (allContent.includes('<table')) return 'HTML Table';
      return 'HTML Template';
    }

    // Bash/Shell patterns
    if (language === 'bash') {
      if (allContent.includes('docker')) return 'Docker Script';
      if (allContent.includes('git')) return 'Git Script';
      if (allContent.includes('npm') || allContent.includes('yarn')) return 'Build Script';
      return 'Shell Script';
    }

    // Generic patterns based on content keywords
    const keywords = {
      'config': 'Configuration',
      'test': 'Test Suite',
      'util': 'Utility Function',
      'helper': 'Helper Function',
      'component': 'Component',
      'service': 'Service',
      'model': 'Data Model',
      'controller': 'Controller',
      'middleware': 'Middleware',
      'schema': 'Schema Definition',
      'migration': 'Database Migration',
      'seed': 'Database Seed',
      'validation': 'Validation Logic',
      'authentication': 'Auth Logic',
      'authorization': 'Auth Logic'
    };

    for (const [keyword, title] of Object.entries(keywords)) {
      if (allContent.includes(keyword)) {
        return `${title}`;
      }
    }

    // Fallback: use first meaningful line or word
    const meaningfulWords = firstLine.replace(/[^\w\s]/g, '').split(/\s+/).filter(word => 
      word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word.toLowerCase())
    );

    if (meaningfulWords.length > 0) {
      return meaningfulWords.slice(0, 3).join(' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    return `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    // Auto-generate title when content changes and title is empty or auto-generated
    if (name === 'content' && value.trim()) {
      const detectedLanguage = detectLanguage(value);
      const autoTitle = generateTitle(value, detectedLanguage);
      
      // Only update title if it's empty or looks auto-generated
      const isAutoGeneratedTitle = !formData.title || 
        formData.title.endsWith(' snippet') || 
        formData.title.endsWith(' function') || 
        formData.title.endsWith(' class') ||
        formData.title === 'New snippet' ||
        formData.title.includes('Snippet') ||
        languages.some(lang => formData.title.includes(lang.charAt(0).toUpperCase() + lang.slice(1)));

      if (isAutoGeneratedTitle && autoTitle) {
        newFormData.title = autoTitle;
        newFormData.language = detectedLanguage;
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await axios.post('/api/snippets', payload);
      toast.success('Snippet created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Floating Create Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            loading || !formData.title.trim() || !formData.content.trim()
              ? 'bg-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          } text-white`}
          title="Create Snippet (Ctrl+S)"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          ) : (
            <CheckIcon className="w-8 h-8" />
          )}
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-100">Create New Snippet</h1>
            
            {/* Top Create Button */}
            <div className="flex items-center space-x-3">
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
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Snippet'}</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Compact form layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
                <span className="text-xs text-slate-400 font-normal ml-2">(auto-generated, editable)</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Start typing code to auto-generate title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
                <span className="text-xs text-slate-400 font-normal ml-2">(auto-detected)</span>
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of your snippet"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="react, javascript, api (comma-separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span>{formData.content.length} characters</span>
                <span>•</span>
                <span>{formData.content.split('\n').length} lines</span>
                <span>•</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Ctrl+S</kbd>
                <span>to save</span>
              </div>
            </div>
            
            {previewMode ? (
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={formData.language}
                  style={oneDark}
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
                onKeyDown={handleKeyDown}
                rows={20}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
                placeholder="Start typing your code... Title and language will be auto-generated!"
                required
              />
            )}
          </div>

          {/* Bottom action bar */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              💡 Tip: Use <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">Tab</kbd> for indentation, <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">Ctrl+S</kbd> to save
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Snippet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSnippet;
