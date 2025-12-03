import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClipboardIcon, EnvelopeIcon, LinkIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, snippet }) => {
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('links');
  const [shareForm, setShareForm] = useState({
    emails: '',
    usernames: '',
    permissions: 'view'
  });
  const [sharingDetails, setSharingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && snippet) {
      fetchSharingDetails();
    }
  }, [isOpen, snippet]);

  const fetchSharingDetails = async () => {
    try {
      const response = await axios.get(`/api/snippets/${snippet._id}/sharing`);
      setSharingDetails(response.data);
    } catch (error) {
      console.error('Error fetching sharing details:', error);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(''), 2000);
  };

  const shareViaEmail = () => {
    const shareUrl = `${window.location.origin}/share/${snippet.shareId}`;
    const subject = `Code Snippet: ${snippet.title}`;
    const body = `Check out this code snippet:\n\nTitle: ${snippet.title}\n${snippet.description ? `Description: ${snippet.description}\n` : ''}Link: ${shareUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  const getVisibilityInfo = () => {
    switch (snippet.visibility) {
      case 'public':
        return { color: 'text-green-400', text: 'Anyone can view this snippet' };
      case 'organization':
        return { color: 'text-blue-400', text: 'Only members of your organization can view' };
      case 'private':
        return { color: 'text-orange-400', text: 'Only members of your organization can view via share link' };
      default:
        return { color: 'text-slate-400', text: 'Visibility settings apply' };
    }
  };

  const handleShareWithUsers = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emails = shareForm.emails.split(',').map(e => e.trim()).filter(e => e);
      const usernames = shareForm.usernames.split(',').map(u => u.trim()).filter(u => u);

      if (emails.length === 0 && usernames.length === 0) {
        toast.error('Please enter at least one email or username');
        return;
      }

      const response = await axios.post(`/api/snippets/${snippet._id}/share`, {
        emails,
        usernames,
        permissions: shareForm.permissions
      });

      toast.success('Snippet shared successfully!');
      setShareForm({ emails: '', usernames: '', permissions: 'view' });
      fetchSharingDetails(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to share snippet');
    } finally {
      setLoading(false);
    }
  };

  const removeSharedUser = async (shareEntryId) => {
    try {
      await axios.delete(`/api/snippets/${snippet._id}/share/${shareEntryId}`);
      toast.success('User removed from sharing list');
      fetchSharingDetails(); // Refresh the list
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/share/${snippet.shareId}`;
  const directUrl = `${window.location.origin}/snippet/${snippet._id}`;
  const visibilityInfo = getVisibilityInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Share Snippet</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-slate-100 mb-2">{snippet.title}</h4>
          <p className={`text-sm ${visibilityInfo.color} mb-4`}>
            {visibilityInfo.text}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-600 mb-4">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('links')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'links'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Share Links
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Specific Users
            </button>
          </nav>
        </div>

        {activeTab === 'links' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Share Link {snippet.visibility === 'private' ? '(Organization)' : snippet.visibility === 'organization' ? '(Organization)' : '(Public)'}
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-600 rounded-l-md bg-slate-700 text-slate-100 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl, 'Share link')}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors"
                >
                  {copied === 'Share link' ? (
                    <span className="text-xs">Copied!</span>
                  ) : (
                    <ClipboardIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Direct Link (Requires login)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={directUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-600 rounded-l-md bg-slate-700 text-slate-100 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(directUrl, 'Direct link')}
                  className="px-3 py-2 bg-slate-600 text-white rounded-r-md hover:bg-slate-500 transition-colors"
                >
                  {copied === 'Direct link' ? (
                    <span className="text-xs">Copied!</span>
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={shareViaEmail}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                Share via Email
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Share with specific users form */}
            <form onSubmit={handleShareWithUsers} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email addresses (comma-separated)
                </label>
                <input
                  type="text"
                  value={shareForm.emails}
                  onChange={(e) => setShareForm({...shareForm, emails: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="user1@company.com, user2@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Usernames (comma-separated)
                </label>
                <input
                  type="text"
                  value={shareForm.usernames}
                  onChange={(e) => setShareForm({...shareForm, usernames: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john_doe, jane_smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Permissions
                </label>
                <select
                  value={shareForm.permissions}
                  onChange={(e) => setShareForm({...shareForm, permissions: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="view">View only</option>
                  <option value="edit">View and edit</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                {loading ? 'Sharing...' : 'Share with Users'}
              </button>
            </form>

            {/* Currently shared users */}
            {sharingDetails && sharingDetails.sharedWith.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-slate-300 mb-3">
                  Shared with ({sharingDetails.sharedWith.length} users)
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sharingDetails.sharedWith.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm text-slate-100">
                          {share.user ? share.user.username : 'Pending'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {share.email} • {share.permissions} access
                        </div>
                        <div className="text-xs text-slate-500">
                          Shared {new Date(share.sharedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSharedUser(share.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove access"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
