import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useMe } from '../../hooks/useMe.js';

const ChatWindow = ({ chatId, chat }) => {
  const { state, actions } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const {data: currentUser} = useMe()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  useEffect(() => {
    console.log('ChatWindow mounted with chatId:', chatId);
    console.log('Socket connected:', state.socketConnected);
  }, [chatId]);

  // Join chat room when component mounts
  useEffect(() => {
    if (chatId) {
      actions.joinChat(chatId);
      return () => {
        actions.leaveChat(chatId);
      };
    }
  }, [chatId]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || state.sendingMessage) return;

    try {
      await actions.sendMessage(chatId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle key press for sending
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Handle typing indicators
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (e.target.value && !state.sendingMessage) {
      actions.startTyping(chatId);
    }
  };

  const handleInputBlur = () => {
    if (newMessage) {
      actions.stopTyping(chatId);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  

  // Check if message is from current user
  const isCurrentUser = (senderId) => {
    const currentUserId = currentUser?.id;
    return senderId === currentUserId;
  };

  // Get other participant
  const getOtherParticipant = () => {
    if (!chat?.participants) return null;
    const currentUserId = currentUser?.id;
    // console.log(currentUserId,chat);
    return chat.participants.find(p => p._id !== currentUserId);
    
  };

  // Handle file attachment
  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement file upload
      console.log('File selected:', file);
      // For now, just send as text message
      actions.sendMessage(chatId, `📎 ${file.name}`, 'file');
    }
  };

  // Add emoji to message
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

// Format last seen time
const formatLastSeen = (lastActive) => {
  if (!lastActive) return 'last seen recently';
  
  const now = new Date();
  const lastSeen = new Date(lastActive);
  const diffInMs = now - lastSeen;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'last seen just now';
  if (diffInMinutes < 60) return `last seen ${diffInMinutes}m ago`;
  if (diffInHours < 24) return `last seen ${diffInHours}h ago`;
  if (diffInDays === 1) return 'last seen yesterday';
  if (diffInDays < 7) return `last seen ${diffInDays}d ago`;
  return `last seen ${lastSeen.toLocaleDateString()}`;
};

  const otherParticipant = getOtherParticipant();
  

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="user-info">
          <div className="user-avatar">
            {otherParticipant?.profilePic.url ? (
              <img
                src={otherParticipant.profilePic.url}
                alt={otherParticipant.name}
                className="avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">
                {otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {otherParticipant?.isOnline && (
              <div className="online-indicator"></div>
            )}
          </div>
          <div className="user-details">
            <h3 className="user-name">{otherParticipant?.name || 'Unknown User'}</h3>
            <p className="user-status">
              {otherParticipant?.isOnline ? 'online' : formatLastSeen(otherParticipant?.lastActive)}
            </p>
          </div>
        </div>

        <div className="chat-actions">
          <button className="action-btn" title="Search in conversation">
            🔍
          </button>
          <button className="action-btn" title="More options">
            ⋯
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="messages-list">
          {state.messages.length === 0 ? (
            <div className="empty-messages">
              <div className="empty-icon">💬</div>
              <p>Start a conversation</p>
              <p className="empty-subtitle">Send a message to begin chatting</p>
            </div>
          ) : (
            state.messages.map((message, index) => {
              const isCurrentUserMsg = isCurrentUser(message.sender?._id || message.sender);
              const showAvatar = !isCurrentUserMsg &&
                (index === 0 || state.messages[index - 1].sender?._id !== message.sender?._id);
              const isConsecutive = !isCurrentUserMsg &&
                index > 0 &&
                state.messages[index - 1].sender?._id === message.sender?._id;

              return (
                <div
                  key={message._id || index}
                  className={`message-wrapper ${isCurrentUserMsg ? 'sent' : 'received'}`}
                >
                  {/* {!isCurrentUserMsg && showAvatar && (
                    <div className="message-avatar">
                      {message.sender?.profilePic.url ? (
                        <img
                          src={message.sender.profilePic.url}
                          alt={message.sender.name}
                          className="avatar-small"
                        />
                      ) : (
                        <div className="avatar-placeholder-small">
                          {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )} */}

                  <div className={`message-bubble ${isCurrentUserMsg ? 'sent' : 'received'}`}>
                    {!isCurrentUserMsg && !isConsecutive && (
                      <div className="message-sender">
                        {message.sender?.name || 'Unknown'}
                      </div>
                    )}

                    <div className="message-content">
                      {message.messageType === 'file' ? (
                        <div className="file-message">
                          <span className="file-icon">📁</span>
                          <span className="file-name">{message.text}</span>
                        </div>
                      ) : (
                        <div className="text-message">{message.text}</div>
                      )}
                    </div>

                    <div className="message-footer">
                      <span className="message-time">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {isCurrentUserMsg && (
                        <span className={`message-status ${message.read ? 'read' : 'sent'}`}>
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {state.typingUsers.size > 0 && (
            <div className="typing-indicator">
              <div className="typing-avatar">
                {otherParticipant?.profilePic.url ? (
                  <img
                    src={otherParticipant.profilePic.url}
                    alt={otherParticipant.name}
                    className="avatar-small"
                  />
                ) : (
                  <div className="avatar-placeholder-small">
                    {otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                  </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <div className="input-actions">
            <button
              type="button"
              className="attachment-btn"
              onClick={handleFileAttachment}
              title="Attach file"
            >
              📁
            </button>

            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              😊
            </button>
          </div>

          <div className="input-wrapper">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="message-input"
              rows={1}
              maxLength={2000}
            />

            <button
              type="submit"
              className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
              disabled={!newMessage.trim() || state.sendingMessage}
              title="Send message"
            >
              {state.sendingMessage ? '⏳' : '📤'}
            </button>
          </div>

          {/* Emoji Picker (simplified) */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              <div className="emoji-grid">
                {['😀', '😂', '😊', '😍', '🥰', '😘', '😉', '😎', '🤔', '😮', '😢', '😭', '😤', '😡', '👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🤝', '🙏', '💪', '❤️', '💯', '🔥', '⭐', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🌹', '🌟', '💎', '🚀', '💻', '📱', '⌚', '🔑', '💰', '🏆', '🥇', '🎯'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-btn-item"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,audio/*,video/*,application/*,text/*"
      />

      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #ffffff;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .user-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .user-avatar {
          position: relative;
          margin-right: 12px;
        }

        .avatar-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 600;
        }

        .online-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #28a745;
          border: 2px solid white;
          border-radius: 50%;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .user-status {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #6c757d;
          opacity: 0;
          transform: translateY(-8px);
          animation: slideDown 0.6s ease forwards;
          animation-delay: 2s; /* delay before appearing */
        }

        /* Keyframes for smooth slide + fade effect */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        .chat-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .action-btn:hover {
          background: #e9ecef;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8f9fa;
        }

        .messages-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .empty-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-subtitle {
          font-size: 14px;
          margin-top: 8px;
        }

        .message-wrapper {
          display: flex;
          margin-bottom: 8px;
          align-items: flex-end;
        }

        .message-wrapper.sent {
          justify-content: flex-end;
        }

        .message-wrapper.received {
          justify-content: flex-start;
        }

        .message-avatar {
          margin-right: 8px;
        }

        .avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .message-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
        }

        .message-bubble.sent {
          background: #005c4b; /* Deep teal */
          color: #e9f5f1;      /* Soft white-green */
          border-bottom-right-radius: 8px;
        }

        .message-bubble.received {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .message-sender {
          font-size: 11px;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 4px;
        }

        .message-content {
          margin-bottom: 4px;
        }

        .text-message {
          line-height: 1.4;
        }

        .file-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
        }

        .file-icon {
          font-size: 16px;
        }

        .file-name {
          font-size: 14px;
          color: #007bff;
        }

        .message-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          opacity: 0.7;
        }

        .message-time {
          margin-right: 8px;
        }

        .message-status {
          font-size: 10px;
        }

        .message-status.read {
          color: #34b7f1; /* Soft blue tick color */
        }

        .message-status.sent {
          color: #9aa0a6; /* Light gray */
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          color: #6c757d;
        }

        .typing-avatar {
          margin-right: 8px;
        }

        .typing-bubble {
          background: white;
          padding: 8px 12px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .typing-dots {
          display: flex;
          gap: 2px;
        }

        .typing-dots span {
          width: 4px;
          height: 4px;
          background: #6c757d;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          30% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .message-input-container {
          padding: 16px 20px;
          border-top: 1px solid #e0e0e0;
          background: white;
        }

        .message-input-form {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          max-width: 800px;
          margin: 0 auto;
        }

        .input-actions {
          display: flex;
          gap: 4px;
        }

        .attachment-btn,
        .emoji-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .attachment-btn:hover,
        .emoji-btn:hover {
          background: #f8f9fa;
        }

        .input-wrapper {
          flex: 1;
          display: flex;
          align-items: flex-end;
          background: #f8f9fa;
          border-radius: 20px;
          padding: 8px 12px;
          gap: 8px;
        }

        .message-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.4;
          max-height: 120px;
          overflow-y: auto;
        }

        .send-btn {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .send-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .send-btn.active {
          background: #007bff;
        }

        .emoji-picker {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 280px;
          z-index: 1000;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          padding: 12px;
        }

        .emoji-btn-item {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .emoji-btn-item:hover {
          background: #f8f9fa;
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .chat-header {
            padding: 12px 16px;
          }

          .user-name {
            font-size: 14px;
          }

          .user-status {
            font-size: 11px;
          }

          .messages-container {
            padding: 12px;
          }

          .message-bubble {
            max-width: 85%;
          }

          .message-input-container {
            padding: 12px 16px;
          }

          .message-input-form {
            gap: 4px;
          }

          .input-wrapper {
            padding: 6px 10px;
          }

          .message-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;