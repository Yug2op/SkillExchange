// Frontend/src/pages/profile/Me.jsx
import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useMe } from '@/hooks/useMe';
import { updateUser, uploadProfilePic } from '@/api/UserApi';
import { toast } from 'sonner';

export default function MeProfile() {
  const qc = useQueryClient();
  const { data: user, isLoading, isError } = useMe();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skillsToTeach: (user?.skillsToTeach || []).join(', '),
    skillsToLearn: (user?.skillsToLearn || []).join(', '),
    locationCity: user?.location?.city || '',
    locationCountry: user?.location?.country || '',
    phone: user?.phone || '',
  });

  // Update profile
  const updateMutation = useMutation({
    mutationFn: (payload) => updateUser(user.id, payload),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => toast.error(err?.message || 'Failed to update profile'),
  });

  // Upload avatar
  const uploadMutation = useMutation({
    mutationFn: (file) => uploadProfilePic(user.id, file),
    onSuccess: () => {
      toast.success('Profile picture updated');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => toast.error(err?.message || 'Upload failed'),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !user) return <div className="p-6">Not authenticated</div>;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      bio: form.bio,
      phone: form.phone,
      skillsToTeach: form.skillsToTeach ? form.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean) : [],
      skillsToLearn: form.skillsToLearn ? form.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean) : [],
      location: {
        city: form.locationCity || undefined,
        country: form.locationCountry || undefined,
      },
    };
    updateMutation.mutate(payload);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center gap-4">
        <img
          src={user?.profilePic?.url || 'https://via.placeholder.com/80x80?text=Avatar'}
          alt="avatar"
          className="h-20 w-20 rounded-full object-cover border"
        />
        <div>
          <label className="block text-sm mb-1">Change profile picture</label>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Skills to Teach (comma-separated)</label>
            <input name="skillsToTeach" value={form.skillsToTeach} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Skills to Learn (comma-separated)</label>
            <input name="skillsToLearn" value={form.skillsToLearn} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">City</label>
            <input name="locationCity" value={form.locationCity} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Country</label>
            <input name="locationCountry" value={form.locationCountry} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 hover:opacity-90 disabled:opacity-60"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}