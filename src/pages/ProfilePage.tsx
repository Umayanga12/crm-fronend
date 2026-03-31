import { useEffect, useState } from 'react';
import { User, Building2, Briefcase, Mail, Shield, CreditCard } from 'lucide-react';
import { authService } from '@/services/authService';
import Spinner from '@/components/crm/Spinner';
import Badge from '@/components/crm/Badge';

interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  organization: {
    id: number;
    name: string;
    subscription_plan: string;
  };
  [key: string]: unknown;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe();
        setProfile(data);
      } catch {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Spinner />;
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-medium text-foreground">{error ?? 'Profile not found'}</p>
      </div>
    );
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'No Name Provided';
  const initials = (profile.first_name?.[0] || profile.email[0]).toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground">My Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5"></div>
          <div className="px-6 pb-6 relative">
            <div className="absolute -top-10 left-6 flex h-20 w-20 items-center justify-center rounded-xl bg-primary text-3xl font-bold text-primary-foreground shadow-md ring-4 ring-card">
              {initials}
            </div>
            
            <div className="pt-14 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{fullName}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Role</span>
                  </div>
                  <Badge label={profile.role} variant={profile.role === 'Admin' ? 'success' : 'gray'} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>User ID</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">#{profile.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Organization Details</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
              <p className="text-sm text-muted-foreground mb-1">Company Name</p>
              <p className="text-lg font-medium text-foreground">{profile.organization.name}</p>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Subscription Plan
                </p>
                <div className="mt-1.5">
                  <Badge 
                    label={profile.organization.subscription_plan} 
                    variant={profile.organization.subscription_plan === 'Enterprise' ? 'success' : (profile.organization.subscription_plan === 'Pro' ? 'warning' : 'gray')} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
