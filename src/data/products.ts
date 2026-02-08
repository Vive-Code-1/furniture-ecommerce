import chair1 from "@/assets/products/chair-1.png";
import sofa1 from "@/assets/products/sofa-1.png";
import cabinet1 from "@/assets/products/cabinet-1.png";
import bench1 from "@/assets/products/bench-1.png";
import chair2 from "@/assets/products/chair-2.png";
import muffinChair from "@/assets/products/muffin-chair.png";
import ellaChair from "@/assets/products/ella-chair.png";
import officeChair1 from "@/assets/products/office-chair-1.png";
import officeChair2 from "@/assets/products/office-chair-2.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  dimensions?: string;
  materials?: string;
}

export const categories = ["All", "Chair", "Office Chair", "Cabinet", "Sofa", "Bed"] as const;

export const products: Product[] = [
  {
    id: "1",
    name: "Emy Sofa",
    price: 266,
    image: sofa1,
    category: "Sofa",
    description: "A beautifully crafted mid-century modern sofa with tufted back and premium fabric upholstery.",
    dimensions: "200 x 85 x 80 cm",
    materials: "Premium fabric, solid wood legs",
  },
  {
    id: "2",
    name: "Easy Sofa",
    price: 126,
    image: chair1,
    category: "Chair",
    description: "Comfortable accent armchair with soft gray fabric and ergonomic design.",
    dimensions: "75 x 80 x 85 cm",
    materials: "Cotton blend fabric, beech wood legs",
  },
  {
    id: "3",
    name: "Cabinet",
    price: 138,
    image: cabinet1,
    category: "Cabinet",
    description: "Modern teal cabinet with two doors, perfect for stylish storage.",
    dimensions: "80 x 40 x 120 cm",
    materials: "Solid wood, brass handles",
  },
  {
    id: "4",
    name: "Rump Chair",
    price: 100,
    image: bench1,
    category: "Chair",
    description: "Scandinavian-inspired wooden bench with armrests, ideal for entryways.",
    dimensions: "120 x 55 x 80 cm",
    materials: "Solid beech wood",
  },
  {
    id: "5",
    name: "Ramp Tol",
    price: 86,
    image: ellaChair,
    category: "Chair",
    description: "Elegant dining chair with upholstered seat and natural wood legs.",
    dimensions: "55 x 58 x 82 cm",
    materials: "Wool blend fabric, oak legs",
  },
  {
    id: "6",
    name: "Almish",
    price: 222,
    image: chair2,
    category: "Chair",
    description: "Luxurious deep blue velvet armchair with curved silhouette.",
    dimensions: "78 x 82 x 85 cm",
    materials: "Velvet upholstery, walnut legs",
  },
  {
    id: "7",
    name: "ErgoMax Pro",
    price: 345,
    image: officeChair1,
    category: "Office Chair",
    description: "Ergonomic mesh office chair with adjustable lumbar support, armrests, and breathable back for all-day comfort.",
    dimensions: "65 x 65 x 110 cm",
    materials: "Mesh fabric, aluminum base, nylon casters",
  },
  {
    id: "8",
    name: "Executive Luxe",
    price: 489,
    image: officeChair2,
    category: "Office Chair",
    description: "Premium leather executive chair with high back, headrest, and tilt mechanism for superior comfort.",
    dimensions: "70 x 72 x 125 cm",
    materials: "Genuine leather, steel frame, chrome base",
  },
];

export const heroProducts = [
  {
    id: "hero-1",
    name: "Muffin Chair",
    price: 119,
    image: muffinChair,
  },
  {
    id: "hero-2",
    name: "Ella Chair",
    price: 161,
    image: ellaChair,
  },
];
