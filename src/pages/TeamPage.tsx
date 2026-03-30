import { useState, useEffect } from 'react';
import { Plus, Loader2, Mail, User as UserIcon, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { userService, TeamMember } from '@/services/userService';
import Button from '@/components/crm/Button';
import Badge from '@/components/crm/Badge';
import Pagination from '@/components/crm/Pagination';
import Modal from '@/components/crm/Modal';
import useAuthStore from '@/store/useAuthStore';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useAuthStore((s) => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Staff'>('Staff');

  useEffect(() => {
    fetchMembers();
  }, [page]);

  const fetchMembers = async () => {
    try {
      const data = await userService.getUsers({ page });
      setMembers(data.results ?? []);
      setTotalPages(Math.ceil((data.count ?? 0) / 10) || 1);
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      await userService.createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      });
      toast.success('Team member added successfully');
      fetchMembers();
      setIsCreating(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('Staff');
    } catch {
      toast.error('Failed to add team member');
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(memberToDelete.id);
      toast.success('Team member removed');
      fetchMembers();
      setMemberToDelete(null);
    } catch {
      toast.error('Failed to remove member. You cannot delete yourself.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground">Manage your organization's members and their roles.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? 'Cancel' : 'Add Member'}
        </Button>
      </div>

      {isCreating && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm mx-auto max-w-2xl">
          <h3 className="mb-4 text-lg font-medium">Add New Member</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <input
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password *</label>
              <input
                type="password"
                required
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Add Member</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {member.first_name?.[0] || member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={member.role} variant={member.role === 'Admin' ? 'info' : member.role === 'Manager' ? 'success' : 'gray'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member.id !== currentUser?.id && (
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="text-destructive hover:text-destructive/80 text-xs font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Remove Team Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMemberToDelete(null)}>Cancel</Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          Are you sure you want to remove <strong>{memberToDelete?.first_name} {memberToDelete?.last_name}</strong> from your organization?
        </p>
        <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone. They will immediately lose access to the CRM data.</p>
      </Modal>
    </div>
  );
}
