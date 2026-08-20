export interface Venue {
  id: number;
  name: string;
  location: string;
  guests: string;
  price: string;
  rating: number;
  tag?: string;
  img: string;
  description: string;
  tagline: string;
  features: string[];
  gallery: string[];
}

export const venues: Venue[] = [
  {
    id: 1,
    name: "The Taj Hotel",
    location: "Jaipur, India",
    guests: "Up to 380 guests",
    price: "₹4,500",
    rating: 4.9,
    tag: "Featured",
    img: "/venue.png",
    description:
      "Constructed in 1894, The Gilded Ballroom stands as a pinnacle of Victorian architecture and timeless elegance. Originally commissioned as a private gala hall for the city's social elite, it has been meticulously restored to preserve its original plasterwork, hand-carved mahogany doors, and iconic crystal chandeliers. The space features twenty-foot ceilings, original parquet floors, and a mezzanine balcony that provides a breathtaking perspective of the celebrations below. Flooded with natural light during the day and transformed into a golden oasis by night, the venue offers an unparalleled backdrop for the modern host who values history and sophistication.",
    tagline: "A legacy of refinement",
    features: [
      "Ballroom seating up to 380 guests",
      "Heritage banquet hall and terrace",
      "Premium catering options",
      "Custom event planning support",
    ],
    gallery: [
      "/venue.png",
      "/venue1.png",
      "/venue2.png",
      "/venue3.png",
      "/venue4.png",
    ],
  },
  {
    id: 2,
    name: "Heritage Oak Vineyard",
    location: "Napa Valley, CA",
    guests: "Up to 200 guests",
    price: "₹5,800",
    rating: 4.8,
    tag: "Popular",
    img: "/venue1.png",
    description:
      "An intimate vineyard estate set among rolling hills, the Heritage Oak Vineyard blends rustic elegance with luxury service. Perfect for couples seeking a refined destination event experience.",
    tagline: "Timeless vineyard celebrations",
    features: [
      "Outdoor ceremony lawns",
      "Private tasting rooms",
      "Custom wine-pairing menus",
      "Luxury guest suites",
    ],
    gallery: [
      "/venue1.png",
      "/venue1.png",
      "/venue1.png",
      "/venue1.png",
    ],
  },
  {
    id: 3,
    name: "Desert Rose Estate",
    location: "Scottsdale, AZ",
    guests: "Up to 100 guests",
    price: "₹4,100",
    rating: 5.0,
    tag: "New",
    img: "/venue2.png",
    description:
      "Desert Rose Estate offers a warm desert oasis with minimalist luxury. The estate’s intimate spaces, crisp architecture, and private gardens are perfect for refined gatherings.",
    tagline: "Desert minimalism with soul",
    features: [
      "Sunset terrace ceremony space",
      "Exclusive catering service",
      "Modern interiors with natural warmth",
      "Concierge planning support",
    ],
    gallery: [
      "/venue2.png",
      "/venue3.png",
      "/venue4.png",
      "/venue1.png",
    ],
  },
];

export interface CartItem {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  img: string;
}

export const cartItems: CartItem[] = [
  {
    id: 1,
    title: "The Gilded Ballroom",
    subtitle: "Full-day rental • Oct 24, 2024",
    price: "₹4,500",
    img: "venue3.png",
  },
  {
    id: 2,
    title: "Heritage Flavors",
    subtitle: "Catering package • 50 Guests",
    price: "₹1,250",
    img: "venue4.png",
  },
];
