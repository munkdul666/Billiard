export type TableStatus = "free" | "occupied" | "reserved";
export type ProductCategory = "beverage" | "beer" | "snack" | "other";
export type SessionStatus = "active" | "closed";

export interface Table {
  id: string;
  number: number;
  name: string;
  status: TableStatus;
  started_at: string | null;
  current_session_id: string | null;
  hourly_rate: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  table_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  table_charge: number;
  items_total: number;
  total_amount: number;
  status: SessionStatus;
  note: string | null;
  created_at: string;
}

export interface SessionItem {
  id: string;
  session_id: string;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  created_at: string;
}
