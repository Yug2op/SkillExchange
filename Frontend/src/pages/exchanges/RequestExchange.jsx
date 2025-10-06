// Frontend/src/pages/exchanges/RequestExchange.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createRequest } from '@/api/ExchangeApi';
import { getUser } from '@/api/UserApi';
import { getMe } from '@/api/AuthApi';
import { toast } from 'sonner';

export default function RequestExchange() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [message, setMessage] = useState('');

    const { data: userData } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(id),
        enabled: !!id,
    });

    const { data: currentUserData } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
    });

    const user = userData?.data?.user;
    const currentUser = currentUserData?.data?.user;
    const matchingSkills = (user?.skillsToTeach || []).filter(skill =>
        (currentUser?.skillsToLearn || []).includes(skill)
    );
    const handleSkillToggle = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSkills.length === 0) {
            toast.error('Please select at least one skill');
            return;
        }

        try {
            setLoading(true);
            const selectedSkill = selectedSkills[0];
            // Find what the current user can teach that matches the other user's wants
            const skillToOffer = (currentUser?.skillsToTeach || []).find(skill =>
                (user?.skillsToLearn || []).includes(skill)
            );

            if (!skillToOffer) {
                toast.error('No matching skills found to offer in exchange');
                return;
            }
            await createRequest({
                receiverId: id,
                skillOffered: skillToOffer,
                skillRequested: selectedSkill,
                message: message || undefined
            });
            toast.success('Exchange request sent successfully!');
            queryClient.invalidateQueries(['exchanges']);
            navigate('/exchanges');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Request Exchange with {user.name}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">Select Skills You Want to Learn</h3>
                    <div className="flex flex-wrap gap-2">
                        {matchingSkills.length > 0 ? (
                            matchingSkills.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`px-4 py-2 rounded-full text-sm ${selectedSkills.includes(skill)
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No matching skills found. You can only request to learn skills that you've listed in your "Wants to learn" section.
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Message (Optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border rounded h-24"
                        placeholder="Add a personal message..."
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border rounded"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || selectedSkills.length === 0}
                        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}