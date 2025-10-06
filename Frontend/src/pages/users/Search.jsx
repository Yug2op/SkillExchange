import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/api/UserApi';
import { Link } from 'react-router-dom';

function useDebounced(value, delay = 400) {
    const [v, setV] = useState(value);
    useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return v;
}

export default function SearchUsersPage() {
    const [q, setQ] = useState('');
    const [teach, setTeach] = useState('');
    const [learn, setLearn] = useState('');
    const [page, setPage] = useState(1);
    const limit = 12;

    const dq = useDebounced(q);
    const params = useMemo(() => ({ q: dq, teach, learn, page, limit }), [dq, teach, learn, page]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['users-search', params],
        queryFn: () => searchUsers(params),
        keepPreviousData: true,
    });

    const users = data?.data?.users || [];
    const totalPages = data?.data?.totalPages || 1;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Find People</h1>

            <div className="grid gap-3 sm:grid-cols-4 mb-6">
                <input
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    placeholder="Search by name/bio/skills..."
                    className="rounded-md border px-3 py-2 sm:col-span-2"
                />
                <input
                    value={teach}
                    onChange={(e) => { setTeach(e.target.value); setPage(1); }}
                    placeholder="Teaches (comma-separated)"
                    className="rounded-md border px-3 py-2"
                />
                <input
                    value={learn}
                    onChange={(e) => { setLearn(e.target.value); setPage(1); }}
                    placeholder="Wants to learn (comma-separated)"
                    className="rounded-md border px-3 py-2"
                />
            </div>

            {isLoading && <div className="p-6">Loading...</div>}
            {isError && <div className="p-6">Failed to load users</div>}

            {!isLoading && users.length === 0 && (
                <div className="p-6 text-muted-foreground">No users found.</div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((u) => (
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
                                <div className="text-sm text-muted-foreground">{u.email}</div>
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
                ))}
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