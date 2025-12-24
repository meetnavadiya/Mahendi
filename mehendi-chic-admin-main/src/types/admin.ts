export interface Category {
  id: string;
  name: string;
  image: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  image: string;
  createdAt: Date;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
}

export interface AdminState {
  isLoggedIn: boolean;
  categories: Category[];
  products: Product[];
  contacts: ContactSubmission[];
}
