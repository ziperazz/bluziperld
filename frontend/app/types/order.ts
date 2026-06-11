export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "writing"
  | "shipping"
  | "delivered";

export interface Order {
  id: string;
  customerName: string;
  envelope: string;
  text: string;
  price: number;
  status: OrderStatus;
  trackingCode?: string;
  createdAt: string;
}
