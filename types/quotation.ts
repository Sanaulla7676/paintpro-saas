export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  logo_url?: string;
  signature_url?: string;
  default_gst: number;
  default_validity: string;
  default_advance: number;
  default_labour_interior: number;
  default_labour_exterior: number;
  default_terms?: string;
  quotation_prefix: string;
  quotation_counter: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  owner_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  owner_id: string;
  customer_id: string;
  project_name: string;
  property_type: PropertyType;
  project_type: ProjectType;
  address?: string;
  city?: string;
  floors: number;
  notes?: string;
  customer?: Customer;
  created_at?: string;
  updated_at?: string;
}

export type PropertyType = 'Apartment' | 'Villa' | 'Independent House' | 'Office' | 'Commercial' | 'Other';
export type ProjectType = 'Residential' | 'Commercial' | 'Repainting' | 'New Construction' | 'Maintenance';
export type RoomType = 'Living Room' | 'Bedroom' | 'Master Bedroom' | 'Dining' | 'Kitchen' | 'Bathroom' | 'Office' | 'Passage' | 'Staircase' | 'Exterior Front' | 'Exterior Side' | 'Exterior Back' | 'Terrace' | 'Other';
export type Zone = 'Interior' | 'Exterior';
export type SurfaceCondition = 'New Plaster' | 'Sound Existing Paint' | 'Peeling / Flaking' | 'Damp / Moisture' | 'Cracked Surface' | 'Other';

export interface Room {
  id: string;
  project_id?: string;
  name: string;
  room_type: RoomType;
  zone: Zone;
  length_ft: number;
  width_ft: number;
  height_ft: number;
  openings_sqft: number;
  surface_condition: SurfaceCondition;
  notes?: string;
  // Computed
  wall_area_sqft?: number;
  ceiling_area_sqft?: number;
  net_wall_area_sqft?: number;
  total_area_sqft?: number;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
export type WorkType = 'Prep' | 'Crack Repair' | 'Putty' | 'Primer' | 'Topcoat' | 'Waterproofing' | 'Ceiling' | 'Texture' | 'Labour' | 'Additional' | 'Other';
export type ItemType = 'Material' | 'Labour' | 'Other';

export interface QuotationItem {
  id: string;
  quotation_id?: string;
  item_type: ItemType;
  room_name?: string;
  zone: Zone;
  work_type: WorkType;
  product_id?: string;
  product_name?: string;
  description: string;
  area_sqft: number;
  coats: number;
  coverage: number; // sq.ft per unit
  quantity: number;
  unit: string;
  rate: number; // paise internally, display as rupees
  amount: number;
  sort_order?: number;
  manual_qty?: boolean;
}

export interface QuotationTotals {
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
  advance_amount: number;
  balance_amount: number;
}

export interface Quotation {
  id?: string;
  owner_id?: string;
  customer_id?: string;
  project_id?: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  // Customer snapshot (for quick access)
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_city?: string;
  site_address?: string;
  // Project snapshot
  project_name?: string;
  property_type?: PropertyType;
  project_type?: ProjectType;
  floors?: number;
  // Financial
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  gst_percent: number;
  gst_amount: number;
  grand_total: number;
  advance_percent: number;
  advance_amount: number;
  balance_amount: number;
  // Labour
  labour_interior_rate: number;
  labour_exterior_rate: number;
  // Content
  status: QuotationStatus;
  terms?: string;
  notes?: string;
  // Relations
  rooms: Room[];
  items: QuotationItem[];
  // Meta
  created_at?: string;
  updated_at?: string;
}

export interface MeasurementSummary {
  total_interior_wall: number;
  total_exterior_wall: number;
  total_ceiling: number;
  total_net_area: number;
  room_count: number;
}
