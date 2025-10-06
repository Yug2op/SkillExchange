import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
import { getChat } from '@/api/ChatApi'; // ✅ new API for /api/chat/:id
import { useMe } from '@/hooks/useMe';

export default function ChatWindow() {
    const {

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
    } = useChat();

    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [otherUser, setOtherUser] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [lastActive, setlastActive] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef();
    const { data: meData } = useMe();

    useEffect(() => {
        if (!socket || !activeChat?._id) return;

        const handleUserTyping = ({ userId, chatId }) => {
            if (chatId !== activeChat._id) return;
            // Update typingUsers state
            setTyping(prev => ({
                ...prev,
                [chatId]: [...new Set([...(prev[chatId] || []), userId])]
            }));
        };

        const handleUserStopTyping = ({ userId, chatId }) => {
            if (chatId !== activeChat._id) return;
            setTyping(prev => ({
                ...prev,
                [chatId]: (prev[chatId] || []).filter(id => id !== userId)
            }));
        };

        socket.on('user-typing', handleUserTyping);
        socket.on('user-stop-typing', handleUserStopTyping);

        return () => {
            socket.off('user-typing', handleUserTyping);
            socket.off('user-stop-typing', handleUserStopTyping);
        };
    }, [socket, activeChat?._id]);

    useEffect(() => {
        if (!activeChat?._id || !meData?._id) return;

        // Mark messages as read when:
        // 1. Chat becomes active (activeChat changed)
        // 2. New messages arrive (messages length changed)
        const unreadMessages = messages.filter(msg => !msg.read && msg.sender?._id !== meData._id);
        if (unreadMessages.length > 0) {
            markAsRead(activeChat._id);
        }
    }, [activeChat?._id, messages.length, meData?._id]);



    useEffect(() => {
        if (!activeChat?._id || !joinChat) return;
        joinChat(activeChat._id);
        return () => socket?.emit('leave-chat', activeChat._id);
    }, [activeChat?._id]);




    useEffect(() => {
        if (!socket || !otherUser?._id) return;

        const handleStatusUpdate = ({ userId, isOnline, lastSeen }) => {
            if (userId === otherUser._id) {
                setIsOnline(isOnline);
                setlastActive(lastSeen
                    ? formatDistanceToNow(new Date(lastSeen), { addSuffix: true })
                    : '');
            }
        };

        socket.on('user-status', handleStatusUpdate);

        return () => socket.off('user-status', handleStatusUpdate);
    }, [socket, otherUser?._id]);




        const handleTyping = () => {
        // Add null checks before emitting socket events
        if (!socket || !activeChat?._id) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { chatId: activeChat._id });
        }

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('stop-typing', { chatId: activeChat._id });
        }, 3000);
    };

    // ✅ Fetch chat data whenever activeChat changes
    useEffect(() => {
        const fetchChatDetails = async () => {
            if (!activeChat?._id) return;
            try {
                const res = await getChat(activeChat._id);
                const chat = res?.data?.chat;
                if (chat) {
                    setMessages(chat.messages || []);
                    const user = (chat.participants || []).find(
                        (p) => p._id !== meData?._id
                    );

                    setOtherUser(user);

                    // Mark messages as read when chat is viewed
                    if (chat.messages?.length > 0) {
                        markAsRead(activeChat._id);
                    }

                    if (user?.lastActive) {
                        const diffMs = Date.now() - new Date(user.lastActive).getTime();
                        const isUserOnline = diffMs < 2 * 60 * 1000;
                        setIsOnline(isUserOnline);
                        if (!isUserOnline) {
                            setlastActive(formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }));
                        }
                    }
                }
                scrollToBottom();
            } catch (err) {
                console.error('Error fetching chat:', err);
            }
        };

        fetchChatDetails();
    }, [activeChat?._id, markAsRead]);

    // ✅ Scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getMessageTime = (message) => {
        const date = new Date(message.timestamp || message.createdAt);
        return isNaN(date) ? '' : format(date, 'h:mm a');
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Sort messages by timestamp to ensure correct order
    const sortedMessages = [...(messages || [])].sort((a, b) => {
        return new Date(a.timestamp || a.createdAt || Date.now()) - new Date(b.timestamp || b.createdAt);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChat) return;

        // Don't add temporary message, wait for socket response
        setMessageText('');

        // Send the message via WebSocket
        sendMessage(activeChat._id, messageText.trim(), otherUser?._id);

        // Clear typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            setTyping(activeChat._id, false);
        }

        // Scroll to bottom to show the new message
        scrollToBottom();
    };

    const handleKeyDown = () => {
        if (!typingTimeoutRef.current) {
            setTyping(activeChat._id, true);
        } else {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTyping(activeChat._id, false);
            typingTimeoutRef.current = null;
        }, 2000);
    };

    if (!activeChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Select a chat to start messaging</h3>
                    <p className="mt-1 text-sm text-gray-500">Or start a new conversation</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="flex-shrink-0 relative">
                    <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={otherUser?.profilePic?.url || '/default-avatar.png'}
                        alt={otherUser?.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{otherUser?.name}</p>
                    <p className="text-xs text-gray-500">
                        {typingUsers[activeChat._id]?.length > 0
                            ? 'typing...'
                            : isOnline
                                ? 'Online'
                                : lastActive
                                    ? `Last seen ${lastActive}`
                                    : ''}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sortedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    sortedMessages.map((message, index) => (
                        <div
                            key={message?._id || `message-${index}`}
                            className={`flex ${message.sender?._id === meData?._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${message.sender?._id === meData?._id
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                    }`}
                            >
                                <p className="text-sm pr-10 break-words whitespace-pre-wrap">
                                    {message.text}
                                </p>
                                <span
                                    className={`absolute bottom-1 right-1.5 text-xs opacity-80 ${message.sender?._id === meData?._id ? 'text-primary-100' : 'text-gray-500'}`}
                                >
                                    {getMessageTime(message)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => { setMessageText(e.target.value); if (socket && activeChat?._id) handleTyping(); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
