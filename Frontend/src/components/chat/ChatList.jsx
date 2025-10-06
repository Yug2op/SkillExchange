import { useQuery } from '@tanstack/react-query';
import { getChats, getUnreadCount } from '@/api/ChatApi';
import { format, isValid } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
import { useMe } from '@/hooks/useMe';
import { useEffect } from 'react';

export default function ChatList() {
    const { data: currentUser } = useMe();
    const { data: chatsData, isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: getChats,
    });

    const { data: unreadCountData = {}, isLoading: unreadLoading, error: unreadError } = useQuery({
        queryKey: ['unread-count'],
        queryFn: getUnreadCount,
        select: (data) => data?.data?.reduce((acc, { _id, count }) => ({
            ...acc,
            [_id]: count
        }), {}) || {},
        refetchInterval: 30000,
        staleTime: 10000,
        retry: 3,
        onError: (error) => {
            console.error('Unread count query failed:', error);
        }
    });

    const { activeChat, setActiveChat, markAsRead } = useChat();

    // Debug logging
    useEffect(() => {
        console.log('Unread count data:', unreadCountData);
        console.log('Unread count error:', unreadError);
        console.log('Unread count loading:', unreadLoading);
    }, [unreadCountData, unreadError, unreadLoading]);

    const chats = chatsData?.data?.chats || [];

    // Enhanced debugging
    useEffect(() => {
        console.log('=== UNREAD COUNT DEBUG ===');
        console.log('Unread count data:', unreadCountData);
        console.log('Unread count error:', unreadError);
        console.log('Unread count loading:', unreadLoading);
        console.log('Number of chats:', chats.length);

        if (chats.length > 0) {
            console.log('Chat IDs:', chats.map(chat => chat._id));
            console.log('Unread count keys:', Object.keys(unreadCountData));

            chats.forEach(chat => {
                const count = unreadCountData?.[chat._id] || 0;
                console.log(`Chat ${chat._id}: unread count = ${count}`);
            });
        }
    }, [unreadCountData, chats]);

    if (isLoading) return <div className="p-4">Loading chats...</div>;
    if (isError) return <div className="p-4 text-red-600">Error loading chats</div>;

    const formatMessageTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isValid(date) ? format(date, 'h:mm a') : '';
    };



    

    return (
        <div className="border-r border-gray-200 w-80 flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <div className="divide-y divide-gray-200">
                {chats.length === 0 && (
                    <div className="p-4 text-gray-500 text-sm italic">No chats yet</div>
                )}

                {chats.map((chat) => {
                    // Find the other participant (not the current user)
                    const otherUser = chat.participants?.find(
                        (p) => p?._id && p._id !== currentUser?._id
                    );

                    // Get the last message object and details
                    const lastMessageObj = chat.messages?.[chat.messages.length - 1];
                    const lastMessageText = lastMessageObj?.text || chat?.lastMessage || '';
                    const lastMessageAt = lastMessageObj?.timestamp || chat?.lastMessageAt;
                    const isYou = lastMessageObj?.sender === currentUser?._id;
                    const unreadCount = unreadCountData?.[chat._id] || 0;

                    // Debug individual chat unread count
                    console.log(`Rendering chat ${chat._id} with unread count: ${unreadCount}`);
                    return (
                        <div
                            key={chat._id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${activeChat?._id === chat._id ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => {
                                setActiveChat(chat);
                                markAsRead(chat._id);
                            }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={otherUser?.profilePic?.url || '/default-avatar.png'}
                                        alt={otherUser?.name || 'User'}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {otherUser?.name || 'Unknown User'}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            {lastMessageAt && (
                                                <p className="text-xs text-gray-500">
                                                    {formatMessageTime(lastMessageAt)}
                                                </p>
                                            )}
                                            {unreadCount > 0 && (
                                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {lastMessageText ? (
                                        <p className="text-sm text-gray-500 truncate">
                                            {isYou ? 'You: ' : ''}
                                            {lastMessageText}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No messages yet</p>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
