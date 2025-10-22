import React, { useState, useEffect, useRef, memo } from 'react';
import { useMe } from '../../hooks/useMe.js';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom'; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MoreHorizontal,
  Search,
  Paperclip,
  Smile,
  Send,
  Loader2,
  Check,
  CheckCheck,
  File,
  MessageCircle,
  User,
  Trash2,
} from 'lucide-react';

// --- Helper Functions (Unchanged) ---

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatLastSeen = (lastActive) => {
  if (!lastActive) return 'last seen recently';
  const now = new Date();
  const lastSeen = new Date(lastActive);
  const diffInMs = now - lastSeen;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'online';
  if (diffInMinutes < 60) return `last seen ${diffInMinutes}m ago`;
  if (diffInHours < 24) return `last seen ${diffInHours}h ago`;
  if (diffInDays === 1) return 'last seen yesterday';
  if (diffInDays < 7) return `last seen ${diffInDays}d ago`;
  return `last seen ${lastSeen.toLocaleDateString()}`;
};

// --- Sub-components ---

/**
 * Chat Header Component - Fully Responsive
 */
const ChatHeader = memo(({ participant, chatId, onDeleteChat }) => {
  const navigate = useNavigate();
  const status = participant?.isOnline ? 'Online' : formatLastSeen(participant?.lastActive);

  const handleViewProfile = () => {
    if (participant?._id) {
      navigate(`/users/${participant._id}`);
    }
  };

  const handleDeleteChat = () => {
    if (chatId && onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background dark:border-slate-700">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
            <AvatarImage src={participant?.profilePic?.url} alt={participant?.name} />
            <AvatarFallback>
              {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {participant?.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
            {participant?.name || 'Unknown User'}
          </h3>
          <p className="text-xs text-muted-foreground transition-all duration-500 truncate">
            {status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
              <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteChat} 
              className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

/**
 * Message List Component - Responsive Spacing
 */
const MessageList = memo(({ messages, typingUsers, currentUser, otherParticipant }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const isCurrentUser = (senderId) => {
    return senderId === currentUser?.id;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
        <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-muted-foreground/30 mb-3 sm:mb-4" />
        <p className="text-base sm:text-lg font-medium text-foreground">Start a conversation</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Send a message to begin chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
      {messages.map((message, index) => {
        const senderId = message.sender?._id || message.sender;
        const isCurrentUserMsg = isCurrentUser(senderId);
        const isConsecutive = index > 0 &&
          (messages[index - 1].sender?._id || messages[index - 1].sender) === senderId;
          
        return (
          <MessageBubble
            key={message._id || index}
            message={message}
            isCurrentUserMsg={isCurrentUserMsg}
            isConsecutive={isConsecutive}
            otherParticipant={otherParticipant}
          />
        );
      })}
      {typingUsers.size > 0 && (
        <TypingIndicator participant={otherParticipant} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});

/**
 * Single Message Bubble - Responsive Width & Text
 */
const MessageBubble = memo(({ message, isCurrentUserMsg, isConsecutive, otherParticipant }) => {
  const showSenderName = !isCurrentUserMsg && !isConsecutive;

  // Function to get sender's name:
  const getSenderName = () => {
    if (message.sender?.name) {
      return message.sender.name;
    }else if(typeof message.sender === 'string') {
      return otherParticipant?.name || 'Unknown';
    }
    return 'Unknown';
  }

  return (
    <div className={`flex ${isCurrentUserMsg ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[60%] ${isCurrentUserMsg ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg ${
            isCurrentUserMsg
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          }`}
        >
          {showSenderName && (
            <div className="text-xs font-semibold text-blue-400 mb-1">
              {getSenderName()}
            </div>
          )}
          
          {message.messageType === 'file' ? (
            <div className="flex items-center gap-2">
              <File className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{message.text}</span>
            </div>
          ) : (
            <div className="text-message text-sm sm:text-base whitespace-pre-wrap break-words">
              {message.text}
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[10px] sm:text-xs opacity-70">
            <span>{formatMessageTime(message.timestamp)}</span>
            {isCurrentUserMsg && (
              <span className={message.read ? 'text-blue-400' : ''}>
                {message.read ? (
                  <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Typing Indicator - Responsive
 */
const TypingIndicator = memo(({ participant }) => (
  <div className="flex items-end gap-2">
    <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
      <AvatarImage src={participant?.profilePic?.url} alt={participant?.name} />
      <AvatarFallback className="text-xs">
        {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
    <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-muted text-foreground rounded-bl-sm">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  </div>
));

/**
 * Emoji Picker Component - Responsive Grid
 */
const EmojiPicker = ({ onEmojiSelect }) => {
  const emojis = [
    '😀', '😂', '😊', '😍', '🥰', '😘', '😉', '😎', '🤔', '😮', '😢', '😭', 
    '😤', '😡', '👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🤝', '🙏', '💪', 
    '❤️', '💯', '🔥', '⭐', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🌹', '🌟', 
    '💎', '🚀', '💻', '📱', '⌚', '🔑', '💰', '🏆', '🥇', '🎯'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
          <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 max-w-[280px] sm:max-w-none" align="end">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="icon"
              className="text-base sm:text-lg h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => onEmojiSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};


/**
 * Chat Input Form Component - Fully Responsive
 */
const ChatInput = ({
  newMessage,
  sendingMessage,
  handleSendMessage,
  handleInputChange,
  handleInputBlur,
  handleKeyPress,
  handleFileAttachment,
  addEmoji,
}) => {
  return (
    <div className="p-2 sm:p-3 md:p-4 border-t bg-background dark:border-slate-700">
      <form onSubmit={handleSendMessage} className="flex items-end gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          onClick={handleFileAttachment}
        >
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <EmojiPicker onEmojiSelect={addEmoji} />

        <Textarea
          value={newMessage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-muted dark:bg-slate-800 border-none rounded-2xl min-h-[36px] sm:min-h-[40px] max-h-28 sm:max-h-32 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
          rows={1}
          maxLength={2000}
        />
        
        <Button
          type="submit"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          disabled={!newMessage.trim() || sendingMessage}
        >
          {sendingMessage ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};


const ChatWindow = ({ chatId, chat, state, actions }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const fileInputRef = useRef(null);
  const { data: currentUser } = useMe();
  const navigate = useNavigate();


  const { joinChat, leaveChat } = actions;
  // Add this useEffect for cleanup when chat changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);
  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId, joinChat, leaveChat]); 

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || state.sendingMessage) return;
    try {
      // Clear any pending typing timeout before sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      await actions.sendMessage(chatId, newMessage.trim());
      setNewMessage('');
      actions.stopTyping(chatId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Clear any existing timeout first
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim() && !state.sendingMessage) {
      // Only start typing if there's actual content (not just spaces)
      typingTimeoutRef.current = setTimeout(() => {
        actions.startTyping(chatId);
      }, 300); // Reduced debounce for faster response
    } else {
      // Always stop typing when input is empty or only spaces
      actions.stopTyping(chatId);
    }
  };

  const handleInputBlur = () => {
    // Clear any pending typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    actions.stopTyping(chatId);
  };
  
  const getOtherParticipant = () => {
    if (!chat?.participants || !currentUser?.id) return null;
    return chat.participants.find(p => p._id !== currentUser.id);
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB', {
          description: error?.message || 'Please try again!.',
          duration: 4000,
      });
        return;
      }
      actions.sendMessage(chatId, `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`, 'file');
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        
        await actions.deleteChat?.(chatId);
        navigate('/chat'); // Navigate back to chat list
      } catch (error) {
        toast.error('Failed to delete Chat.', {
          description: error?.message || 'Please try again!.',
          duration: 4000,
      });
      }
    }
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    // ✅ Add search functionality (implement later)
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };
  
  const otherParticipant = getOtherParticipant();
  
  if (!chat || !currentUser) {
     return (
        <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-background">
          <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-muted-foreground/30 mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium text-foreground">Select a chat</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Choose a conversation from the list to start chatting</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <ChatHeader 
        participant={otherParticipant} 
        chatId={chatId}
        onDeleteChat={handleDeleteChat}
      />
      
      <MessageList
        messages={state.messages}
        typingUsers={state.typingUsers}
        currentUser={currentUser}
        otherParticipant={otherParticipant}
      />
      
      <ChatInput
        newMessage={newMessage}
        sendingMessage={state.sendingMessage}
        handleSendMessage={handleSendMessage}
        handleInputChange={handleInputChange}
        handleInputBlur={handleInputBlur}
        handleKeyPress={handleKeyPress}
        handleFileAttachment={handleFileAttachment}
        addEmoji={addEmoji}
      />

      {/* Search overlay (implement later) */}
      {showSearch && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="text-center">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium">Search in conversation</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Coming soon...</p>
          </div>
        </div>
      )}
      
      {/* Hidden file input (unchanged) */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,audio/*,video/*,application/*,text/*"
      />
    </div>
  );
};

export default React.memo(ChatWindow);