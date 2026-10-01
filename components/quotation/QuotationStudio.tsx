'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useQuotationStore } from '@/hooks/useQuotationStore';
import { calcRoomAreas, calcMeasurementSummary, calcQuotationTotals, calcLineItem } from '@/lib/calculations';
import { formatINR, formatNumber, toDateString, addDays, uid, cn } from '@/lib/utils';
import type { Quotation, Room, QuotationItem, PropertyType, ProjectType, RoomType, Zone, SurfaceCondition, WorkType, ItemType } from '@/types/quotation';
import type { Product } from '@/types/catalog';
import { Plus, Trash2, ChevronDown, ChevronUp, Calculator, Save, Printer, Share2, Eye } from 'lucide-react';

const ROOM_TYPES: RoomType[] = ['Living Room','Bedroom','Master Bedroom','Dining','Kitchen','Bathroom','Office','Passage','Staircase','Exterior Front','Exterior Side','Exterior Back','Terrace','Other'];
const SURFACE_CONDITIONS: SurfaceCondition[] = ['New Plaster','Sound Existing Paint','Peeling / Flaking','Damp / Moisture','Cracked Surface','Other'];
const WORK_TYPES: WorkType[] = ['Prep','Crack Repair','Putty','Primer','Topcoat','Waterproofing','Ceiling','Texture','Labour','Additional','Other'];
const PROPERTY_TYPES: PropertyType[] = ['Apartment','Villa','Independent House','Office','Commercial','Other'];
const PROJECT_TYPES: ProjectType[] = ['Residential','Commercial','Repainting','New Construction','Maintenance'];

interface QuotationStudioProps {
  quotationNumber?: string;
  products: Product[];
  initialQuotation?: Quotation;
  profileDefaults: {
    gst_percent: number;
    advance_percent: number;
    labour_interior: number;
    labour_exterior: number;
    terms: string;
    prefix: string;
  };
}

