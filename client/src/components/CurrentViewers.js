import React, { useState, useEffect } from 'react';
import { EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CurrentViewers = ({ snippetId }) => {
  const [viewers, setViewers] = useState([]);
  const [isViewing, setIsViewing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!snippetId) return;

    let interval;

    const joinViewing = async () => {
      try {
        const response = await axios.post(`/api/snippets/${snippetId}/join-view`, {
          socketId: 'web-client-' + Date.now() // Simple socket ID for now
        });
        setViewers(response.data.currentViewers);
        setIsViewing(true);
      } catch (error) {
        console.error('Error joining viewing:', error);
      }
    };

    const updateViewers = async () => {
      try {
        const response = await axios.get(`/api/snippets/${snippetId}/viewers`);
        setViewers(response.data.currentViewers);
      } catch (error) {
        console.error('Error fetching viewers:', error);
      }
    };

    const leaveViewing = async () => {
      try {
        await axios.post(`/api/snippets/${snippetId}/leave-view`);
        setIsViewing(false);
      } catch (error) {
        console.error('Error leaving viewing:', error);
      }
    };

    // Join viewing when component mounts
    joinViewing();

    // Update viewers every 10 seconds
    interval = setInterval(updateViewers, 10000);

    // Leave viewing when component unmounts or page unloads
    const handleBeforeUnload = () => {
      leaveViewing();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isViewing) {
        leaveViewing();
      }
    };
  }, [snippetId]);

  // Keep user's view active by updating lastSeen
  useEffect(() => {
    if (!isViewing || !snippetId) return;

    const keepAlive = setInterval(async () => {
      try {
        await axios.post(`/api/snippets/${snippetId}/join-view`, {
          socketId: 'web-client-' + Date.now()
        });
      } catch (error) {
        console.error('Error keeping view alive:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(keepAlive);
  }, [isViewing, snippetId]);

  if (!viewers || viewers.length === 0) {
    return null;
  }

  // Filter out current user from display
  const otherViewers = viewers.filter(viewer => viewer.user._id !== user?.id);

  return (
    <div className="flex items-center space-x-2 text-sm text-slate-400">
      <EyeIcon className="w-4 h-4" />
      <span>
        {viewers.length === 1 ? 'You are viewing this' : 
         otherViewers.length === 0 ? 'You are viewing this' :
         `${viewers.length} people viewing`}
      </span>
      
      {otherViewers.length > 0 && (
        <div className="flex items-center space-x-1 ml-2">
          {otherViewers.slice(0, 3).map((viewer, index) => (
            <div
              key={viewer.user._id}
              className="flex items-center space-x-1 bg-slate-700 rounded-full px-2 py-1"
              title={`${viewer.user.username} (${viewer.user.email})`}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-slate-300">{viewer.user.username}</span>
            </div>
          ))}
          
          {otherViewers.length > 3 && (
            <div 
              className="flex items-center bg-slate-700 rounded-full px-2 py-1"
              title={`${otherViewers.slice(3).map(v => v.user.username).join(', ')}`}
            >
              <UserIcon className="w-3 h-3" />
              <span className="text-xs text-slate-300 ml-1">
                +{otherViewers.length - 3}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentViewers;
