import React, { useState, useMemo, useRef } from 'react';
import { useMe } from '../../hooks/useMe.js';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  X,
  MessageCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const ChatList = ({ onChatSelect, selectedChatId, state, actions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const searchInputRef = useRef(null);
  const { data: currentUser } = useMe();

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        // ✅ Call search API and update results
        const response = actions.searchChats(query);
        if (response?.success) {
          setSearchResults(response.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults(null);
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
      setSearchResults(null);
      actions.loadChats();
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchResults) {
      return state.chats;
    }

    return state.chats.filter(chat => {
      return searchResults.some(searchResult =>
        searchResult._id === chat._id
      );
    });
  }, [state.chats, searchResults]);

  // Format timestamp like Telegram
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
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
    if (!chat || !Array.isArray(chat.participants)) return null;

    try {
      if (!currentUser || !currentUser.id) return null;
      const currentUserId = currentUser.id;
      return chat.participants.find(p => p?._id !== currentUserId) || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const unreadCounts = state.unreadCounts;
  const chats = state.chats;

  // Use useMemo to optimize re-renders
  const chatItems = useMemo(() => {
    return filteredChats?.map((chat) => {
      const otherParticipant = getOtherParticipant(chat);
      const unreadCount = unreadCounts[chat._id] || 0;
      const isSelected = selectedChatId === chat._id;

      return {
        chat,
        otherParticipant,
        unreadCount,
        isSelected,
        key: chat._id
      };
    });
  }, [chats, state.unreadCounts, selectedChatId]);

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
          Messages
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSearch}
          className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
          title={showSearch ? 'Close search' : 'Search chats'}
        >
          {showSearch ? (
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </Button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 sm:p-4 border-b border-border bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-9 h-9 sm:h-10 text-sm sm:text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSearch('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              {filteredChats.length === 0 ? 'No conversations found' : `${filteredChats.length} conversation${filteredChats.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {state.loadingChats && (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary mb-3" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading conversations...</p>
        </div>
      )}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {state.chats.length === 0 && !state.loadingChats ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 text-center">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-muted-foreground/30 mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-medium text-foreground">No conversations yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                Start a conversation with someone!
              </p>
            </div>
          ) : (
            chatItems?.map(({ chat, otherParticipant, unreadCount, isSelected, key }) => {
              if (!otherParticipant) return null;

              return (
                <div
                  key={key}
                  onClick={() => handleChatClick(chat)}
                  className={`
                    flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer transition-colors
                    hover:bg-accent/50
                    ${isSelected ? 'bg-accent border-l-4 border-primary' : ''}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage
                        src={otherParticipant.profilePic?.url}
                        alt={otherParticipant.name}
                      />
                      <AvatarFallback className="text-sm sm:text-base">
                        {otherParticipant.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {otherParticipant?.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                    {!otherParticipant?.isOnline && otherParticipant?.lastActive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 border-2 border-background rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5 sm:mb-1">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                        {otherParticipant.name || 'Unknown User'}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                        {chat.lastMessageAt ? formatTime(chat.lastMessageAt) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1">
                        {chat.lastMessage ? truncateMessage(chat.lastMessage) : 'No messages yet'}
                      </p>

                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="h-5 min-w-[20px] px-1.5 text-[10px] sm:text-xs font-semibold flex-shrink-0"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* Exchange Indicator */}
                    {chat.exchange && (
                      <div className="flex items-center gap-1 mt-1 sm:mt-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] sm:text-xs h-5 px-2 gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          Exchange
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Load More Button */}
      {state.hasMoreChats && !searchQuery && (
        <div className="p-3 sm:p-4 border-t border-border">
          <Button
            onClick={() => actions.loadChats(state.currentPage + 1, true)}
            disabled={state.loadingChats}
            className="w-full"
            variant="outline"
          >
            {state.loadingChats ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatList);