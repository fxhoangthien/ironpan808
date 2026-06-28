export const HOME_MENU_PREVIEW = {
  name: "BANH MI COLLECTION",
  description: "Fresh-baked baguette, house pickles, fresh vegetables.",
  items: [
    {
      name: "Lemongrass BBQ Pork Banh Mi",
      price: "$11",
      description:
        "Fragrant lemongrass-marinated pork, grilled to a perfect caramelized edge, tucked inside a warm, crispy baguette with bright house pickles and fresh, crunchy vegetables.",
    },
    {
      name: "Signature Meatball Banh Mi",
      price: "$11",
      description:
        "Juicy, flavorful Vietnamese meatballs simmered in a savory sauce, paired with a crisp baguette, house-made pickles, and refreshing vegetables for the perfect balance of richness and freshness.",
    },
    {
      name: "House Special Banh Mi",
      price: "$11",
      description:
        "A classic Vietnamese favorite featuring premium cold cuts and silky house-made pâté, layered inside a warm baguette with tangy pickles and fresh herbs for a bold, unforgettable bite.",
    },
    {
      name: "Sauteed Beef & Eggs Banh Mi",
      price: "$11",
      description:
        "Tender sautéed beef with rich, golden eggs, combined with house pickles and crisp vegetables inside a freshly baked baguette — hearty, savory, and deeply satisfying.",
    },
  ],
};

export const FULL_MENU = [
  {
    id: "signature-skillets",
    name: "SIGNATURE SKILLETS",
    description: "Served sizzling with warm artisan Banh Mi & fresh vegetables.",
    images: "menuSkillets",
    items: [
      { name: "Classic Pan", price: "$18.95", description: "Two eggs, seasoned beef, house pate, pork loaf." },
      {
        name: "Cheesy Delight Pan",
        price: "$19.95",
        description: "Two eggs, seasoned beef, house pate, pork loaf, melted premium cheese.",
      },
      {
        name: "Signature Meatball Pan",
        price: "$21.95",
        description: "Two eggs, seasoned beef, house pate, pork loaf, handcrafted meatballs.",
      },
      {
        name: "Lemongrass BBQ Pork Pan",
        price: "$21.95",
        description: "Two eggs, grilled lemongrass pork, house pate, pork loaf.",
      },
      {
        name: "All-in Deluxe Pan",
        price: "$24.95",
        description:
          "Three eggs, seasoned beef, house pate, pork loaf, assorted cold cuts, handcrafted meatballs.",
      },
    ],
  },
  {
    id: "sides",
    name: "SIDES",
    items: [
      { name: "Beef / Meatball / Grilled Pork", price: "$4" },
      { name: "Assorted Cold Cut", price: "$3" },
      { name: "Banh Mi", price: "$3" },
    ],
  },
  {
    id: "banh-mi-collection",
    name: "BANH MI COLLECTION",
    description: "Fresh-baked baguette, house pickles, fresh vegetables.",
    images: "menuBanhMi",
    items: HOME_MENU_PREVIEW.items,
  },
  {
    id: "iron-pan-specialty",
    name: "IRON PAN SPECIALTY",
    items: [
      {
        name: "House Special Beef Stew",
        price: "$19.95",
        description:
          "Rich, slow-braised beef in aromatic spices, and carrots, served with warm Banh Mi.",
      },
    ],
  },
  {
    id: "craft-coffee",
    name: "CRAFT COFFEE",
    items: [
      { name: "Hot Black Coffee", price: "$4.50", description: "Bold, smooth and slow-brewed coffee." },
      { name: "Iced Black Coffee", price: "$6", description: "Bold, smooth, and refreshing." },
      {
        name: "Brown Coffee with Condensed Milk",
        price: "$7",
        description: "Rich and creamy with a hint of sweetness.",
      },
      { name: "Coffee Latte", price: "$7.50", description: "Smooth coffee blended with creamy milk." },
      { name: "Coconut Coffee", price: "$8", description: "Creamy coconut blended with bold coffee." },
      {
        name: "Sea Salt Coffee",
        price: "$8.50",
        description: "Rich brown coffee topped with smooth sea salt foam.",
      },
      {
        name: "Coconut Brown Coffee Ube Foam",
        price: "$8.50",
        description: "Creamy coconut brown coffee finished with signature ube foam.",
      },
      {
        name: "Ube Foam Brown Coffee",
        price: "$8.50",
        description: "Rich brown coffee topped with sweet and creamy ube foam.",
      },
      {
        name: "Matcha Latte",
        price: "$8",
        description:
          "Smooth and creamy premium matcha blended with milk for a rich, earthy flavor and naturally refreshing finish.",
      },
      {
        name: "Strawberry Matcha Latte",
        price: "$8.50",
        description:
          "Sweet strawberry blended with creamy milk for a smooth, refreshing drink with a fruity twist.",
      },
    ],
  },
  {
    id: "refreshers",
    name: "REFRESHERS",
    items: [
      {
        name: "Tropical Vibe",
        price: "$8.50",
        description:
          "Island-inspired refresher with juicy lychee, strawberry, and bright sparkling lemonade.",
      },
      {
        name: "Sunset Fizz",
        price: "$8.50",
        description:
          "Sparkling tropical blend of fresh sweet peach, strawberry and citrus lemonade inspired by island sunsets.",
      },
      {
        name: "Blue Lagoon Refresher",
        price: "$8.50",
        description:
          "Fresh lychee and lemonade with cool tropical blue citrus and sparkling island vibes.",
      },
      {
        name: "Lava Wave Refresher",
        price: "$8.50",
        description:
          "Sparkling fresh strawberry lemonade with sweet tropical notes and a refreshing island finish.",
      },
      {
        name: "Island Breeze",
        price: "$8.50",
        description: "Sweet lychee, fresh juicy peach and a hint of tropical lemonade.",
      },
      {
        name: "Galaxy Night",
        price: "$8.50",
        description:
          "Sweet fresh strawberry and lychee lemonade with a splash of blue citrus for a vibrant tropical sparkle.",
      },
      { name: "Soft Drink", price: "$3.50", description: "Soft drink." },
    ],
  },
];
