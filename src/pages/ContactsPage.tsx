import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, User as UserIcon, Building2 } from 'lucide-react';
import { contactService } from '@/services/contactService';
import { companyService } from '@/services/companyService';
import useAuthStore from '@/store/useAuthStore';
import DataTable from '@/components/crm/DataTable';
import Pagination from '@/components/crm/Pagination';
import Button from '@/components/crm/Button';
import Input from '@/components/crm/Input';
import Modal from '@/components/crm/Modal';
import Badge from '@/components/crm/Badge';
import Spinner from '@/components/crm/Spinner';
import EmptyState from '@/components/crm/EmptyState';
import { toast } from 'sonner';

interface Contact {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  company: number;
  company_name?: string;
  [key: string]: any;
}

interface Company {
  id: number;
  name: string;
}

function ContactForm({
  initial,
  onSubmit,
  loading,
  apiErrors,
  companies,
}: {
  initial?: Contact;
  onSubmit: (data: Record<string, any>) => void;
  loading: boolean;
  apiErrors: Record<string, string[]>;
  companies: Company[];
}) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [companyId, setCompanyId] = useState<string>(initial?.company?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.full_name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (phone && !/^\d{8,15}$/.test(phone)) e.phone = 'Phone must be 8-15 digits';
    if (!companyId) e.company = 'Company is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ full_name: fullName, email, phone, role, company: parseInt(companyId) });
  };

  const getError = (field: string) => errors[field] || (apiErrors[field]?.[0]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} error={getError('full_name')} />
      <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={getError('email')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={getError('phone')} />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} error={getError('role')} />
      </div>
      
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Company *</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          title="Select Company"
          className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {getError('company') && <p className="text-xs text-destructive">{getError('company')}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Contact'}</Button>
      </div>
    </form>
  );
}

export default function ContactsPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'Staff';

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactService.getAllContacts({ page, search: searchQuery });
      setContacts(data.results ?? []);
      setTotalPages(Math.ceil((data.count ?? 0) / 10) || 1);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data.results ?? []);
    } catch {
      // Silent error for companies
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, [fetchContacts, fetchCompanies]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (data: Record<string, any>) => {
    setFormLoading(true);
    setApiErrors({});
    try {
      await contactService.createContact(data.company, data);
      toast.success('Contact added');
      setCreateOpen(false);
      fetchContacts();
    } catch (err: any) {
      if (err.response?.data) setApiErrors(err.response.data);
      else toast.error('Failed to create contact');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: Record<string, any>) => {
    if (!editTarget) return;
    setFormLoading(true);
    setApiErrors({});
    try {
      await contactService.updateContact(data.company, editTarget.id, data);
      toast.success('Contact updated');
      setEditTarget(null);
      fetchContacts();
    } catch (err: any) {
      if (err.response?.data) setApiErrors(err.response.data);
      else toast.error('Failed to update contact');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    try {
      await contactService.deleteContact(deleteTarget.company, deleteTarget.id);
      toast.success('Contact deleted');
      setDeleteTarget(null);
      fetchContacts();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setFormLoading(false);
    }
  };

  const canAdd = role === 'Admin' || role === 'Manager';
  const canEdit = role === 'Admin' || role === 'Manager';
  const canDelete = role === 'Admin';

  const columns = [
    {
      key: 'full_name',
      label: 'Contact',
      render: (r: Contact) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{r.full_name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'company_name',
      label: 'Company',
      render: (r: Contact) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>{r.company_name || `Company #${r.company}`}</span>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role',
      label: 'Role',
      render: (r: Contact) => r.role ? <Badge label={r.role} variant="gray" /> : '-',
    },
    ...(canEdit || canDelete ? [{
      key: 'actions',
      label: '',
      render: (r: Contact) => (
        <div className="flex justify-end gap-1">
          {canEdit && (
            <button
              onClick={() => { setEditTarget(r); setApiErrors({}); }}
              title="Edit Contact"
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteTarget(r)}
              title="Delete Contact"
              className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground">Manage all contacts across your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search contacts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
            />
          </div>
          {canAdd && (
            <Button size="sm" onClick={() => { setCreateOpen(true); setApiErrors({}); }}>
              <Plus className="h-4 w-4" /> Add Contact
            </Button>
          )}
        </div>
      </div>

      {loading && contacts.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description={searchQuery ? "Try a different search term." : "Get started by adding your first contact."}
          action={!searchQuery && canAdd ? { label: 'Add Contact', onClick: () => setCreateOpen(true) } : undefined}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <DataTable columns={columns as any} data={contacts as any} loading={loading} />
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Contact">
        <ContactForm onSubmit={handleCreate} loading={formLoading} apiErrors={apiErrors} companies={companies} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Contact">
        {editTarget && (
          <ContactForm initial={editTarget} onSubmit={handleEdit} loading={formLoading} apiErrors={apiErrors} companies={companies} />
        )}
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Contact"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={formLoading} onClick={handleDelete}>Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.full_name}</span>?
          This will perform a soft delete.
        </p>
      </Modal>
    </div>
  );
}
