export type Product = {
  slug: string;
  name: string;
  image: string;
};

export const products: Product[] = [
  { slug: "tshirts", name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85" },
  { slug: "polos", name: "Polo Shirts", image: "https://images.unsplash.com/photo-1625910513413-5fc4a7b6a9c1?auto=format&fit=crop&w=900&q=85" },
  { slug: "hoodies", name: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85" },
  { slug: "sweatshirts", name: "Sweatshirts", image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&q=85" },
  { slug: "shirts", name: "Casual Shirts", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85" },
  { slug: "trousers", name: "Trousers", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85" }
];

export const company = {
  email: "info@shunyigarments.com",
  phone: "+880 1XXXXXXXXX",
  location: "Bangladesh"
};
