import { useState } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import Layout from '@/components/Layout';

export default function ChatPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <Layout>
            <ChatProvider>
                <div className="flex h-[calc(100vh-64px)] bg-white rounded-lg shadow overflow-hidden">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="md:hidden fixed bottom-4 right-4 z-10 p-3 rounded-full bg-primary text-white shadow-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            )}
                        </svg>
                    </button>

                    {/* Chat list - hidden on mobile when chat is open */}
                    <div
                        className={`${isMobileMenuOpen ? 'hidden' : 'block'} md:block w-full md:w-80 flex-shrink-0 border-r border-gray-200`}
                    >
                        <ChatList onSelectChat={() => setIsMobileMenuOpen(true)} />
                    </div>

                    {/* Chat window - full width on mobile when chat is selected */}
                    <div className={`${isMobileMenuOpen ? 'hidden' : 'block'} md:block flex-1 flex flex-col h-full`}>
                        <ChatWindow onBack={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>
            </ChatProvider>
        </Layout>
    );
}
