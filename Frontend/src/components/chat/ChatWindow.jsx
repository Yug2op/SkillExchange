import React, { useState, useEffect, useRef, memo } from 'react';
import { useMe } from '../../hooks/useMe.js';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
 * Chat Header Component
 */
const ChatHeader = memo(({ participant }) => {
  const status = participant?.isOnline ? 'Online' : formatLastSeen(participant?.lastActive);
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={participant?.profilePic?.url} alt={participant?.name} />
            <AvatarFallback>
              {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {participant?.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-base text-foreground">
            {participant?.name || 'Unknown User'}
          </h3>
          <p className="text-xs text-muted-foreground transition-all duration-500">
            {status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Block User</DropdownMenuItem>
            <DropdownMenuItem>Clear Chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

/**
 * Message List Component
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
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <MessageCircle className="w-24 h-24 text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-foreground">Start a conversation</p>
        <p className="text-sm text-muted-foreground">Send a message to begin chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const senderId = message.sender?._id || message.sender;
        const isCurrentUserMsg = isCurrentUser(senderId);
        
        // This was the line that was fixed (changed state.messages to messages)
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
 * Single Message Bubble
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
      <div className={`flex flex-col max-w-[70%] ${isCurrentUserMsg ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-2 rounded-lg ${
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
              <File className="w-4 h-4" />
              <span>{message.text}</span>
            </div>
          ) : (
            <div className="text-message whitespace-pre-wrap break-words">
              {message.text}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1.5 text-xs opacity-70">
            <span>{formatMessageTime(message.timestamp)}</span>
            {isCurrentUserMsg && (
              <span className={message.read ? 'text-blue-400' : ''}>
                {message.read ? (
                  <CheckCheck className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
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
 * Typing Indicator
 */
const TypingIndicator = memo(({ participant }) => (
  <div className="flex items-end gap-2">
    <Avatar className="w-8 h-8">
      <AvatarImage src={participant?.profilePic?.url} alt={participant?.name} />
      <AvatarFallback>
        {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
    <div className="px-4 py-3 rounded-lg bg-muted text-foreground rounded-bl-sm">
      <div className="flex gap-1 items-center">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  </div>
));

/**
 * Emoji Picker Component
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
        <Button variant="ghost" size="icon" className="rounded-full">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="icon"
              className="text-lg"
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
 * Chat Input Form Component
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
    <div className="p-4 border-t bg-background dark:border-slate-700">
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleFileAttachment}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <EmojiPicker onEmojiSelect={addEmoji} />

        <Textarea
          value={newMessage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-muted dark:bg-slate-800 border-none rounded-2xl min-h-[40px] max-h-32"
          rows={1}
          maxLength={2000}
        />
        
        <Button
          type="submit"
          size="icon"
          className="rounded-full w-10 h-10"
          disabled={!newMessage.trim() || sendingMessage}
        >
          {sendingMessage ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};


const ChatWindow = ({ chatId, chat, state, actions }) => {
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef(null);
  const { data: currentUser } = useMe();


  const { joinChat, leaveChat } = actions;

  
  
  // useEffect(() => {
  //   // console.log('ChatWindow mounted with chatId:', chatId);
  // }, [chatId]);

  // This useEffect now depends on 'joinChat' and 'leaveChat' individually,
  // which are stable if defined with useCallback/useMemo in the parent.
  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId, joinChat, leaveChat]); // <-- Fixed dependency array

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

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
      // console.log('File selected:', file);
      // TODO: Implement file upload logic
      actions.sendMessage(chatId, `📎 ${file.name}`, 'file');
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };
  
  const otherParticipant = getOtherParticipant();
  
  if (!chat || !currentUser) {
     return (
        <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-4 bg-background">
          <MessageCircle className="w-24 h-24 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">Select a chat</p>
          <p className="text-sm text-muted-foreground">Choose a conversation from the list to start chatting</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <ChatHeader participant={otherParticipant} />
      
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