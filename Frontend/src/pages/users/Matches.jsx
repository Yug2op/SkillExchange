import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMatches } from '@/api/UserApi';
import { Link } from 'react-router-dom';

export default function MatchesPage() {
    const [page, setPage] = useState(1);
    const limit = 12;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['users-matches', { page, limit }],
        queryFn: () => getMatches({ page, limit }),
        keepPreviousData: true,
    });

    const matches = data?.data?.matches || [];
    const totalPages = data?.data?.totalPages || 1;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Recommended Matches</h1>

            {isLoading && <div className="p-6">Loading...</div>}
            {isError && <div className="p-6">Failed to load matches</div>}

            {!isLoading && matches.length === 0 && (
                <div className="p-6 text-muted-foreground">No matches yet. Try adding more skills on your profile.</div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => {
                    const u = m.user;
                    return (
                        <div key={u.id} className="rounded-lg border p-4 bg-card">
                            <div className="flex items-center gap-3">
                                <img
                                    src={u?.profilePic?.url || 'https://via.placeholder.com/64?text=U'}
                                    alt={u.name}
                                    className="h-12 w-12 rounded-full object-cover border"
                                />
                                <div>
                                    <div className="font-semibold">
                                        <Link to={`/users/${u.id}`} className="hover:underline">{u.name}</Link>
                                    </div>
                                    {m.matchScore != null && (
                                        <div className="text-xs text-muted-foreground">Match score: {Math.round(m.matchScore)}%</div>
                                    )}
                                </div>
                            </div>

                            {u.bio && <p className="text-sm mt-3">{u.bio}</p>}

                            <div className="mt-3">
                                <div className="text-xs text-muted-foreground mb-1">Teaches</div>
                                <div className="flex flex-wrap gap-2">
                                    {(u.skillsToTeach || []).map((s) => (
                                        <span key={s} className="text-xs rounded-full border px-2 py-0.5">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="text-xs text-muted-foreground mb-1">Wants to learn</div>
                                <div className="flex flex-wrap gap-2">
                                    {(u.skillsToLearn || []).map((s) => (
                                        <span key={s} className="text-xs rounded-full border px-2 py-0.5">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-md border px-3 py-1.5 disabled:opacity-60"
                    >
                        Prev
                    </button>
                    <div className="text-sm">Page {page} of {totalPages}</div>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-md border px-3 py-1.5 disabled:opacity-60"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}