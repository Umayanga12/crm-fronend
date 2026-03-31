import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { companyService } from '@/services/companyService';
import { contactService } from '@/services/contactService';
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

interface Company {
  id: number; name: string; industry: string; country: string; logo: string | null; logo_url: string | null; created_at: string;
}

interface Contact {
  id: number; full_name: string; email: string; phone: string; role: string;
  [key: string]: unknown;
}

function ContactForm({
  initial,
  onSubmit,
  loading,
  apiErrors,
}: {
  initial?: Contact;
  onSubmit: (data: Record<string, string>) => void;
  loading: boolean;
  apiErrors: Record<string, string[]>;
}) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.full_name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (phone && !/^\d{8,15}$/.test(phone)) e.phone = 'Phone must be 8-15 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ full_name: fullName, email, phone, role });
  };

  const getError = (field: string) => errors[field] || (apiErrors[field]?.[0]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} error={getError('full_name')} />
      <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={getError('email')} />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={getError('phone')} />
      <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} error={getError('role')} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Contact'}</Button>
      </div>
    </form>
  );
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'Staff';

  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactPage, setContactPage] = useState(1);
  const [contactTotalPages, setContactTotalPages] = useState(1);
  const [contactSearch, setContactSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!id) return;
    companyService.getCompany(id).then(setCompany).catch(() => toast.error('Failed to load company')).finally(() => setLoading(false));
  }, [id]);

  const fetchContacts = useCallback(async () => {
    if (!id) return;
    setContactsLoading(true);
    try {
      const data = await contactService.getContacts(id, { page: contactPage, search: contactSearch });
      setContacts(data.results ?? []);
      setContactTotalPages(Math.ceil((data.count ?? 0) / 10) || 1);
    } catch { toast.error('Failed to load contacts'); }
    finally { setContactsLoading(false); }
  }, [id, contactPage, contactSearch]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  useEffect(() => {
    const t = setTimeout(() => { setContactSearch(searchInput); setContactPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (data: Record<string, string>) => {
    if (!id) return;
    setFormLoading(true);
    setApiErrors({});
    try {
      await contactService.createContact(id, data);
      toast.success('Contact added');
      setCreateOpen(false);
      fetchContacts();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      if (axiosErr.response?.data) setApiErrors(axiosErr.response.data);
      else toast.error('Failed to create contact');
    } finally { setFormLoading(false); }
  };

  const handleEdit = async (data: Record<string, string>) => {
    if (!id || !editTarget) return;
    setFormLoading(true);
    setApiErrors({});
    try {
      await contactService.updateContact(id, editTarget.id, data);
      toast.success('Contact updated');
      setEditTarget(null);
      fetchContacts();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      if (axiosErr.response?.data) setApiErrors(axiosErr.response.data);
      else toast.error('Failed to update contact');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!id || !deleteTarget) return;
    setFormLoading(true);
    try {
      await contactService.deleteContact(id, deleteTarget.id);
      toast.success('Contact deleted');
      setDeleteTarget(null);
      fetchContacts();
    } catch { toast.error('Failed to delete'); }
    finally { setFormLoading(false); }
  };

  const canAdd = role === 'Admin' || role === 'Manager';
  const canEdit = role === 'Admin' || role === 'Manager';
  const canDelete = role === 'Admin';

  if (loading) return <Spinner />;
  if (!company) return <EmptyState title="Company not found" />;

  const contactColumns = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
    ...(canEdit || canDelete ? [{
      key: 'actions', label: '',
      render: (r: Contact) => (
        <div className="flex gap-1">
          {canEdit && <button onClick={() => { setEditTarget(r); setApiErrors({}); }} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>}
          {canDelete && <button onClick={() => setDeleteTarget(r)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <Link to="/companies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>

      <div className="flex items-start gap-5 rounded-lg border border-border bg-card p-6">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="h-20 w-20 rounded-lg object-cover border border-border" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
            {company.name.charAt(0)}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{company.name}</h2>
          <div className="flex items-center gap-3">
            {company.industry && <Badge label={company.industry} />}
            {company.country && <span className="text-sm text-muted-foreground">{company.country}</span>}
          </div>
          <p className="text-xs text-muted-foreground">Created {new Date(company.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-foreground">Contacts</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search contacts..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-56" />
            </div>
            {canAdd && <Button size="sm" onClick={() => { setCreateOpen(true); setApiErrors({}); }}><Plus className="h-4 w-4" /> Add Contact</Button>}
          </div>
        </div>
        {!contactsLoading && contacts.length === 0 ? (
          <EmptyState title="No contacts" description="Add contacts to this company." action={canAdd ? { label: 'Add Contact', onClick: () => setCreateOpen(true) } : undefined} />
        ) : (
          <>
            <DataTable columns={contactColumns} data={contacts} loading={contactsLoading} />
            <Pagination currentPage={contactPage} totalPages={contactTotalPages} onPageChange={setContactPage} />
          </>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Contact">
        <ContactForm onSubmit={handleCreate} loading={formLoading} apiErrors={apiErrors} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Contact">
        {editTarget && <ContactForm initial={editTarget} onSubmit={handleEdit} loading={formLoading} apiErrors={apiErrors} />}
      </Modal>
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Contact" footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" loading={formLoading} onClick={handleDelete}>Delete</Button></>}>
        <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.full_name}</span>?</p>
      </Modal>
    </div>
  );
}
