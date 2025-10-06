// Frontend/src/pages/exchanges/Detail.jsx
import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
// import { Dialog } from '@headlessui/react';
import { useMe } from '@/hooks/useMe';
import {
    getExchange,
    acceptExchange,
    rejectExchange,
    completeExchange,
    cancelExchange,
    scheduleSession
} from '@/api/ExchangeApi';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const statusActions = {
    // For senders
    sender: {
        pending: ['Cancel'],
        accepted: ['Mark as Completed'],
        completed: [],
        rejected: [],
        cancelled: []
    },
    // For receivers
    receiver: {
        pending: ['Accept', 'Reject'],
        accepted: ['Mark as Completed'],
        completed: [],
        rejected: [],
        cancelled: []
    }
};



export default function ExchangeDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { data: meData } = useMe();
    const currentUserId = meData?._id;
    const modalRef = useRef();

    const [isScheduling, setIsScheduling] = useState(false);

    const [scheduleData, setScheduleData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        type: 'online', // Default to online
        location: '',
        meetingLink: ''
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['exchange', id],
        queryFn: () => getExchange(id),
        enabled: !!id,
    });

    const exchange = data?.data?.exchange;
    const isSender = exchange?.sender?._id === currentUserId;
    const otherUser = isSender ? exchange?.receiver : exchange?.sender;

    const handleAction = async (action) => {
        try {
            let response;
            switch (action) {
                case 'Accept':
                    response = await acceptExchange(id);
                    break;
                case 'Reject':
                    response = await rejectExchange(id, { reason: 'Exchange rejected' });
                    break;
                case 'Mark as Completed':
                    response = await completeExchange(id);
                    break;
                case 'Cancel':
                    response = await cancelExchange(id);
                    break;
                default:
                    return;
            }
            toast.success('Exchange updated successfully');
            queryClient.invalidateQueries(['exchange', id]);
            queryClient.invalidateQueries(['exchanges']);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update exchange');
        }
    };

    // Update the handleScheduleSubmit function
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                date: scheduleData.date,
                startTime: scheduleData.startTime,
                endTime: scheduleData.endTime,
                type: scheduleData.type,
                ...(scheduleData.type === 'online'
                    ? { meetingLink: scheduleData.meetingLink }
                    : { location: scheduleData.location })
            };

            await scheduleSession(id, payload);
            toast.success('Session scheduled successfully');
            setIsScheduling(false);
            queryClient.invalidateQueries(['exchange', id]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule session');
        }
    };

    // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                // Only close if clicking on the overlay (not the modal content)
                if (event.target.closest('.modal-overlay')) {
                    setIsScheduling(false);
                }
            }
        }

        if (isScheduling) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isScheduling]);

    const handleScheduleChange = (e) => {
        const { name, value } = e.target;
        setScheduleData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) return <div className="p-6">Loading exchange details...</div>;
    if (isError) return <div className="p-6">Failed to load exchange</div>;
    if (!exchange) return <div className="p-6">Exchange not found</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Link to="/exchanges" className="text-primary hover:underline">
                    ← Back to Exchanges
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Exchange {isSender ? 'with' : 'from'} {otherUser?.name}
                        </h1>
                        <div className="mt-2">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[exchange.status?.toLowerCase()] || 'bg-gray-100'
                                    }`}
                            >
                                {exchange.status}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Created on {format(new Date(exchange.createdAt), 'MMM d, yyyy')}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-medium mb-4">Exchange Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">You will learn</p>
                                <p className="font-medium">{exchange.skillRequested}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">In exchange for</p>
                                <p className="font-medium">{exchange.skillOffered}</p>
                            </div>
                            {exchange.message && (
                                <div>
                                    <p className="text-sm text-gray-500">Message</p>
                                    <p className="mt-1">"{exchange.message}"</p>
                                </div>
                            )}
                            {exchange.scheduledSessions && exchange.scheduledSessions.length > 0 && (() => {
                                const latestSession = exchange.scheduledSessions[exchange.scheduledSessions.length - 1];

                                return (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                        <h4 className="font-medium text-blue-800 mb-2">Latest Scheduled Session</h4>

                                        <p className="text-sm text-blue-800 font-medium">
                                            {format(new Date(latestSession.date), 'MMMM d, yyyy')} &nbsp;
                                            {latestSession.startTime} - {latestSession.endTime}
                                        </p>

                                        <p className="text-sm text-blue-700 mt-1 capitalize">
                                            Type: {latestSession.type}
                                        </p>

                                        {latestSession.type === 'online' && latestSession.meetingLink && (
                                            <p className="text-sm text-blue-600 mt-1">
                                                Meeting Link:{" "}
                                                <a
                                                    href={latestSession.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 underline hover:text-indigo-800"
                                                >
                                                    {latestSession.meetingLink}
                                                </a>
                                            </p>
                                        )}

                                        {latestSession.type === 'offline' && latestSession.location && (
                                            <p className="text-sm text-blue-600 mt-1">
                                                Location: {latestSession.location}
                                            </p>
                                        )}

                                        {latestSession.completed ? (
                                            <span className="text-green-600 text-xs font-semibold mt-1 block">
                                                ✔ Completed
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 text-xs font-semibold mt-1 block">
                                                ⏳ Upcoming
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}


                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">User Information</h3>
                        <div className="space-y-2">
                            <p>
                                <span className="text-gray-500">Name:</span>{' '}
                                <span className="font-medium">{otherUser?.name}</span>
                            </p>
                            {otherUser?.email && (
                                <p>
                                    <span className="text-gray-500">Email:</span>{' '}
                                    <a
                                        href={`mailto:${otherUser.email}`}
                                        className="text-primary hover:underline"
                                    >
                                        {otherUser.email}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4 pt-4 border-t">
                    {/* Sender Actions */}
                    {isSender && statusActions.sender[exchange.status?.toLowerCase()]?.length > 0 && (
                        statusActions.sender[exchange.status?.toLowerCase()].map((action) => (
                            <button
                                key={`sender-${action}`}
                                onClick={() => handleAction(action)}
                                className={`px-4 py-2 rounded-md ${action === 'Reject' || action === 'Cancel'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                            >
                                {action}
                            </button>
                        ))
                    )}

                    {/* Receiver Actions */}
                    {!isSender && statusActions.receiver[exchange.status?.toLowerCase()]?.length > 0 && (
                        statusActions.receiver[exchange.status?.toLowerCase()].map((action) => (
                            <button
                                key={`receiver-${action}`}
                                onClick={() => handleAction(action)}
                                className={`px-4 py-2 rounded-md ${action === 'Reject' || action === 'Cancel'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                            >
                                {action}
                            </button>
                        ))
                    )}

                    {/* Schedule button - both can schedule when accepted */}
                    {exchange.status?.toLowerCase() === 'accepted' && (
                        <button
                            onClick={() => setIsScheduling(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            {exchange.scheduledTime ? 'Reschedule' : 'Schedule Session'}
                        </button>
                    )}
                </div>
            </div>

            {/* Schedule Session Modal */}
            {isScheduling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                    {/* Background Overlay */}
                    <div
                        className="fixed inset-0 bg-gray-800 bg-opacity-60 transition-opacity"
                        aria-hidden="true"
                        onClick={() => setIsScheduling(false)} // Click outside to close
                    ></div>

                    {/* Modal Box */}
                    <div
                        ref={modalRef}
                        className="relative z-50 inline-block bg-white rounded-lg px-6 pt-5 pb-4 text-left shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6"
                    >
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            {exchange?.scheduledTime ? 'Reschedule Session' : 'Schedule a Session'}
                        </h3>

                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            {/* Date */}
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={scheduleData.date}
                                    onChange={handleScheduleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    value={scheduleData.startTime}
                                    onChange={handleScheduleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    id="endTime"
                                    name="endTime"
                                    value={scheduleData.endTime}
                                    onChange={handleScheduleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* Session Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Session Type</label>
                                <div className="mt-1 space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="online"
                                            checked={scheduleData.type === 'online'}
                                            onChange={handleScheduleChange}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2">Online</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="offline"
                                            checked={scheduleData.type === 'offline'}
                                            onChange={handleScheduleChange}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2">Offline</span>
                                    </label>
                                </div>
                            </div>

                            {/* Conditional Fields */}
                            {scheduleData.type === 'online' ? (
                                <div>
                                    <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                                        Meeting Link
                                    </label>
                                    <input
                                        type="url"
                                        id="meetingLink"
                                        name="meetingLink"
                                        value={scheduleData.meetingLink}
                                        onChange={handleScheduleChange}
                                        placeholder="https://meet.example.com/abc"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required={scheduleData.type === 'online'}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={scheduleData.location}
                                        onChange={handleScheduleChange}
                                        placeholder="e.g., Coffee Shop, Library, etc."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required={scheduleData.type === 'offline'}
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                >
                                    {exchange?.scheduledTime ? 'Reschedule' : 'Schedule'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsScheduling(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}