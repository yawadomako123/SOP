export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

export const mockProducts: Product[] = [
  { id: 'PROD-001', name: 'Wireless Headphones', category: 'Electronics', stock: 120, price: 150.00 },
  { id: 'PROD-002', name: 'Coffee Maker', category: 'Appliances', stock: 30, price: 85.50 },
  { id: 'PROD-003', name: 'Running Shoes', category: 'Apparel', stock: 45, price: 120.99 },
  { id: 'PROD-004', name: 'Smart Watch', category: 'Electronics', stock: 200, price: 299.00 },
  { id: 'PROD-005', name: 'Water Bottle', category: 'Accessories', stock: 10, price: 25.00 },
  { id: 'PROD-006', name: 'Yoga Mat', category: 'Fitness', stock: 55, price: 35.50 },
  { id: 'PROD-007', name: 'Desk Lamp', category: 'Home', stock: 8, price: 45.00 },
  { id: 'PROD-008', name: 'Keyboard', category: 'Electronics', stock: 25, price: 89.99 },
];
