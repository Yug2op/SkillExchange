// Frontend/src/contexts/ChatContext.jsx
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [userStatuses, setUserStatuses] = useState({}); // track online/offline
    const { data: meData } = useMe();
    const queryClient = useQueryClient();
    const socketRef = useRef(null);

    // Initialize Socket connection
    useEffect(() => {
        if (!meData?._id) return;

        const token = sessionStorage.getItem('socketToken');
        if (!token) return;

        const newSocket = io(import.meta.env.VITE_API_URL, {
            auth: { token },
            withCredentials: true,
            reconnectionAttempts: 3, // Limit reconnections
            reconnectionDelayMax: 5000
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server'),
                newSocket.emit('set-online')
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [meData?._id]);

    // Listen for socket events
    useEffect(() => {
        if (!socket || !meData?._id) return;

        // New message received - replace temporary messages
        const handleNewMessage = (message) => {
            if (activeChat?._id === message.chatId) {
                setMessages(prev => {
                    // Remove any temporary messages from the current user for this chat
                    const filteredMessages = prev.filter(msg =>
                        !(msg.isSending && msg.sender._id === message.sender._id)
                    );
                    // Add the real message
                    return [...filteredMessages, message];
                });
                markAsRead(message.chatId);
            } else {
                // Only invalidate if it's been more than 2 seconds since last invalidation
                const lastInvalidation = localStorage.getItem('lastUnreadInvalidation');
                const now = Date.now();
                if (!lastInvalidation || now - parseInt(lastInvalidation) > 2000) {
                    queryClient.invalidateQueries(['unread-count']);
                    localStorage.setItem('lastUnreadInvalidation', now.toString());
                }
                toast.info(`New message from ${message.senderName || 'someone'}`);
            }
        };

        socket.on('new-message', handleNewMessage);

        // Message read updates - only invalidate if needed
        const handleMessagesRead = ({ chatId }) => {
            if (activeChat?._id === chatId) {
                setMessages(prev => prev.map(msg => !msg.read ? { ...msg, read: true } : msg));
                // Only invalidate if there are still unread messages in other chats
                queryClient.invalidateQueries(['unread-count']);
            }
        };
        socket.on('messages-read', handleMessagesRead);

        // Typing indicators
        const handleUserTyping = ({ userId, chatId }) => {
            setTypingUsers(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []).filter(id => id !== userId), userId]
            }));
        };
        socket.on('user-typing', handleUserTyping);

        const handleUserStopTyping = ({ userId, chatId }) => {
            setTypingUsers(prev => ({
                ...prev,
                [chatId]: (prev[chatId] || []).filter(id => id !== userId)
            }));
        };
        socket.on('user-stop-typing', handleUserStopTyping);

        // User status updates
        const handleUserStatus = ({ userId, isOnline, lastActive }) => {
            setUserStatuses(prev => ({
                ...prev,
                [userId]: { isOnline, lastActive }
            }));
        };
        socket.on('user-status', handleUserStatus);

        // Optional toast for notifications
        socket.on('message-notification', ({ chatId, senderId, text }) => {
            if (activeChat?._id !== chatId && senderId !== meData?._id) {
                toast.info(`New message: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`, {
                    action: { label: 'View', onClick: () => setActiveChat({ _id: chatId }) }
                });
            }
        });

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('messages-read', handleMessagesRead);
            socket.off('user-typing', handleUserTyping);
            socket.off('user-stop-typing', handleUserStopTyping);
            socket.off('user-status', handleUserStatus);
            socket.off('message-notification');
        };
    }, [socket, activeChat, meData?._id, queryClient]);

    // Emit join chat
    const joinChat = (chatId) => {
        if (!socket) return;
        socket.emit('join-chat', chatId);
    };

    // Send message
    const sendMessage = (chatId, text, receiverId) => {
        if (!socket) return;
        socket.emit('send-message', { chatId, text, receiverId });
    };

    // Typing
    const setTyping = (chatId, isTyping) => {
        if (!socket) return;
        socket.emit(isTyping ? 'typing' : 'stop-typing', { chatId });
    };

    // Mark messages as read
    const markAsRead = useCallback((chatId) => {
        if (!socket || !chatId) return;
        socket.emit('mark-as-read', { chatId });
    }, [socket]);

    return (
        <ChatContext.Provider
            value={{
                socket,
                activeChat,
                setActiveChat,
                messages,
                setMessages,
                typingUsers,
                userStatuses,
                joinChat,
                sendMessage,
                setTyping,
                markAsRead,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
};
