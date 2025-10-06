// Frontend/src/pages/exchanges/List.jsx
import { useQuery } from '@tanstack/react-query';
import { getMyExchanges } from '@/api/ExchangeApi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function ExchangesPage() {
  const { data: meData } = useMe();
  
  const currentUserId = meData?._id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchanges'],
    queryFn: () => getMyExchanges(),
  });

  const exchanges = data?.data?.exchanges || [];

  if (isLoading) return <div className="p-6">Loading exchanges...</div>;
  if (isError) return <div className="p-6">Failed to load exchanges</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Exchanges</h1>
        <Link
          to="/search"
          className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Find New Exchange
        </Link>
      </div>

      <div className="space-y-4">
        {exchanges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exchanges found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try requesting an exchange with someone!
            </p>
          </div>
        ) : (
          exchanges.map((exchange) => {
            if (!exchange?._id || !exchange?.sender || !exchange?.receiver) {
              return null;
            }

            const isCurrentUserSender = exchange.sender._id === currentUserId;
            const status = exchange.status?.toLowerCase() || 'pending';
            const otherUser = isCurrentUserSender ? exchange.receiver : exchange.sender;

            return (
              <div
                key={exchange._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {isCurrentUserSender
                        ? `You requested to learn ${exchange.skillRequested} from ${otherUser.name}`
                        : `${otherUser.name} wants to learn ${exchange.skillRequested} from you`}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Status:{' '}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[status] || 'bg-gray-100'
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                    {exchange.message && (
                      <p className="mt-2 text-sm">"{exchange.message}"</p>
                    )}
                  </div>
                  <div className="text-sm text-right">
                    <div className="text-muted-foreground">
                      {exchange.createdAt && format(new Date(exchange.createdAt), 'MMM d, yyyy')}
                    </div>
                    <Link
                      to={`/exchanges/${exchange._id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}