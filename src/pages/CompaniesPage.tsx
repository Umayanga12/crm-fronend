import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { companyService } from '@/services/companyService';
import useAuthStore from '@/store/useAuthStore';
import DataTable from '@/components/crm/DataTable';
import Pagination from '@/components/crm/Pagination';
import Button from '@/components/crm/Button';
import Input from '@/components/crm/Input';
import Modal from '@/components/crm/Modal';
import EmptyState from '@/components/crm/EmptyState';
import { toast } from 'sonner';

interface Company {
  id: number;
  name: string;
  industry: string;
  country: string;
  logo: string | null;
  created_at: string;
  [key: string]: unknown;
}

function CompanyForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: Company;
  onSubmit: (fd: FormData) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.logo ?? null);
  const [nameError, setNameError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('industry', industry);
    fd.append('country', country);
    if (logoFile) fd.append('logo', logoFile);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name *" value={name} onChange={(e) => { setName(e.target.value); setNameError(''); }} error={nameError} />
      <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
      <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Logo</label>
        {preview && <img src={preview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-border" />}
        <input type="file" accept="image/*" onChange={handleFile} className="block text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}

export default function CompaniesPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'Staff';
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({ page, search, industry, country });
      setCompanies(data.results ?? []);
      setTotalPages(Math.ceil((data.count ?? 0) / 10) || 1);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [page, search, industry, country]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (fd: FormData) => {
    setFormLoading(true);
    try {
      await companyService.createCompany(fd);
      toast.success('Company created');
      setCreateOpen(false);
      fetchCompanies();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      toast.error(axiosErr.response?.data ? Object.values(axiosErr.response.data).flat().join(', ') : 'Failed to create');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (fd: FormData) => {
    if (!editTarget) return;
    setFormLoading(true);
    try {
      await companyService.updateCompany(editTarget.id, fd);
      toast.success('Company updated');
      setEditTarget(null);
      fetchCompanies();
    } catch {
      toast.error('Failed to update');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    try {
      await companyService.deleteCompany(deleteTarget.id);
      toast.success('Company deleted');
      setDeleteTarget(null);
      fetchCompanies();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setFormLoading(false);
    }
  };

  const canAdd = role === 'Admin' || role === 'Manager';
  const canEdit = role === 'Admin' || role === 'Manager';
  const canDelete = role === 'Admin';

  const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const columns = [
    {
      key: 'logo',
      label: '',
      render: (r: Company) =>
        r.logo ? (
          <img src={r.logo} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {initials(r.name)}
          </div>
        ),
    },
    { key: 'name', label: 'Name', render: (r: Company) => <button onClick={() => navigate(`/companies/${r.id}`)} className="font-medium text-foreground hover:text-primary transition-colors">{r.name}</button> },
    { key: 'industry', label: 'Industry' },
    { key: 'country', label: 'Country' },
    { key: 'created_at', label: 'Created', render: (r: Company) => r.created_at ? new Date(r.created_at).toLocaleDateString() : '' },
    ...(canEdit || canDelete
      ? [{
          key: 'actions',
          label: '',
          render: (r: Company) => (
            <div className="flex gap-1">
              {canEdit && (
                <button onClick={() => setEditTarget(r)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {canDelete && (
                <button onClick={() => setDeleteTarget(r)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search companies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-64"
            />
          </div>
          <input placeholder="Industry" value={industry} onChange={(e) => { setIndustry(e.target.value); setPage(1); }} className="h-9 w-36 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <input placeholder="Country" value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="h-9 w-36 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        {canAdd && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        )}
      </div>

      {!loading && companies.length === 0 ? (
        <EmptyState title="No companies found" description="Try adjusting your search or filters." action={canAdd ? { label: 'Add Company', onClick: () => setCreateOpen(true) } : undefined} />
      ) : (
        <>
          <DataTable columns={columns} data={companies} loading={loading} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Company">
        <CompanyForm onSubmit={handleCreate} loading={formLoading} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Company">
        {editTarget && <CompanyForm initial={editTarget} onSubmit={handleEdit} loading={formLoading} />}
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Company"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={formLoading} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
