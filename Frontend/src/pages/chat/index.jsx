import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import ChatList from '../../components/chat/ChatList.jsx';
import ChatWindow from '../../components/chat/ChatWindow.jsx';
import { searchUsers } from '../../api/UserApi.js';
import { useMe } from '../../hooks/useMe.js';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Loader2,
  X,
  ArrowLeft,
  Edit3,
  AlertCircle,
  Search,
} from 'lucide-react';

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { state, actions } = useChat();
  const { data: currentUser } = useMe();

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
        const filteredUsers = response.data?.users.filter((user) => {
          const isCurrentUser = user?._id === currentUser?.id;
          const alreadyInChat = state.chats.some((chat) =>
            chat.participants.some((p) => p._id === user._id)
          );
          return !isCurrentUser && !alreadyInChat;
        });
        setSearchResults(filteredUsers);
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Panel */}
        <div
          className={`
            w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border
            transition-transform duration-300 ease-in-out
            ${isMobile && showMobileChat ? '-translate-x-full absolute inset-0 z-10' : 'translate-x-0'}
            md:relative md:translate-x-0
          `}
        >
          <ChatList 
            onChatSelect={handleChatSelect} 
            selectedChatId={selectedChatId} 
            state={state} 
            actions={actions} 
          />
        </div>

        {/* Chat Window Panel */}
        <div
          className={`
            flex-1 flex flex-col
            transition-transform duration-300 ease-in-out
            ${isMobile && !showMobileChat ? 'translate-x-full absolute inset-0' : 'translate-x-0'}
            md:relative md:translate-x-0
          `}
        >
          {selectedChatId && selectedChat ? (
            <div className="flex flex-col h-full">
              {/* Mobile Back Button */}
              {isMobile && (
                <div className="flex items-center gap-2 p-3 bg-primary text-primary-foreground md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToChatList}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm font-medium">Back to conversations</span>
                </div>
              )}

              <ChatWindow 
                chatId={selectedChatId} 
                chat={selectedChat} 
                state={state} 
                actions={actions} 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20 p-4">
              <div className="text-center max-w-md space-y-6">
                <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-muted-foreground/30" />
                
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Select a conversation
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setShowNewChatModal(true)}
                    size="lg"
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileChat && (
        <div 
          className="fixed inset-0 bg-black/50 z-[5] md:hidden"
          onClick={handleBackToChatList}
        />
      )}

      {/* Loading Overlay */}
      {state.loading && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading...</p>
        </div>
      )}

      {/* New Chat Modal */}
      <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
            <DialogTitle className="text-lg sm:text-xl">Start New Chat</DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 py-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users by name, skills, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 sm:h-11"
              />
            </div>

            {/* Search Loading */}
            {searchLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && !searchLoading && (
              <ScrollArea className="h-[300px] sm:h-[350px] pr-4">
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarImage 
                          src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-foreground truncate">
                          {user.name}
                        </p>
                        {user.skillsToTeach?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                              Teaches: {user.skillsToTeach.slice(0, 2).map(s => s.skill).join(', ')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* No Results */}
            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  No users found matching "{searchQuery}"
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {/* Empty State */}
            {!searchQuery && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Search for users to start a new conversation
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Banner */}
      {state.error && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3 p-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs mt-0.5 opacity-90">{state.error}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={actions.clearError}
              className="h-6 w-6 flex-shrink-0 hover:bg-destructive-foreground/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;