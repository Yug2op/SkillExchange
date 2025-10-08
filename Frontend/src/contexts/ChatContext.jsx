import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import chatApi from '../api/ChatApi.js';
import socketService from '../../lib/socket.js';
import { useMe } from '../hooks/useMe.js';

// Add this helper function to get token from storage
const getTokenFromStorage = () => {
  if (typeof window === 'undefined') return null;
  const session = sessionStorage.getItem('socketToken');
  if (session) return session;
  const local = localStorage.getItem('socketToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
  if (local) return local;
  return null;
};

const ChatContext = createContext();

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  sendingMessage: false,
  loadingChats: false,
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  hasMoreChats: true,
  unreadCounts: {},
  showChatList: true,
  typingUsers: new Set(),
  error: null,
  socketConnected: false
};

// console.log("Hello",initialState.socketConnected);


const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_LOADING_CHATS': return { ...state, loadingChats: action.payload };
    case 'SET_SENDING_MESSAGE': return { ...state, sendingMessage: action.payload };
    case 'SET_CHATS': return { ...state, chats: action.payload, loadingChats: false, error: null };
    case 'ADD_CHAT':
      const exists = state.chats.find(c => c._id === action.payload._id);
      return exists
        ? { ...state, chats: state.chats.map(c => (c._id === action.payload._id ? action.payload : c)) }
        : { ...state, chats: [action.payload, ...state.chats] };
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat._id === action.payload.chatId
            ? { ...chat, ...action.payload.updates }
            : chat
        )
      };
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.payload, messages: action.payload?.messages || [] };
    case 'ADD_MESSAGE':
      return state.activeChat && state.activeChat._id === action.payload.chatId
        ? { ...state, messages: [...state.messages, action.payload.message] }
        : state;
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload.messageId
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    case 'SET_UNREAD_COUNTS': return { ...state, unreadCounts: action.payload };
    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.chatId]: action.payload.count
        }
      };
    case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
    case 'SET_SHOW_CHAT_LIST': return { ...state, showChatList: action.payload };
    case 'ADD_TYPING_USER':
      return { ...state, typingUsers: new Set([...state.typingUsers, action.payload]) };
    case 'REMOVE_TYPING_USER':
      const newTyping = new Set(state.typingUsers);
      newTyping.delete(action.payload);
      return { ...state, typingUsers: newTyping };
    case 'SET_SOCKET_CONNECTED': return { ...state, socketConnected: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'CLEAR_ERROR': return { ...state, error: null };
    default: return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { data: currentUser } = useMe();
  const typingTimeoutRef = useRef({});
  const listenersSetupRef = useRef(false);
  const stateRef = useRef(state);


  // keep ref updated to avoid stale closures
  useEffect(() => { stateRef.current = state; }, [state]);

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {

    const token = getTokenFromStorage();

    if (!token) {
      console.log("Auth token not found in storage");
      listenersSetupRef.current = false;
      return;
    }

    if (!currentUser) {
      return;
    }

    const initSocket = async () => {
      try {
        console.log('🔌 Initializing socket connection...');

        // Check if already connected first
        if (socketService.isConnected) {
          console.log('🔗 Socket already connected, reusing...');
          dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
          socketService.setOnline();
          setupListeners();
          listenersSetupRef.current = true;
          return;
        }

        // Setup listeners BEFORE connecting
        setupListeners();

        // Connect if not already connected
        await socketService.connect();

        console.log('✅ Socket connected, updating state...');
        dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
        listenersSetupRef.current = true;
        socketService.setOnline();

        // Load initial data
        await loadChats(); // This will also load unread counts 

      } catch (err) {
        console.error('❌ Socket init failed:', err);
        dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
        listenersSetupRef.current = false;
      }
    };

    initSocket();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection...');
      listenersSetupRef.current = false;

      // Clean up all socket service listeners
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('new-message');
      socketService.off('user-typing');
      socketService.off('user-stop-typing');
      socketService.off('user-status');

      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
      typingTimeoutRef.current = {};

      // Disconnect socket
      socketService.disconnect();
      dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
    };
  }, [currentUser]);

  // ---------------- LISTENERS (IDEMPOTENT) ----------------
  const setupListeners = useCallback(() => {
    // Make idempotent: always remove listeners before adding
    socketService.off('connect');
    socketService.off('disconnect');
    socketService.off('new-message');
    socketService.off('user-typing');
    socketService.off('user-stop-typing');
    socketService.off('user-status');

    // Use socketService.on() consistently for all events
    socketService.on('connect', () => {
      console.log('🔗 Socket service connected');
      dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
      socketService.setOnline();
    });

    socketService.on('disconnect', () => {
      console.log('🔌 Socket service disconnected');
      dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
    });

    socketService.on('new-message', ({ chatId, message }) => {
      console.log('📨 [FRONTEND] RECEIVED new-message event:', { chatId, message: message.text, sender: message.sender });

      // Use stateRef to access latest state (prevents stale closures)
      const currentState = stateRef.current;

      console.log('🔄 [FRONTEND] Processing new message in reducer...');
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
      console.log('✅ [FRONTEND] Message added to state');

      // Update chat preview
      console.log('🔄 [FRONTEND] Updating chat preview...');
      dispatch({
        type: 'UPDATE_CHAT',
        payload: { chatId, updates: { lastMessage: message.text, lastMessageAt: message.timestamp } }
      });
      console.log('✅ [FRONTEND] Chat preview updated');

      // Update unread count if not active chat
      // console.log("CurrentState",currentState)
      const active = currentState.activeChat;
      if (!active || active._id !== chatId) {
        const prev = currentState.unreadCounts[chatId] || 0;
        console.log(`🔢 [FRONTEND] Updating unread count: ${prev} → ${prev + 1}`);
        dispatch({ type: 'UPDATE_UNREAD_COUNT', payload: { chatId, count: prev + 1 } });
        console.log('✅ [FRONTEND] Unread count updated');
      } else {
        console.log('👁️ [FRONTEND] Message received in active chat, no unread update needed');
      }
    });

    socketService.on('user-typing', ({ userId }) => {
      console.log('⌨️ [FRONTEND] RECEIVED user-typing event for user:', userId);
      console.log('🔄 [FRONTEND] Adding user to typing list...');
      dispatch({ type: 'ADD_TYPING_USER', payload: userId });
      console.log('✅ [FRONTEND] User added to typing list');

      // Clear existing timeout for this user
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }

      // Set new timeout
      typingTimeoutRef.current[userId] = setTimeout(() => {
        console.log('⏰ [FRONTEND] Typing timeout reached for user:', userId);
        dispatch({ type: 'REMOVE_TYPING_USER', payload: userId });
        delete typingTimeoutRef.current[userId];
        console.log('✅ [FRONTEND] User removed from typing list (timeout)');
      }, 3000);
    });

    socketService.on('user-stop-typing', ({ userId }) => {
      console.log('🛑 [FRONTEND] RECEIVED user-stop-typing event for user:', userId);
      console.log('🔄 [FRONTEND] Removing user from typing list...');
      dispatch({ type: 'REMOVE_TYPING_USER', payload: userId });
      console.log('✅ [FRONTEND] User removed from typing list');

      // Clear timeout for this user
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
        delete typingTimeoutRef.current[userId];
        console.log('🧹 [FRONTEND] Typing timeout cleared');
      }
    });

    socketService.on('user-status', ({ userId, isOnline, lastActive }) => {
      console.log('👤 [FRONTEND] RECEIVED user-status event:', {
        userId,
        isOnline,
        lastActive: lastActive ? new Date(lastActive).toLocaleTimeString() : 'none'
      });

      // Use stateRef to access latest state
      const currentState = stateRef.current;

      console.log('🔄 [FRONTEND] Updating user status in chats...');
      // Update user status in all chats that include this user
      currentState.chats.forEach(chat => {
        const updatedParticipants = chat.participants.map(p =>
          p._id === userId ? { ...p, isOnline, lastActive } : p
        );

        if (updatedParticipants.some(p => p._id === userId)) {
          console.log(`📝 [FRONTEND] Updated status for user ${userId} in chat ${chat._id}`);
          dispatch({
            type: 'UPDATE_CHAT',
            payload: {
              chatId: chat._id,
              updates: { participants: updatedParticipants }
            }
          });
        }
      });
      console.log('✅ [FRONTEND] User status updates completed');
    });
    // Listen for message read status updates
    socketService.on('messages-read', ({ chatId }) => {
      console.log('📖 [FRONTEND] RECEIVED messages-read event for chat:', chatId);

      // Update messages in the active chat to read=true
      const currentState = stateRef.current;

      if (currentState.activeChat && currentState.activeChat._id === chatId) {
        console.log('📝 [FRONTEND] Updating active chat messages to read=true');
        dispatch({
          type: 'SET_ACTIVE_CHAT',
          payload: {
            ...currentState.activeChat,
            messages: currentState.activeChat.messages.map(msg => ({ ...msg, read: true }))
          }
        });
      }

      // Reset unread count for this chat
      console.log('🔢 [FRONTEND] Resetting unread count to 0 for chat:', chatId);
      dispatch({
        type: 'UPDATE_UNREAD_COUNT',
        payload: { chatId, count: 0 }
      });

      console.log('✅ [FRONTEND] Messages marked as read and unread count reset');
    });

  }, []);

  // ---------------- API FUNCTIONS ----------------
  const loadChats = async () => {
    try {
      dispatch({ type: 'SET_LOADING_CHATS', payload: true });
      const res = await chatApi.getChats();
      if (res.success) {
        dispatch({ type: 'SET_CHATS', payload: res.data.chats || [] });
        // Load unread counts after loading chats
        await loadUnreadCounts();
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING_CHATS', payload: false });
    }
  };

  const loadUnreadCounts = async () => {
    try {
      console.log('📊 [FRONTEND] Loading unread counts...');
      const res = await chatApi.getUnreadCount();
      if (res.success) {
        // Convert array to object for easy lookup
        const unreadCountsObj = {};
        res.data.forEach(item => {
          unreadCountsObj[item._id] = item.count;
        });
        console.log('📊 [FRONTEND] Unread counts loaded:', unreadCountsObj);
        dispatch({ type: 'SET_UNREAD_COUNTS', payload: unreadCountsObj });
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Failed to load unread counts:', err);
    }
  };

  const loadChat = async (chatId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await chatApi.getChatById(chatId);
      if (res.success) {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: res.data.chat });
        // Join the chat room via socket
        if (stateRef.current.socketConnected) {
          socketService.joinChat(chatId);
        }
        // Mark messages as read when chat loads
        await markMessagesAsRead(chatId);
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createOrGetChat = async (participantId, exchangeId = null) => {
    try {
      const res = await chatApi.createOrGetChat(participantId, exchangeId);
      if (res.success) {
        // Add the new chat to the chats list if it doesn't exist
        dispatch({ type: 'ADD_CHAT', payload: res.data.chat });
        return res.data.chat;
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  };

  const searchChats = async (query) => {
    try {
      const res = await chatApi.searchChats(query);
      return res;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const joinChat = (chatId) => {
    console.log('🔄 [FRONTEND] Attempting to join chat:', chatId, 'Socket connected:', stateRef.current.socketConnected);
    if (stateRef.current.socketConnected) {
      console.log('📡 [FRONTEND] EMITTING join-chat event for:', chatId);
      socketService.joinChat(chatId);
      console.log('✅ [FRONTEND] join-chat event emitted');

    } else {
      console.log('📋 [FRONTEND] Storing pending chat join:', chatId);
      dispatch({ type: 'SET_PENDING_CHAT_JOIN', payload: chatId });
    }
  };

  const leaveChat = (chatId) => {
    if (stateRef.current.socketConnected) {
      socketService.leaveChat(chatId);
    }
  };

  const sendMessage = async (chatId, text, messageType = 'text', fileData = null) => {
    try {
      console.log('📤 [FRONTEND] SENDING message:', { chatId, text: text.substring(0, 50) + '...', messageType });

      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      const tempMsg = {
        _id: `temp_${Date.now()}`,
        sender: currentUser?.id,
        text,
        timestamp: new Date(),
        messageType,
        temp: true
      };
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message: tempMsg } });

      if (stateRef.current.socketConnected) {
        // Ensure user is in the chat room before sending
        console.log('🔗 [FRONTEND] Ensuring user is in chat room:', chatId);
        socketService.joinChat(chatId);

        console.log('📡 [FRONTEND] EMITTING send-message via socket');
        socketService.sendMessage(chatId, text, messageType, fileData);
        console.log('✅ [FRONTEND] send-message event emitted');

        // Update chat preview immediately (since we won't receive our own message via new-message event)
        console.log('🔄 [FRONTEND] Updating chat preview for sent message...');
        dispatch({
          type: 'UPDATE_CHAT',
          payload: {
            chatId,
            updates: {
              lastMessage: text,
              lastMessageAt: new Date()
            }
          }
        });
        console.log('✅ [FRONTEND] Chat preview updated for sent message');

      } else {
        console.log('🌐 [FRONTEND] Sending message via HTTP (socket not connected)');
        const res = await chatApi.sendMessage(chatId, text, messageType, fileData);
        if (res.success) {
          console.log('✅ [FRONTEND] Message sent via HTTP, updating UI');
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { messageId: tempMsg._id, updates: res.data.message }
          });
          // Update chat preview when sending via HTTP
          dispatch({
            type: 'UPDATE_CHAT',
            payload: {
              chatId,
              updates: {
                lastMessage: text,
                lastMessageAt: new Date()
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Failed to send message:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
    }
  };

  const startTyping = (chatId) => {
    console.log('⌨️ [FRONTEND] EMITTING typing start for chat:', chatId);
    if (stateRef.current.socketConnected) {
      // Ensure user is in the chat room before typing
      socketService.joinChat(chatId);
      socketService.startTyping(chatId);
      console.log('✅ [FRONTEND] typing event emitted');
    }
  };

  const stopTyping = (chatId) => {
    console.log('🛑 [FRONTEND] EMITTING typing stop for chat:', chatId);
    if (stateRef.current.socketConnected) {
      // Ensure user is in the chat room before stopping typing
      socketService.joinChat(chatId);
      socketService.stopTyping(chatId);
      console.log('✅ [FRONTEND] stop-typing event emitted');
    }
  };

  const markMessagesAsRead = async (chatId) => {
    try {
      if (stateRef.current.socketConnected) {
        console.log('📖 [FRONTEND] EMITTING mark-as-read for chat:', chatId);
        socketService.markMessagesAsRead(chatId);
        console.log('✅ [FRONTEND] mark-as-read event emitted');

        // Immediately update local state (optimistic update)
        console.log('🔄 [FRONTEND] Immediately updating local read status...');

        // Update active chat messages to read=true
        const currentState = stateRef.current;
        if (currentState.activeChat && currentState.activeChat._id === chatId) {
          dispatch({
            type: 'SET_ACTIVE_CHAT',
            payload: {
              ...currentState.activeChat,
              messages: currentState.activeChat.messages.map(msg => ({ ...msg, read: true }))
            }
          });
        }

        // Reset unread count immediately
        dispatch({
          type: 'UPDATE_UNREAD_COUNT',
          payload: { chatId, count: 0 }
        });

        console.log('✅ [FRONTEND] Local state updated optimistically');

      } else {
        console.log('🌐 [FRONTEND] Marking messages as read via HTTP');
        await chatApi.markMessagesAsRead(chatId);
        console.log('✅ [FRONTEND] Messages marked as read via HTTP');
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Failed to mark messages as read:', err);
    }
  };

  const value = {
    state,
    actions: {
      loadChats,
      loadChat,
      sendMessage,
      joinChat,
      leaveChat,
      createOrGetChat,
      searchChats,
      clearError,
      startTyping,
      stopTyping,
      markMessagesAsRead
    }
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