export function QuotationStudio({ quotationNumber, products, profileDefaults, initialQuotation }: QuotationStudioProps) {
  const router = useRouter();
  const supabase = createClient();
  const store = useQuotationStore();
  const { draft, updateDraft, addRoom, updateRoom, removeRoom, addItem, updateItem, removeItem, addLabourLine, recalculate } = store;

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeSection, setActiveSection] = useState<'customer' | 'rooms' | 'scope' | 'commercial'>('customer');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  // Apply profile defaults on mount for new quotations, or load existing
  useEffect(() => {
    if (initialQuotation) {
      store.loadQuotation(initialQuotation);
    } else if (!quotationNumber && !draft.customer_name) {
      updateDraft({
        gst_percent: profileDefaults.gst_percent,
        advance_percent: profileDefaults.advance_percent,
        labour_interior_rate: profileDefaults.labour_interior,
        labour_exterior_rate: profileDefaults.labour_exterior,
        terms: profileDefaults.terms,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = calcQuotationTotals(draft);
  const measurements = calcMeasurementSummary(draft.rooms);

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      recalculate();
      const finalTotals = calcQuotationTotals(draft);

      const payload = {
        owner_id: user.id,
        quotation_number: draft.quotation_number,
        quotation_date: draft.quotation_date,
        valid_until: draft.valid_until,
        customer_name: draft.customer_name || '',
        customer_phone: draft.customer_phone || '',
        customer_email: draft.customer_email || '',
        customer_city: draft.customer_city || '',
        site_address: draft.site_address || '',
        project_name: draft.project_name || '',
        property_type: draft.property_type,
        project_type: draft.project_type,
        floors: draft.floors || 1,
        ...finalTotals,
        discount_percent: draft.discount_percent,
        gst_percent: draft.gst_percent,
        advance_percent: draft.advance_percent,
        labour_interior_rate: draft.labour_interior_rate,
        labour_exterior_rate: draft.labour_exterior_rate,
        status: draft.status || 'Draft',
        terms: draft.terms || '',
        notes: draft.notes || '',
        rooms_json: JSON.stringify(draft.rooms),
        items_json: JSON.stringify(draft.items),
      };

      const { error } = await supabase
        .from('quotations')
        .upsert(payload, { onConflict: 'owner_id,quotation_number' });

      if (error) throw error;

      // Save local backup too
      store.saveLocal({ ...draft, ...finalTotals });

      showToast('✅ Quotation saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showToast(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `*PaintPro Quotation*\n\nCustomer: ${draft.customer_name || 'Client'}\nQuotation: ${draft.quotation_number}\nProject: ${draft.project_name || draft.site_address || 'Project'}\n\nGrand Total: ${formatINR(totals.grand_total)}\nAdvance (${draft.advance_percent}%): ${formatINR(totals.advance_amount)}\n\nValid until: ${draft.valid_until}\n\nPrepared with PaintPro Professional Workspace`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  function handlePrint() {
    window.print();
  }

  const sections = [
    { id: 'customer', label: '1. Customer & Project' },
    { id: 'rooms', label: '2. Rooms & Measurements' },
    { id: 'scope', label: '3. Work Scope' },
    { id: 'commercial', label: '4. Commercial Details' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {quotationNumber ? `Edit ${draft.quotation_number}` : 'New Quotation'}
          </h1>
          <p className="text-sm text-muted">{draft.customer_name ? `For ${draft.customer_name}` : 'Build your client quotation step by step'}</p>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          <button onClick={handleSave} disabled={saving}
            className="h-10 px-4 rounded-xl font-bold text-sm text-white flex items-center gap-1.5 transition-opacity"
            style={{ background: saving ? '#999' : '#1f2528' }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={handlePrint} className="h-10 px-4 rounded-xl font-bold text-sm border border-[#d9d4cd] bg-white flex items-center gap-1.5">
            <Printer size={14} /> Print
          </button>
          <button onClick={handleWhatsApp}
            className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 text-white"
            style={{ background: '#25D366' }}>
            <Share2 size={14} /> WhatsApp
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Main Form */}
        <div className="space-y-4">
          {/* Section Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((s) => (
              <button key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn('pill whitespace-nowrap', activeSection === s.id ? 'active' : '')}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Customer & Project */}
          {activeSection === 'customer' && (
            <div className="panel">
              <div className="panel-head">
                <div className="flex items-center gap-2">
                  <span className="inline-grid place-items-center w-6 h-6 rounded-lg bg-[#1f2528] text-white text-[10px] font-black">1</span>
                  <b className="text-sm">Customer & Project Details</b>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="field">
                    <label>Customer Name *</label>
                    <input value={draft.customer_name || ''} onChange={(e) => updateDraft({ customer_name: e.target.value })} placeholder="Customer full name" />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input type="tel" value={draft.customer_phone || ''} onChange={(e) => updateDraft({ customer_phone: e.target.value })} placeholder="10-digit mobile" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={draft.customer_email || ''} onChange={(e) => updateDraft({ customer_email: e.target.value })} placeholder="email@example.com" />
                  </div>
                  <div className="field">
                    <label>City</label>
                    <input value={draft.customer_city || ''} onChange={(e) => updateDraft({ customer_city: e.target.value })} placeholder="City" />
                  </div>
                  <div className="field sm:col-span-2">
                    <label>Site Address</label>
                    <input value={draft.site_address || ''} onChange={(e) => updateDraft({ site_address: e.target.value })} placeholder="Full site/property address" />
                  </div>
                </div>

                <div className="border-t border-[#e5e1da] pt-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Project Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="field">
                      <label>Project Name</label>
                      <input value={draft.project_name || ''} onChange={(e) => updateDraft({ project_name: e.target.value })} placeholder="e.g. Sharma Residence" />
                    </div>
                    <div className="field">
                      <label>Number of Floors</label>
                      <input type="number" min="1" max="50" value={draft.floors || 1} onChange={(e) => updateDraft({ floors: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="field">
                      <label>Property Type</label>
                      <select value={draft.property_type} onChange={(e) => updateDraft({ property_type: e.target.value as PropertyType })}>
                        {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Project Type</label>
                      <select value={draft.project_type} onChange={(e) => updateDraft({ project_type: e.target.value as ProjectType })}>
                        {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Quotation Date</label>
                      <input type="date" value={draft.quotation_date} onChange={(e) => updateDraft({ quotation_date: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Valid Until</label>
                      <input type="date" value={draft.valid_until} onChange={(e) => updateDraft({ valid_until: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rooms & Measurements */}
          {activeSection === 'rooms' && (
            <div className="space-y-4">
              <div className="panel">
                <div className="panel-head">
                  <div className="flex items-center gap-2">
                    <span className="inline-grid place-items-center w-6 h-6 rounded-lg bg-[#1f2528] text-white text-[10px] font-black">2</span>
                    <b className="text-sm">Rooms & Measurements</b>
                  </div>
                  <button onClick={addRoom}
                    className="h-9 px-4 rounded-xl font-bold text-sm text-white flex items-center gap-1.5"
                    style={{ background: '#d2ad76' }}>
                    <Plus size={14} /> Add Room
                  </button>
                </div>

                {/* Measurement Summary */}
                {draft.rooms.length > 0 && (
                  <div className="px-5 py-4 border-b border-[#e5e1da] grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Interior Walls', value: formatNumber(measurements.total_interior_wall, 0) + ' sq.ft' },
                      { label: 'Exterior Walls', value: formatNumber(measurements.total_exterior_wall, 0) + ' sq.ft' },
                      { label: 'Ceiling', value: formatNumber(measurements.total_ceiling, 0) + ' sq.ft' },
                      { label: 'Rooms / Zones', value: measurements.room_count },
                    ].map((m) => (
                      <div key={m.label} className="bg-[#f8f6f2] rounded-xl p-3">
                        <div className="text-xs text-muted font-bold uppercase tracking-wide">{m.label}</div>
                        <div className="text-lg font-black mt-1">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="divide-y divide-[#e5e1da]">
                  {draft.rooms.length === 0 ? (
                    <div className="py-12 text-center text-muted text-sm">
                      No rooms yet.{' '}
                      <button onClick={addRoom} className="font-semibold" style={{ color: '#8b652e' }}>Add your first room →</button>
                    </div>
                  ) : (
                    draft.rooms.map((room, idx) => {
                      const areas = calcRoomAreas(room);
                      return (
                        <div key={room.id} className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-bold text-sm">{room.name}</div>
                              <div className="text-xs text-muted mt-0.5">
                                {room.zone} · {room.room_type} · {formatNumber(areas.total_area_sqft, 0)} sq.ft calculated
                              </div>
                            </div>
                            <button onClick={() => removeRoom(room.id)}
                              className="w-8 h-8 rounded-lg border border-[#dfdad2] bg-white text-muted hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                            <div className="field">
                              <label>Room Name</label>
                              <input value={room.name} onChange={(e) => updateRoom(room.id, { name: e.target.value })} />
                            </div>
                            <div className="field">
                              <label>Room Type</label>
                              <select value={room.room_type} onChange={(e) => updateRoom(room.id, { room_type: e.target.value as RoomType })}>
                                {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
                              </select>
                            </div>
                            <div className="field">
                              <label>Zone</label>
                              <select value={room.zone} onChange={(e) => updateRoom(room.id, { zone: e.target.value as Zone })}>
                                <option>Interior</option>
                                <option>Exterior</option>
                              </select>
                            </div>
                            <div className="field">
                              <label>Length (ft)</label>
                              <input type="number" min="0" step="0.5" value={room.length_ft} onChange={(e) => updateRoom(room.id, { length_ft: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="field">
                              <label>Width (ft)</label>
                              <input type="number" min="0" step="0.5" value={room.width_ft} onChange={(e) => updateRoom(room.id, { width_ft: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="field">
                              <label>Height (ft)</label>
                              <input type="number" min="0" step="0.5" value={room.height_ft} onChange={(e) => updateRoom(room.id, { height_ft: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="field">
                              <label>Doors + Windows (sq.ft)</label>
                              <input type="number" min="0" step="1" value={room.openings_sqft} onChange={(e) => updateRoom(room.id, { openings_sqft: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="field">
                              <label>Surface Condition</label>
                              <select value={room.surface_condition} onChange={(e) => updateRoom(room.id, { surface_condition: e.target.value as SurfaceCondition })}>
                                {SURFACE_CONDITIONS.map((s) => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="field">
                              <label>Room Notes</label>
                              <input value={room.notes || ''} onChange={(e) => updateRoom(room.id, { notes: e.target.value })} placeholder="Special instructions…" />
                            </div>
                          </div>

                          {/* Calculated Stats */}
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Wall Area', value: formatNumber(areas.wall_area_sqft, 0) },
                              { label: 'Net Wall', value: formatNumber(areas.net_wall_area_sqft, 0) },
                              { label: 'Ceiling', value: formatNumber(areas.ceiling_area_sqft, 0) },
                              { label: 'Total', value: formatNumber(areas.total_area_sqft, 0) },
                            ].map((s) => (
                              <div key={s.label} className="bg-[#f8f6f2] rounded-xl p-2.5 text-center">
                                <div className="text-[11px] font-black">{s.value}</div>
                                <div className="text-[9px] text-muted mt-0.5">{s.label} sq.ft</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Work Scope */}
          {activeSection === 'scope' && (
            <div className="panel">
              <div className="panel-head">
                <div className="flex items-center gap-2">
                  <span className="inline-grid place-items-center w-6 h-6 rounded-lg bg-[#1f2528] text-white text-[10px] font-black">3</span>
                  <b className="text-sm">Work Scope & Line Items</b>
                </div>
                <button onClick={addItem}
                  className="h-9 px-4 rounded-xl font-bold text-sm text-white flex items-center gap-1.5"
                  style={{ background: '#d2ad76' }}>
                  <Plus size={14} /> Add Line
                </button>
              </div>

              {/* Labour Quick-add */}
              {draft.rooms.length > 0 && (
                <div className="px-5 py-3 border-b border-[#e5e1da] flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted font-bold">Quick add labour:</span>
                  <button onClick={() => {
                    const area = measurements.total_interior_wall + measurements.total_ceiling;
                    if (!area) { showToast('Add room measurements first'); return; }
                    if (!draft.labour_interior_rate) { showToast('Set interior labour rate in Commercial section first'); return; }
                    addLabourLine('Interior', area);
                    showToast('Interior labour added');
                  }} className="pill text-xs">+ Interior Labour</button>
                  <button onClick={() => {
                    const area = measurements.total_exterior_wall;
                    if (!area) { showToast('No exterior rooms found'); return; }
                    if (!draft.labour_exterior_rate) { showToast('Set exterior labour rate in Commercial section first'); return; }
                    addLabourLine('Exterior', area);
                    showToast('Exterior labour added');
                  }} className="pill text-xs">+ Exterior Labour</button>
                </div>
              )}

              {/* Scope Table - scrollable on mobile */}
              <div className="overflow-x-auto">
                {draft.items.length === 0 ? (
                  <div className="py-12 text-center text-muted text-sm">
                    No scope lines yet. <button onClick={addItem} className="font-semibold" style={{ color: '#8b652e' }}>Add a line →</button>
                  </div>
                ) : (
                  <table className="w-full border-collapse" style={{ minWidth: 900 }}>
                    <thead>
                      <tr className="bg-[#f7f4ef] text-left text-[9px] uppercase tracking-widest text-muted">
                        <th className="px-3 py-2.5 font-black">Type</th>
                        <th className="px-3 py-2.5 font-black">Room</th>
                        <th className="px-3 py-2.5 font-black">Zone</th>
                        <th className="px-3 py-2.5 font-black">Work</th>
                        <th className="px-3 py-2.5 font-black min-w-[200px]">Product</th>
                        <th className="px-3 py-2.5 font-black">Area sq.ft</th>
                        <th className="px-3 py-2.5 font-black">Coats</th>
                        <th className="px-3 py-2.5 font-black">Coverage</th>
                        <th className="px-3 py-2.5 font-black">Qty</th>
                        <th className="px-3 py-2.5 font-black">Rate ₹</th>
                        <th className="px-3 py-2.5 font-black">Amount</th>
                        <th className="px-3 py-2.5 font-black"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.items.map((item) => {
                        const calc = calcLineItem(item, draft.rooms);
                        return (
                          <tr key={item.id} className="border-t border-[#e5e1da] hover:bg-[#fdfcf9]">
                            <td className="px-2 py-1.5">
                              <select value={item.item_type} onChange={(e) => updateItem(item.id, { item_type: e.target.value as ItemType })}
                                className="h-9 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white w-24">
                                {['Material','Labour','Other'].map((v) => <option key={v}>{v}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={item.room_name || ''} onChange={(e) => updateItem(item.id, { room_name: e.target.value })}
                                className="h-9 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white w-32">
                                <option value="">Project</option>
                                {draft.rooms.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={item.zone} onChange={(e) => updateItem(item.id, { zone: e.target.value as Zone })}
                                className="h-9 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white w-24">
                                <option>Interior</option>
                                <option>Exterior</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={item.work_type} onChange={(e) => updateItem(item.id, { work_type: e.target.value as WorkType })}
                                className="h-9 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white w-24">
                                {WORK_TYPES.map((v) => <option key={v}>{v}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={item.product_id || ''} onChange={(e) => {
                                  const p = products.find((x) => x.id === e.target.value);
                                  updateItem(item.id, {
                                    product_id: e.target.value,
                                    product_name: p?.name,
                                    description: p?.name || item.description,
                                    coats: p?.recommended_coats || item.coats,
                                    coverage: p?.coverage || item.coverage,
                                    rate: p?.working_price || item.rate,
                                  });
                                }}
                                className="h-9 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white w-52">
                                <option value="">— Select product —</option>
                                {products.map((p) => <option key={p.id} value={p.id}>{p.brand} · {p.name}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0" step="1"
                                value={item.area_sqft || calc.area || 0}
                                onChange={(e) => updateItem(item.id, { area_sqft: parseFloat(e.target.value) || 0 })}
                                className="h-9 w-20 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="1" step="1"
                                value={item.coats || 2}
                                onChange={(e) => updateItem(item.id, { coats: parseInt(e.target.value) || 1 })}
                                className="h-9 w-14 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0" step="0.01"
                                value={item.coverage || 0}
                                placeholder="sq.ft/unit"
                                onChange={(e) => updateItem(item.id, { coverage: parseFloat(e.target.value) || 0 })}
                                className="h-9 w-20 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0" step="0.01"
                                value={item.manual_qty ? item.quantity : Math.round(calc.quantity * 100) / 100}
                                onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0, manual_qty: true })}
                                className="h-9 w-20 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0" step="0.01"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                                className="h-9 w-20 border border-[#d8d3cc] rounded-xl px-2 text-xs bg-white" />
                            </td>
                            <td className="px-2 py-1.5 font-black text-sm whitespace-nowrap">
                              {formatINR(calc.amount)}
                            </td>
                            <td className="px-2 py-1.5">
                              <button onClick={() => removeItem(item.id)}
                                className="w-7 h-7 rounded-lg border border-[#dfdad2] bg-white text-muted hover:text-red-500 flex items-center justify-center">
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Commercial Details */}
          {activeSection === 'commercial' && (
            <div className="panel">
              <div className="panel-head">
                <div className="flex items-center gap-2">
                  <span className="inline-grid place-items-center w-6 h-6 rounded-lg bg-[#1f2528] text-white text-[10px] font-black">4</span>
                  <b className="text-sm">Commercial Details</b>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="field">
                    <label>Discount %</label>
                    <input type="number" min="0" max="100" step="0.5"
                      value={draft.discount_percent || 0}
                      onChange={(e) => updateDraft({ discount_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="field">
                    <label>GST %</label>
                    <input type="number" min="0" max="100" step="0.5"
                      value={draft.gst_percent || 18}
                      onChange={(e) => updateDraft({ gst_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="field">
                    <label>Advance %</label>
                    <input type="number" min="0" max="100" step="5"
                      value={draft.advance_percent || 0}
                      onChange={(e) => updateDraft({ advance_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="field">
                    <label>Interior Labour ₹/sq.ft</label>
                    <input type="number" min="0" step="0.5"
                      value={draft.labour_interior_rate || 0}
                      onChange={(e) => updateDraft({ labour_interior_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="field">
                    <label>Exterior Labour ₹/sq.ft</label>
                    <input type="number" min="0" step="0.5"
                      value={draft.labour_exterior_rate || 0}
                      onChange={(e) => updateDraft({ labour_exterior_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="field">
                    <label>Quotation Status</label>
                    <select value={draft.status} onChange={(e) => updateDraft({ status: e.target.value as any })}>
                      {['Draft','Sent','Accepted','Rejected','Expired'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field sm:col-span-3">
                    <label>Terms & Conditions / Notes</label>
                    <textarea rows={5}
                      value={draft.terms || ''}
                      onChange={(e) => updateDraft({ terms: e.target.value })}
                      placeholder="Payment schedule, scope inclusions/exclusions, warranty, cleanup policy…"
                    />
                  </div>
                  <div className="field sm:col-span-3">
                    <label>Internal Notes</label>
                    <textarea rows={2}
                      value={draft.notes || ''}
                      onChange={(e) => updateDraft({ notes: e.target.value })}
                      placeholder="Internal notes (not shown on client quotation)" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <aside className="space-y-4">
          {/* Grand Total Card */}
          <div className="panel sticky top-20">
            <div className="p-5">
              <div className="summary-kpi mb-4">
                <small className="block text-[#adb4b6] text-[10px] uppercase tracking-widest">Grand Total</small>
                <strong className="block text-3xl font-black mt-1">{formatINR(totals.grand_total)}</strong>
                <span className="text-[10px] text-[#bbc2c4]">After discount + GST</span>
              </div>

              {[
                { label: 'Scope Subtotal', value: totals.subtotal },
                { label: `Discount (${draft.discount_percent}%)`, value: -totals.discount_amount },
                { label: 'Taxable Amount', value: totals.taxable_amount },
                { label: `GST (${draft.gst_percent}%)`, value: totals.gst_amount },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 text-sm border-t border-[#e5e1da] first:border-t-0">
                  <span className="text-muted">{row.label}</span>
                  <strong>{formatINR(Math.abs(row.value))}</strong>
                </div>
              ))}

              <div className="flex justify-between pt-3 mt-1 border-t-2 border-[#e5e1da] font-black text-lg">
                <span>Grand Total</span>
                <span>{formatINR(totals.grand_total)}</span>
              </div>

              {draft.advance_percent > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm text-muted">
                    <span>Advance ({draft.advance_percent}%)</span>
                    <span className="font-bold text-ink">{formatINR(totals.advance_amount)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-muted">
                    <span>Balance Due</span>
                    <span className="font-bold text-ink">{formatINR(totals.balance_amount)}</span>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={handleSave} disabled={saving}
                  className="h-10 rounded-xl font-bold text-sm text-white"
                  style={{ background: saving ? '#999' : '#1f2528' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={handlePrint}
                  className="h-10 rounded-xl font-bold text-sm border border-[#d9d4cd] bg-white">
                  PDF / Print
                </button>
              </div>
              <button onClick={handleWhatsApp}
                className="w-full h-10 rounded-xl font-bold text-sm text-white mt-2 flex items-center justify-center gap-2"
                style={{ background: '#25D366' }}>
                <Share2 size={14} /> Share on WhatsApp
              </button>
            </div>

            {/* Measurement Summary in sidebar */}
            {draft.rooms.length > 0 && (
              <div className="border-t border-[#e5e1da] p-4">
                <div className="text-xs font-black uppercase tracking-wider text-muted mb-3">Measurements</div>
                {[
                  { label: 'Interior', value: formatNumber(measurements.total_interior_wall + measurements.total_ceiling, 0) + ' sq.ft' },
                  { label: 'Exterior', value: formatNumber(measurements.total_exterior_wall, 0) + ' sq.ft' },
                  { label: 'Ceiling', value: formatNumber(measurements.total_ceiling, 0) + ' sq.ft' },
                  { label: 'Rooms', value: measurements.room_count },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between text-xs py-1.5 border-t border-[#e5e1da] first:border-t-0">
                    <span className="text-muted">{m.label}</span>
                    <span className="font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Toast */}
      <div className={cn('toast', toast ? 'show' : '')}>{toast}</div>
    </div>
  );
}
