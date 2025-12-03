import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  CodeBracketIcon, 
  ClipboardDocumentIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QuickActions = ({ recentLanguages = [] }) => {
  const quickTemplates = [
    { name: 'Python Function', language: 'python', template: 'def process_data(data):\n    """\n    Process input data and return result\n    \n    Args:\n        data: Input data to process\n        \n    Returns:\n        Processed result\n    """\n    try:\n        # Your logic here\n        result = data\n        return result\n    except Exception as e:\n        raise ValueError(f"Error processing data: {e}")' },
    { name: 'SQL Query', language: 'sql', template: 'SELECT \n    u.id,\n    u.username,\n    u.email,\n    COUNT(s.id) as snippet_count\nFROM users u\nLEFT JOIN snippets s ON u.id = s.author_id\nWHERE u.is_active = true\nGROUP BY u.id, u.username, u.email\nORDER BY snippet_count DESC\nLIMIT 10;' },
    { name: 'Java Class', language: 'java', template: 'public class DataProcessor {\n    private String name;\n    \n    public DataProcessor(String name) {\n        this.name = name;\n    }\n    \n    public String processData(String input) {\n        if (input == null || input.isEmpty()) {\n            throw new IllegalArgumentException("Input cannot be null or empty");\n        }\n        \n        // Process the input\n        return input.toUpperCase();\n    }\n    \n    // Getters and setters\n    public String getName() {\n        return name;\n    }\n    \n    public void setName(String name) {\n        this.name = name;\n    }\n}' },
  ];

  const handlePasteAndSave = async () => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        toast.error('Clipboard access not available in this browser');
        return;
      }

      // Check permissions first
      const permission = await navigator.permissions.query({ name: 'clipboard-read' });
      
      if (permission.state === 'denied') {
        toast.error('Clipboard access denied. Please enable clipboard permissions.');
        return;
      }

      // Try to read clipboard
      const text = await navigator.clipboard.readText();
      
      if (!text || text.trim().length === 0) {
        toast.error('Clipboard is empty');
        return;
      }

      // Store in localStorage and redirect
      localStorage.setItem('pastedContent', text);
      window.location.href = '/create?paste=true';
      
    } catch (error) {
      console.error('Clipboard error:', error);
      
      // Fallback: Show manual paste instruction
      toast.error('Cannot access clipboard automatically. Use Ctrl+V in the editor.');
      
      // Still redirect to create page
      window.location.href = '/create';
    }
  };

  const handleTemplateSelect = (template) => {
    localStorage.setItem('templateContent', JSON.stringify(template));
    window.location.href = '/create?template=true';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
        <span className="text-lg">⚡</span>
        <span>Quick Actions</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* New Snippet */}
        <Link
          to="/create"
          className="card-hover glass rounded-lg p-4 gradient-primary text-white transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <PlusIcon className="w-6 h-6" />
            <div>
              <div className="font-medium">New Snippet</div>
              <div className="text-sm opacity-90">Start coding</div>
            </div>
          </div>
        </Link>

        {/* Paste & Save */}
        <button
          onClick={handlePasteAndSave}
          className="card-hover glass rounded-lg p-4 gradient-success text-white transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <ClipboardDocumentIcon className="w-6 h-6" />
            <div>
              <div className="font-medium">Paste & Save</div>
              <div className="text-sm opacity-90">From clipboard</div>
            </div>
          </div>
        </button>

        {/* Templates */}
        <div className="relative group">
          <button className="w-full card-hover glass rounded-lg p-4 gradient-accent text-white transition-all duration-300">
            <div className="flex items-center space-x-3">
              <BookmarkIcon className="w-6 h-6" />
              <div>
                <div className="font-medium">Templates</div>
                <div className="text-sm opacity-90">Quick start</div>
              </div>
            </div>
          </button>

          {/* Enhanced Templates Dropdown - Fixed z-index */}
          <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-700/50">
            <div className="p-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded transition-all duration-200 flex items-center justify-between"
                >
                  <span>{template.name}</span>
                  <span className="text-slate-500 text-xs status-badge bg-slate-700 px-2 py-0.5 rounded">
                    {template.language}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Languages */}
        <div className="card-hover glass rounded-lg p-4 border border-slate-700/50 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-slate-400" />
            <div>
              <div className="font-medium text-slate-200">Recent</div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {recentLanguages.slice(0, 3).map((lang, index) => (
                  <span 
                    key={lang} 
                    className="status-badge bg-slate-600 text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-500/30 hover:bg-slate-500 transition-all duration-200 cursor-pointer"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tip Section */}
      <div className="glass rounded-lg p-3 border border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
        <div className="flex items-start space-x-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-sm text-slate-300">
              <strong className="text-indigo-300">Pro Tip:</strong> Use{' '}
              <kbd className="bg-slate-600 px-1.5 py-0.5 rounded text-xs border border-slate-500">Ctrl+V</kbd>{' '}
              or{' '}
              <kbd className="bg-slate-600 px-1.5 py-0.5 rounded text-xs border border-slate-500">Cmd+V</kbd>{' '}
              to paste code directly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
