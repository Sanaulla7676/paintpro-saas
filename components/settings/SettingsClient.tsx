'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Profile {
  id?: string;
  user_id?: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  default_gst?: number;
  default_validity?: string;
  default_advance?: number;
  default_labour_interior?: number;
  default_labour_exterior?: number;
  default_terms?: string;
  quotation_prefix?: string;
}

interface SettingsClientProps {
  profile: Profile | null;
  userEmail: string;
}

const TABS = ['Business Profile', 'Quotation Defaults', 'Account'] as const;
type Tab = typeof TABS[number];

export function SettingsClient({ profile: initialProfile, userEmail }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('Business Profile');
  const [profile, setProfile] = useState<Profile>(initialProfile || {});
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  function set(field: keyof Profile, value: string | number) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError('');
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: err } = await supabase
        .from('profiles')
        .upsert({ ...profile, user_id: user.id }, { onConflict: 'user_id' });

      if (err) { setError(err.message); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 3000);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your business profile and quotation defaults</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e5e1da] pb-0">
        {TABS.map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-bold border-b-2 -mb-[1px] transition-colors',
              activeTab === tab
                ? 'border-[#d2ad76] text-[#8b652e]'
                : 'border-transparent text-muted hover:text-ink'
            )}>
            {tab}
          </button>
        ))}
      </div>

      {/* Business Profile */}
      {activeTab === 'Business Profile' && (
        <div className="panel">
          <div className="panel-head">
            <b className="text-sm">Business Information</b>
            <div className="flex gap-2">
              {saved && (
                <span className="h-9 px-3 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-200 flex items-center gap-1">
                  <Check size={12} /> Saved
                </span>
              )}
              <button onClick={handleSave} disabled={isPending}
                className="h-9 px-4 rounded-xl font-bold text-sm text-white flex items-center gap-1.5"
                style={{ background: isPending ? '#999' : '#1f2528' }}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="field">
                <label>Your Full Name</label>
                <input value={profile.full_name || ''} onChange={(e) => set('full_name', e.target.value)} placeholder="Your name" />
              </div>
              <div className="field">
                <label>Company / Business Name</label>
                <input value={profile.company_name || ''} onChange={(e) => set('company_name', e.target.value)} placeholder="Company name (shown on quotations)" />
              </div>
              <div className="field">
                <label>Business Phone</label>
                <input type="tel" value={profile.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="Phone number" />
              </div>
              <div className="field">
                <label>Business Email</label>
                <input type="email" value={profile.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="business@email.com" />
              </div>
              <div className="field sm:col-span-2">
                <label>Business Address</label>
                <input value={profile.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Full business address" />
              </div>
              <div className="field">
                <label>City</label>
                <input value={profile.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="City" />
              </div>
              <div className="field">
                <label>State</label>
                <input value={profile.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="State" />
              </div>
              <div className="field">
                <label>PIN Code</label>
                <input value={profile.pincode || ''} onChange={(e) => set('pincode', e.target.value)} placeholder="6-digit PIN" />
              </div>
              <div className="field">
                <label>GST Registration Number</label>
                <input value={profile.gst_number || ''} onChange={(e) => set('gst_number', e.target.value)} placeholder="GSTIN (optional)" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Defaults */}
      {activeTab === 'Quotation Defaults' && (
        <div className="panel">
          <div className="panel-head">
            <b className="text-sm">Quotation Defaults</b>
            <div className="flex gap-2">
              {saved && (
                <span className="h-9 px-3 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-200 flex items-center gap-1">
                  <Check size={12} /> Saved
                </span>
              )}
              <button onClick={handleSave} disabled={isPending}
                className="h-9 px-4 rounded-xl font-bold text-sm text-white"
                style={{ background: isPending ? '#999' : '#1f2528' }}>
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-muted bg-[#f8f6f2] border border-[#e5e1da] rounded-xl p-3">
              These values will be pre-filled on every new quotation. You can always override them per quotation.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="field">
                <label>Default GST %</label>
                <input type="number" min="0" max="100" step="0.5"
                  value={profile.default_gst ?? 18}
                  onChange={(e) => set('default_gst', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="field">
                <label>Default Advance %</label>
                <input type="number" min="0" max="100" step="5"
                  value={profile.default_advance ?? 30}
                  onChange={(e) => set('default_advance', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="field">
                <label>Default Validity</label>
                <select value={profile.default_validity || '15 days'}
                  onChange={(e) => set('default_validity', e.target.value)}>
                  {['7 days', '10 days', '15 days', '30 days', '45 days', '60 days'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Interior Labour ₹/sq.ft</label>
                <input type="number" min="0" step="0.5"
                  value={profile.default_labour_interior ?? 0}
                  onChange={(e) => set('default_labour_interior', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="field">
                <label>Exterior Labour ₹/sq.ft</label>
                <input type="number" min="0" step="0.5"
                  value={profile.default_labour_exterior ?? 0}
                  onChange={(e) => set('default_labour_exterior', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="field">
                <label>Quotation Number Prefix</label>
                <input
                  value={profile.quotation_prefix || 'PP'}
                  onChange={(e) => set('quotation_prefix', e.target.value.toUpperCase())}
                  placeholder="e.g. PP, QT, INV"
                  maxLength={6}
                />
              </div>
              <div className="field sm:col-span-3">
                <label>Default Terms & Conditions</label>
                <textarea rows={5}
                  value={profile.default_terms || ''}
                  onChange={(e) => set('default_terms', e.target.value)}
                  placeholder="Standard payment terms, warranty policy, scope exclusions…"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account */}
      {activeTab === 'Account' && (
        <div className="space-y-4">
          <div className="panel">
            <div className="panel-head"><b className="text-sm">Account Information</b></div>
            <div className="p-5 space-y-2">
              <div className="flex justify-between text-sm py-2 border-b border-[#e5e1da]">
                <span className="text-muted">Email</span>
                <span className="font-bold">{userEmail}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted">Account ID</span>
                <span className="font-mono text-xs text-muted">{initialProfile?.user_id?.slice(0, 8)}…</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b className="text-sm">Change Password</b></div>
            <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
              {pwError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{pwError}</div>
              )}
              {pwSaved && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  ✅ Password updated successfully
                </div>
              )}
              <div className="field">
                <label>New Password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" />
              </div>
              <div className="field">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
              </div>
              <button type="submit"
                className="h-10 px-5 rounded-xl font-bold text-sm text-white"
                style={{ background: '#1f2528' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
