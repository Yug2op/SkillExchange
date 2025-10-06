import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/api/UserApi';

export default function UserDetailPage() {
    const { id } = useParams();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-detail', id],
        queryFn: () => getUser(id),
        enabled: !!id,
    });

    const u = data?.data?.user;

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError || !u) return <div className="p-6">User not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link to="/search" className="text-sm text-primary hover:underline">← Back to search</Link>
            </div>

            <div className="flex items-center gap-4">
                <img
                    src={u?.profilePic?.url || 'https://via.placeholder.com/96?text=U'}
                    alt={u.name}
                    className="h-24 w-24 rounded-full object-cover border"
                />
                <div>
                    <div className="font-semibold">
                        <Link to={`/users/${u.id}`} className="hover:underline">{u.name}</Link>
                    </div>
                    {u.location?.city || u.location?.country ? (
                        <div className="text-sm text-muted-foreground">
                            {u.location?.city}{u.location?.city && u.location?.country ? ', ' : ''}{u.location?.country}
                        </div>
                    ) : null}
                    {u.rating?.count > 0 && (
                        <div className="text-sm text-muted-foreground">Rating: {u.rating.average} ({u.rating.count})</div>
                    )}
                </div>
            </div>

            {u.bio && <p className="mt-4">{u.bio}</p>}

            <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div>
                    <div className="text-xs text-muted-foreground mb-1">Teaches</div>
                    <div className="flex flex-wrap gap-2">
                        {(u.skillsToTeach || []).map((s) => (
                            <span key={s} className="text-xs rounded-full border px-2 py-0.5">{s}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground mb-1">Wants to learn</div>
                    <div className="flex flex-wrap gap-2">
                        {(u.skillsToLearn || []).map((s) => (
                            <span key={s} className="text-xs rounded-full border px-2 py-0.5">{s}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex gap-3">
                <Link
                    to={`/exchanges/request/${u.id}`}
                    className="rounded-md bg-primary text-primary-foreground px-4 py-2 hover:opacity-90"
                >
                    Request Exchange
                </Link>
                <button
                    className="rounded-md border px-4 py-2 hover:bg-accent"
                    onClick={() => alert('TODO: Send message')}
                >
                    Message
                </button>
            </div>
        </div>
    );
}