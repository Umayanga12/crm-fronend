import { useEffect, useState } from 'react';
import { Check, Zap, Shield, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { organizationService, Organization } from '@/services/organizationService';
import useAuthStore from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import Button from '@/components/crm/Button';
import Badge from '@/components/crm/Badge';
import Spinner from '@/components/crm/Spinner';

const PLANS = [
  {
    name: 'Basic',
    price: '$0',
    description: 'Perfect for small teams getting started.',
    features: ['Up to 100 Contacts', 'Basic Analytics', 'Standard Support', 'Single Organization'],
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'Advanced features for growing businesses.',
    features: ['Unlimited Contacts', 'Advanced CRM Tools', 'Priority Support', 'Custom Fields', 'Activity History'],
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    description: 'Maximum power for large scale operations.',
    features: ['Unlimited Organizations', 'Dedicated Manager', 'API Access', 'SSO & Custom Security', 'Custom Reports'],
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (user?.organization?.id) {
      fetchOrganization();
    }
  }, [user?.organization?.id]);

  const fetchOrganization = async () => {
    try {
      const orgId = user?.organization?.id;
      if (!orgId) return;
      const data = await organizationService.getOrganization(orgId);
      setOrganization(data.data || data); // Handle both standardized and raw response
    } catch {
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planName: string) => {
    if (!organization || !isAdmin) return;
    
    setUpdatingPlan(planName);
    try {
      await organizationService.updateOrganization(organization.id, {
        subscription_plan: planName as any
      });
      toast.success(`Successfully switched to ${planName} plan`);
      fetchOrganization();
    } catch {
      toast.error('Failed to update subscription plan');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the right plan for your business. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = organization?.subscription_plan === plan.name;
          const isFeatured = plan.featured;
          
          return (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                isFeatured 
                  ? 'border-primary ring-1 ring-primary bg-primary/5 scale-105 z-10' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge label="Most Popular" variant="info" />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${plan.bgColor}`}>
                  <plan.icon className={`h-6 w-6 ${plan.color}`} />
                </div>
                {isCurrent && <Badge label="Current Plan" variant="success" />}
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={isCurrent ? 'secondary' : 'primary'}
                className={cn(
                  "w-full h-11",
                  !isCurrent && !isFeatured && "bg-background border border-input text-foreground hover:bg-secondary"
                )}
                disabled={isCurrent || !isAdmin || updatingPlan !== null}
                onClick={() => handlePlanChange(plan.name)}
              >
                {updatingPlan === plan.name ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrent ? 'Active' : isAdmin ? 'Switch to this plan' : 'View Only'}
              </Button>
              
              {!isAdmin && (
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                  Only administrators can change subscription plans.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-secondary/30 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Need a custom plan for your enterprise?</p>
          <p className="text-sm text-muted-foreground">We offer tailored solutions for large organizations with complex needs.</p>
        </div>
        <Button variant="ghost" size="sm" className="border border-input">Contact Sales</Button>
      </div>
    </div>
  );
}
