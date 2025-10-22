import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
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
  typingUsers: new Map(),
  error: null,
  socketConnected: false
};

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
      if (state.activeChat && state.activeChat._id === action.payload.chatId) {
        const newMessage = action.payload.message;
        const targetChatId = action.payload.chatId;

        // Check if message already exists (prevent duplicates)
        const messageExists = state.messages.some(msg => {
          if (msg._id && newMessage._id && msg._id === newMessage._id) {
            return true;
          }
          if (msg.text === newMessage.text &&
            Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000) {
            return true;
          }
          return false;
        });

        if (messageExists) {
          return state;
        }

        const updatedMessages = [...state.messages, newMessage];

        return {
          ...state,
          messages: updatedMessages,
          activeChat: state.activeChat && state.activeChat._id === targetChatId ? {
            ...state.activeChat,
            messages: updatedMessages,
          } : state.activeChat
        };
      }
      return state;
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
      const currentTyping = state.typingUsers.get(action.payload.chatId) || new Set();
      currentTyping.add(action.payload.userId);
      return {
        ...state,
        typingUsers: new Map(state.typingUsers.set(action.payload.chatId, currentTyping))
      };
    case 'REMOVE_TYPING_USER':
      const chatTyping = state.typingUsers.get(action.payload.chatId);
      if (chatTyping) {
        chatTyping.delete(action.payload.userId);
        if (chatTyping.size === 0) {
          state.typingUsers.delete(action.payload.chatId);
        }
      }
      return { ...state, typingUsers: new Map(state.typingUsers) };
    case 'SET_SOCKET_CONNECTED': return { ...state, socketConnected: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'CLEAR_ERROR': return { ...state, error: null };
    default: return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const lastLoadedChatRef = useRef({});
  const CACHE_DURATION = 3000;
  const { data: currentUser } = useMe();
  const typingTimeoutRef = useRef({});
  const listenersSetupRef = useRef(false);
  const stateRef = useRef(state);

  // Keep ref updated to avoid stale closures
  useEffect(() => { stateRef.current = state; }, [state]);

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {
    const token = getTokenFromStorage();

    if (!token) {
      listenersSetupRef.current = false;
      return;
    }

    if (!currentUser) {
      return;
    }

    const initSocket = async () => {
      try {
        if (socketService.isConnected) {
          dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
          socketService.setOnline();
          setupListeners();
          listenersSetupRef.current = true;
          return;
        }

        setupListeners();
        await socketService.connect();
        dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
        listenersSetupRef.current = true;
        socketService.setOnline();
        await loadChats();
      } catch (err) {
        console.error('❌ Socket init failed:', err);
        dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
        listenersSetupRef.current = false;
      }
    };

    initSocket();

    return () => {
      listenersSetupRef.current = false;
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('new-message');
      socketService.off('user-typing');
      socketService.off('user-stop-typing');
      socketService.off('user-status');
      socketService.off('messages-read');
      socketService.off('join-chat');
      socketService.off('message-notification');
      socketService.off('chat-loaded');
      socketService.off('error');

      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
      typingTimeoutRef.current = {};

      socketService.disconnect();
      dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
    };
  }, [currentUser]);

  // ---------------- LISTENERS (IDEMPOTENT) ----------------
  const setupListeners = useCallback(() => {
    socketService.off('connect');
    socketService.off('disconnect');
    socketService.off('new-message');
    socketService.off('user-typing');
    socketService.off('user-stop-typing');
    socketService.off('user-status');
    socketService.off('messages-read');
    socketService.off('join-chat');
    socketService.off('message-notification');
    socketService.off('chat-loaded');
    socketService.off('error');

    socketService.on('connect', () => {
      dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
      socketService.setOnline();
    });

    socketService.on('disconnect', () => {
      dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
    });

    socketService.on('new-message', ({ chatId, message }) => {
      const currentState = stateRef.current;
      const messageSenderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
      const currentUserId = currentUser?.id;
      const isOwnMessage = messageSenderId === currentUserId;

      if (currentState.activeChat && currentState.activeChat._id === chatId) {
        if (isOwnMessage) {
          const tempMsgIndex = currentState.messages.findIndex(m =>
            m.temp &&
            m.text === message.text &&
            Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 5000
          );

          if (tempMsgIndex !== -1) {
            const updatedMessages = [...currentState.messages];
            updatedMessages[tempMsgIndex] = {
              ...message,
              _id: message._id || message.id,
              temp: false
            };

            dispatch({
              type: 'SET_ACTIVE_CHAT',
              payload: {
                ...currentState.activeChat,
                messages: updatedMessages
              }
            });
          } else {
            const messageExists = currentState.messages.some(m =>
              m._id === message._id ||
              (m.text === message.text && !m.temp)
            );

            if (!messageExists) {
              dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
            }
          }
        } else {
          const messageExists = currentState.messages.some(m => m._id === message._id);

          if (!messageExists) {
            dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
          }
        }
      }

      dispatch({
        type: 'UPDATE_CHAT',
        payload: {
          chatId,
          updates: {
            lastMessage: message.text,
            lastMessageAt: message.timestamp || new Date(),
            lastMessageRead: currentState.activeChat && currentState.activeChat._id === chatId
          }
        }
      });

      const active = currentState.activeChat;
      if (!isOwnMessage && (!active || active._id !== chatId)) {
        const prev = currentState.unreadCounts[chatId] || 0;
        dispatch({
          type: 'UPDATE_UNREAD_COUNT',
          payload: { chatId, count: prev + 1 }
        });
      }
    });

    socketService.on('user-typing', ({ userId, chatId }) => {
      dispatch({ type: 'ADD_TYPING_USER', payload: {userId, chatId} });

      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }

      typingTimeoutRef.current[userId] = setTimeout(() => {
        dispatch({ type: 'REMOVE_TYPING_USER', payload: userId });
        delete typingTimeoutRef.current[userId];
      }, 3000);
    });

    socketService.on('user-stop-typing', ({ userId }) => {
      dispatch({ type: 'REMOVE_TYPING_USER', payload: userId });

      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
        delete typingTimeoutRef.current[userId];
      }
    });

    socketService.on('user-status', ({ userId, isOnline, lastActive }) => {
      const currentState = stateRef.current;

      currentState.chats.forEach(chat => {
        const updatedParticipants = chat.participants.map(p =>
          p._id === userId ? { ...p, isOnline, lastActive } : p
        );

        if (updatedParticipants.some(p => p._id === userId)) {
          dispatch({
            type: 'UPDATE_CHAT',
            payload: {
              chatId: chat._id,
              updates: { participants: updatedParticipants }
            }
          });
        }
      });
    });

    socketService.on('messages-read', ({ chatId }) => {
      const currentState = stateRef.current;

      // Update both activeChat and global messages state
      const updateReadStatus = (messages) => {
        return messages.map(msg => {
          // Handle both socket (object) and API (populated) sender formats
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
          if (senderId && currentUser?.id && senderId !== currentUser.id && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        });
      };

      if (currentState?.activeChat && currentState?.activeChat._id === chatId) {
        dispatch({
          type: 'SET_ACTIVE_CHAT',
          payload: {
            ...currentState.activeChat,
            messages: updateReadStatus(currentState.activeChat.messages)
          }
        });
      }

      // Also update global messages state for consistency
      if (currentState?.messages && currentState?.messages.length > 0) {
        dispatch({
          type: 'UPDATE_MESSAGES',
          payload: updateReadStatus(currentState.messages)
        });
      }
      dispatch({
        type: 'UPDATE_UNREAD_COUNT',
        payload: { chatId, count: 0 }
      });
    });

    socketService.on('message-notification', ({ chatId, senderId, text }) => {
      const currentState = stateRef.current;
      const prev = currentState.unreadCounts[chatId] || 0;
      dispatch({
        type: 'UPDATE_UNREAD_COUNT',
        payload: { chatId, count: prev + 1 }
      });
    });

    socketService.on('error', ({ message }) => {
      console.error('❌ [FRONTEND] RECEIVED socket error:', message);
      dispatch({ type: 'SET_ERROR', payload: message });
    });
  }, [currentUser]);

  // ---------------- API FUNCTIONS (Memoized) ----------------

  const loadChats = useCallback(async (page = 1, limit = 20) => {
    try {
      dispatch({ type: 'SET_LOADING_CHATS', payload: true });

      const currentState = stateRef.current;
      const res = await chatApi.getChats();

      if (res.success) {
        const chats = res.data.chats || [];

        const mergedChats = chats.map(apiChat => {
          const existingChat = currentState.chats.find(c => c._id === apiChat._id);

          if (existingChat) {
            return {
              ...apiChat,
              messages: existingChat.messages && existingChat.messages.length > 0
                ? existingChat.messages
                : apiChat.messages || [],
              participants: existingChat.participants || apiChat.participants,
              lastMessage: existingChat.lastMessageAt > apiChat.lastMessageAt
                ? existingChat.lastMessage
                : apiChat.lastMessage,
              lastMessageAt: existingChat.lastMessageAt > apiChat.lastMessageAt
                ? existingChat.lastMessageAt
                : apiChat.lastMessageAt
            };
          }

          return apiChat;
        });

        dispatch({ type: 'SET_CHATS', payload: mergedChats });

        if (stateRef.current.socketConnected) {
          const activeChat = currentState.activeChat;
          if (activeChat) {
            socketService.joinChat(activeChat._id);
          }
        }

        await loadUnreadCounts();
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Error loading chats:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING_CHATS', payload: false });
    }
  }, [currentUser?.id]);

  const loadUnreadCounts = useCallback(async () => {
    try {
      const res = await chatApi.getUnreadCount();
      if (res.success) {
        const unreadCountsObj = {};
        res.data.forEach(item => {
          unreadCountsObj[item._id] = item.count;
        });
        dispatch({ type: 'SET_UNREAD_COUNTS', payload: unreadCountsObj });
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Failed to load unread counts:', err);
    }
  }, []);

  const loadChat = useCallback(async (chatId, forceReload = false) => {
    try {
      const now = Date.now();
      const lastLoaded = lastLoadedChatRef.current[chatId];

      if (!forceReload && lastLoaded && (now - lastLoaded) < CACHE_DURATION) {
        if (stateRef.current.socketConnected) {
          socketService.joinChat(chatId);
        }
        await markMessagesAsRead(chatId);
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      const currentState = stateRef.current;

      // Handle both cases: prioritize activeChat.messages, fallback to global messages
      const existingMessages = currentState.activeChat?._id === chatId
        ? (currentState.activeChat.messages || currentState.messages || [])
        : (currentState.messages || []);


      const res = await chatApi.getChatById(chatId);

      if (res.success) {
        const chatData = res.data.chat;
        const apiMessages = chatData.messages || [];

        let mergedMessages = [];

        if (existingMessages.length > 0) {
          const apiMessageMap = new Map();
          apiMessages.forEach(msg => {
            if (msg._id) {
              apiMessageMap.set(msg._id.toString(), msg);
            }
          });

          const usedApiMessageIds = new Set();

          mergedMessages = existingMessages.map(existingMsg => {
            if (existingMsg.temp) {
              return null;
            }

            const msgId = existingMsg._id?.toString();
            if (msgId && apiMessageMap.has(msgId)) {
              usedApiMessageIds.add(msgId);
              return apiMessageMap.get(msgId);
            }

            return existingMsg;
          }).filter(msg => msg !== null);

          apiMessages.forEach(apiMsg => {
            const apiMsgId = apiMsg._id?.toString();
            if (apiMsgId && !usedApiMessageIds.has(apiMsgId)) {
              const alreadyExists = mergedMessages.some(m =>
                m._id?.toString() === apiMsgId ||
                (m.text === apiMsg.text &&
                  Math.abs(new Date(m.timestamp) - new Date(apiMsg.timestamp)) < 1000)
              );

              if (!alreadyExists) {
                mergedMessages.push(apiMsg);
              }
            }
          });

          mergedMessages.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
          );
        } else {
          mergedMessages = apiMessages;
        }

        const mergedChat = {
          ...chatData,
          messages: mergedMessages
        };

        dispatch({ type: 'SET_ACTIVE_CHAT', payload: mergedChat });

        if (stateRef.current.socketConnected) {
          socketService.joinChat(chatId);
        }

        await markMessagesAsRead(chatId);
        dispatch({
          type: 'UPDATE_CHAT',
          payload: {
            chatId,
            updates: {
              lastMessageRead: true
            }
          }
        });
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Error loading chat:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [currentUser?.id]);

  const createOrGetChat = useCallback(async (participantId, exchangeId = null) => {
    try {
      const res = await chatApi.createOrGetChat(participantId, exchangeId);
      if (res.success) {
        dispatch({ type: 'ADD_CHAT', payload: res.data.chat });
        return res.data.chat;
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [currentUser?.id]);

  const searchChats = useCallback(async (query) => {
    try {
      const res = await chatApi.searchChats(query);
      return res;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const joinChat = useCallback((chatId) => {
    if (stateRef.current.socketConnected) {
      socketService.joinChat(chatId);
      markMessagesAsRead(chatId);
    } else {
      dispatch({ type: 'SET_PENDING_CHAT_JOIN', payload: chatId });
    }
  }, [currentUser?.id]);

  const leaveChat = useCallback((chatId) => {
    if (stateRef.current.socketConnected) {
      socketService.leaveChat(chatId);
    }
  }, []);

  const sendMessage = useCallback(async (chatId, text, messageType = 'text', fileData = null) => {
    try {
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
        socketService.joinChat(chatId);
        socketService.sendMessage(chatId, text, messageType, fileData, currentUser?.id);

        dispatch({
          type: 'UPDATE_CHAT',
          payload: {
            chatId,
            updates: {
              lastMessage: text,
              lastMessageAt: new Date(),
              lastMessageRead: false
            }
          }
        });
      } else {
        const res = await chatApi.sendMessage(chatId, text, messageType, fileData);
        if (res.success) {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { messageId: tempMsg._id, updates: res.data.message }
          });
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
  }, [currentUser?.id]);

  const startTyping = useCallback((chatId) => {
    if (stateRef.current.socketConnected) {
      socketService.joinChat(chatId);
      socketService.startTyping(chatId);
    }
  }, []);

  const stopTyping = useCallback((chatId) => {
    if (stateRef.current.socketConnected) {
      socketService.joinChat(chatId);
      socketService.stopTyping(chatId);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (chatId) => {
    try {
      if (!currentUser?.id) {
        console.warn('markMessagesAsRead: currentUser not available');
        return;
      }

      // Only mark messages as read if this is the currently active chat
      const currentState = stateRef.current;
      if (!currentState.activeChat || currentState.activeChat._id !== chatId) {
        console.warn(`markMessagesAsRead: Chat ${chatId} is not the active chat`);
        return;
      }

      // Helper function to update read status consistently
      const updateReadStatus = (messages) => {
        return messages.map(msg => {
          // Handle both socket (object) and API (populated) sender formats consistently
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
          if (senderId && currentUser?.id && senderId !== currentUser.id && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        });
      };

      // Update both activeChat and global messages state for consistency
      const updatedMessages = updateReadStatus(currentState.activeChat.messages || currentState.messages || []);

      // Update activeChat state
      dispatch({
        type: 'SET_ACTIVE_CHAT',
        payload: {
          ...currentState.activeChat,
          messages: updatedMessages
        }
      });

      // Update global messages state for consistency
      if (currentState?.messages && currentState?.messages.length > 0) {
        dispatch({
          type: 'UPDATE_MESSAGES',
          payload: updateReadStatus(currentState.messages)
        });
      }

      // Mark as read in backend (try socket first, fallback to API)
      try {
        if (stateRef.current.socketConnected) {
          socketService.markMessagesAsRead(chatId);
        } else {
          await chatApi.markMessagesAsRead(chatId);
        }
      } catch (socketError) {
        console.warn('Socket mark as read failed, trying API:', socketError);
        try {
          await chatApi.markMessagesAsRead(chatId);
        } catch (apiError) {
          console.error('Both socket and API mark as read failed:', apiError);
        }
      }

      // Update unread count
      dispatch({
        type: 'UPDATE_UNREAD_COUNT',
        payload: { chatId, count: 0 }
      });

    } catch (err) {
      console.error('❌ [FRONTEND] Failed to mark messages as read:', err);
    }
  }, [currentUser?.id]);

  // Memoize the actions object to prevent recreation
  const actions = useMemo(() => ({
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
  }), [
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
  ]);

  // Memoize the context value
  const value = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};