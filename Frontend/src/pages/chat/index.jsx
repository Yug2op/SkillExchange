import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import ChatList from '../../components/chat/ChatList.jsx';
import ChatWindow from '../../components/chat/ChatWindow.jsx';
import { searchUsers } from '../../api/UserApi.js';
import { useMe } from '../../hooks/useMe.js';

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { state, actions } = useChat();
  const { data: currentUser } = useMe()
  

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileChat(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load initial chats
  useEffect(() => {
    actions.loadChats();
  }, []);

  // Handle chat selection
  const handleChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    
    // Load the messages for this chat
    try {
      await actions.loadChat(chatId);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
    
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  // Handle back to chat list on mobile
  const handleBackToChatList = () => {
    setShowMobileChat(false);
    setSelectedChatId(null);
  };

  // Handle new chat search
  const handleNewChatSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await searchUsers({ q: query, limit: 10 });
      if (response.success) {
        // Filter out current user and users already in chats
        const filteredUsers = response.data?.users.filter((user) => {
          const isCurrentUser = user?._id === currentUser?.id;
          const alreadyInChat = state.chats.some((chat) =>
            chat.participants.some((p) => p._id === user._id)
        );
          return !isCurrentUser && !alreadyInChat;
        });
        setSearchResults(filteredUsers);
        // console.log(filteredUsers);
        
        
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle creating or getting existing chat
  const handleNewChat = async (participantId, exchangeId = null) => {
    try {
      const chat = await actions.createOrGetChat(participantId, exchangeId);
      setSelectedChatId(chat._id);
      if (isMobile) {
        setShowMobileChat(true);
      }
      return chat;
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Handle user selection for new chat
  const handleUserSelect = async (user) => {
    try {
      const chat = await actions.createOrGetChat(user._id);
      setSelectedChatId(chat._id);
      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);
      handleNewChat();

      // console.log(setSearchQuery);
      
      if (isMobile) {
        setShowMobileChat(true);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      handleNewChatSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Find selected chat from state
  const selectedChat = state.chats.find((chat) => chat._id === selectedChatId);

  // console.log(selectedChat,showMobileChat,isMobile,showMobileChat,searchQuery,searchResults,searchLoading);

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat List */}
        <div
          className={`chat-list-panel ${isMobile && showMobileChat ? 'hidden' : 'visible'
            }`}
        >
          <ChatList onChatSelect={handleChatSelect} selectedChatId={selectedChatId} />
        </div>

        {/* Chat Window */}
        <div
          className={`chat-window-panel ${isMobile && !showMobileChat ? 'hidden' : 'visible'
            }`}
        >
          {selectedChatId && selectedChat ? (
            <>
              {/* Mobile Back Button */}
              {isMobile && (
                <button className="mobile-back-btn" onClick={handleBackToChatList}>
                  ← Back to conversations
                </button>
              )}

              <ChatWindow chatId={selectedChatId} chat={selectedChat} />
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <button
                    className="quick-action-btn"
                    onClick={() => setShowNewChatModal(true)}
                  >
                    <span className="action-icon">✏️</span>
                    <span>Start New Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileChat && (
        <div className="mobile-overlay" onClick={handleBackToChatList} />
      )}

      {/* Loading Overlay */}
      {state.loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div
            className="modal-content new-chat-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Start New Chat</h3>
              <button
                className="modal-close"
                onClick={() => setShowNewChatModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search users by name, skills, or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)
                  }
                  className="search-input"
                />

                {searchLoading && (
                  <div className="search-loading">
                    <div className="loading-spinner small"></div>
                    <span>Searching...</span>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="user-item"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="user-avatar">
                          {user.profilePic?.url ? (
                            <img src={user.profilePic.url} alt={user.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-skills">
                            {user.skillsToTeach?.length > 0 && (
                              <span className="skill-tag">
                                Teaches: {user.skillsToTeach.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <div className="no-results">
                    <p>No users found matching "{searchQuery}"</p>
                    <p>Try searching with different keywords</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {state.error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{state.error}</span>
          <button className="error-close" onClick={actions.clearError}>
            ✕
          </button>
        </div>
      )}
      <style jsx>{`
        .chat-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .chat-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .chat-list-panel {
          width: 350px;
          flex-shrink: 0;
          border-right: 1px solid #e0e0e0;
          transition: transform 0.3s ease;
        }

        .chat-window-panel {
          flex: 1;
          transition: transform 0.3s ease;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .chat-list-panel {
            width: 100%;
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            z-index: 1000;
            transform: translateX(0);
          }

          .chat-list-panel.hidden {
            transform: translateX(-100%);
          }

          .chat-window-panel {
            width: 100%;
            transform: translateX(0);
          }

          .chat-window-panel.hidden {
            transform: translateX(100%);
          }
        }

        .mobile-back-btn {
          display: none;
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0;
          width: 100%;
        }

        @media (max-width: 768px) {
          .mobile-back-btn {
            display: block;
          }
        }

        .no-chat-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8f9fa;
        }

        .empty-state {
          text-align: center;
          color: #6c757d;
          max-width: 400px;
          padding: 40px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .empty-state p {
          margin: 0 0 32px 0;
          font-size: 16px;
          line-height: 1.5;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .quick-action-btn:hover {
          background: #0056b3;
        }

        .action-icon {
          font-size: 16px;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          color: #6c757d;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e9ecef;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc3545;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 2000;
          max-width: 400px;
        }

        .error-icon {
          font-size: 16px;
        }

        .error-message {
          flex: 1;
          font-size: 14px;
        }

        .error-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          line-height: 1;
        }

        .error-close:hover {
          opacity: 0.8;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .chat-list-panel {
            width: 100%;
          }

          .error-banner {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .empty-state {
            padding: 20px;
          }

          .empty-icon {
            font-size: 60px;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            font-size: 20px;
          }

          .empty-state p {
            font-size: 14px;
          }
        }

        /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .modal-close:hover {
    background: #f3f4f6;
  }

  .modal-body {
    padding: 24px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: #3b82f6;
  }

  .search-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #6b7280;
  }

  .search-loading .loading-spinner.small {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  .search-results {
    margin-top: 16px;
    max-height: 300px;
    overflow-y: auto;
  }

  .user-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s;
    margin-bottom: 4px;
  }

  .user-item:hover {
    background: #f3f4f6;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 16px;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .user-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .skill-tag {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .no-results {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .no-results p {
    margin: 0 0 8px 0;
  }

  /* Mobile New Chat Button */
  .mobile-new-chat {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    background: white;
  }

  .mobile-new-chat-btn {
    width: 100%;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .mobile-new-chat-btn:hover {
    background: #2563eb;
  }
      `}</style>

    </div>

  );
};

export default ChatPage;