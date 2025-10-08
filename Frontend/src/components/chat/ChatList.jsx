import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useMe } from '../../hooks/useMe.js';

const ChatList = ({ onChatSelect, selectedChatId }) => {
  const { state, actions } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);
  const { data: currentUser } = useMe()

  // console.log(state);


  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      actions.searchChats(query);
    } else {
      actions.loadChats();
    }
  };


  // Toggle search
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      actions.loadChats();
    }
  };

  // Format timestamp like Telegram
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // Today - show time only
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // This week - show day name
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Truncate message text
  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Handle chat selection
  const handleChatClick = (chat) => {
    if (onChatSelect) {
      onChatSelect(chat._id);

    }
  };

  // Get other participant (not current user)
  const getOtherParticipant = (chat) => {
    // console.log(chat);

    if (!chat || !Array.isArray(chat.participants)) return null;

    // Safely get current user
    try {
      if (!currentUser || !currentUser.id) return null;

      const currentUserId = currentUser.id;

      return chat.participants.find(p => p?._id !== currentUserId) || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };


  return (
    <div className="chat-list">
      {/* Header */}
      <div className="chat-list-header">
        <h2>Messages</h2>
        <button
          className="search-toggle-btn"
          onClick={toggleSearch}
          title={showSearch ? 'Close search' : 'Search chats'}
        >
          {showSearch ? '✕' : '🔍'}
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => handleSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.loadingChats && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      )}

      {/* Chat List */}
      <div className="chat-list-items">
        {state.chats.length === 0 && !state.loadingChats ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No conversations yet</p>
            <p className="empty-subtitle">Start a conversation with someone!</p>
          </div>
        ) : (
          state.chats?.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            // console.log(otherParticipant);
            const unreadCount = state.unreadCounts[chat._id] || 0;
            const isSelected = selectedChatId === chat._id;

            return (
              <div
                key={chat?._id}
                className={`chat-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleChatClick(chat)}
              >
                {/* Avatar + Chat Info */}
                <div className="chat-header">
                  {/* Avatar */}
                  <img
                    src={otherParticipant.profilePic?.url || '/default-avatar.png'}
                    alt={otherParticipant.name}
                    className="avatar"
                    style={{ width: 40, height: 40, borderRadius: '50%' }}
                  />
                  {otherParticipant?.isOnline && (
                    <div
                      className="online-indicator"
                      style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, background: '#28a745', border: '2px solid white', borderRadius: '50%' }}
                    ></div>
                  )}

                  {/* Chat Info */}
                  <div className="chat-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="chat-name">{otherParticipant.name || 'Unknown User'}</span>
                      <span className="chat-time">
                        {chat.lastMessageAt ? formatTime(chat.lastMessageAt) : ''}
                      </span>
                    </div>

                    <div className="chat-preview">
                      <span className="last-message">
                        {chat.lastMessage ? truncateMessage(chat.lastMessage) : 'No messages yet'}
                      </span>
                    </div>

                    {chat.exchange && (
                      <div className="exchange-indicator">
                        <span className="exchange-icon">🔄</span>
                        <span className="exchange-text">Exchange</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <div className="unread-badge">
                    <span className="unread-count">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                )}
              </div>
            );

          })
        )}
      </div>

      {/* Load More Button (for pagination) */}
      {state.hasMoreChats && !searchQuery && (
        <button
          className="load-more-btn"
          onClick={() => actions.loadChats(state.currentPage + 1, true)}
          disabled={state.loadingChats}
        >
          {state.loadingChats ? 'Loading...' : 'Load More'}
        </button>
      )}

      <style jsx>{`
        .chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
}

/* Header */
.chat-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.chat-list-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #222;
}

.search-toggle-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.search-toggle-btn:hover {
  background: #e9ecef;
}

/* Search bar */
.search-container {
  padding: 10px 18px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6c757d;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6c757d;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Chat list container */
.chat-list-items {
  flex: 1;
  overflow-y: auto;
}

/* Chat item */
.chat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;  /* ensures badge stays to right */
  padding: 12px 18px;
  border-bottom: 1px solid #f1f1f1;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}


.chat-item:hover {
  background: #f8f9fa;
}

.selected {
  background: #e9f3ff;
  border-left: 3px solid #007bff;
}

/* Avatar */
.chat-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #00c6ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
}

/* Chat info */
.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px; /* space from avatar */
}



.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background-color: #fff; /* white header background */
  border-bottom: 1px solid #e0e0e0; /* subtle divider */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* soft shadow for depth */
  border-radius: 8px 8px 0 0; /* rounded top corners */
  position: sticky; /* optional: stick to top if scrollable chat */
  top: 0;
  z-index: 10;
}

.chat-name {
  font-weight: 600;
  color: #222;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-name:hover {
  color: #007bff;
}

.chat-time {
  font-size: 12px;
  color: #888;
  
}

.chat-preview {
  display: flex;
  align-items: center;
}

.last-message {
  font-size: 13px;
  color: #555;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Exchange indicator */
.exchange-indicator {
  display: flex;
  align-items: center;
  background-color: #e6f7ff; /* subtle blue background */
  color: #1890ff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  margin-top: 4px;
  width: fit-content;
}

.exchange-icon {
  margin-right: 4px;
}

/* Unread badge */
.unread-badge {
  background: #007bff;
  color: white;
  border-radius: 50%;
  min-width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  flex-shrink: 0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-subtitle {
  font-size: 14px;
  margin-top: 8px;
}

/* Load more */
.load-more-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  margin: 16px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #0056b3;
}

.load-more-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Scrollbar */
.chat-list-items::-webkit-scrollbar {
  width: 4px;
}

.chat-list-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.chat-list-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-list-header {
    padding: 12px 16px;
  }

  .chat-list-header h2 {
    font-size: 18px;
  }

  .chat-item {
    padding: 10px 14px;
  }

  .avatar-img,
  .avatar-placeholder {
    width: 42px;
    height: 42px;
  }

  .last-message {
    font-size: 12px;
  }
}

      `}</style>
    </div>
  );
};

export default ChatList;
