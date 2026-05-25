export const featuredPizzas = [
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80',
    base: 'Stuffed Crust',
    sauce: 'Buffalo',
    cheese: 'Mozzarella',
    veggies: ['Onion', 'Bell Pepper'],
    meats: [],
    description: 'Indian spiced paneer with tandoori sauce.',
    badge: 'Veg',
    featured: true,
    rating: 4.5,
    menuPrice: 329
  },
  {
    id: 'margherita-classic',
    name: 'Margherita Classic',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    base: 'Classic Thin Crust',
    sauce: 'Tomato Basil',
    cheese: 'Mozzarella',
    veggies: ['Tomato'],
    meats: [],
    description: 'Fresh tomato sauce, mozzarella, basil.',
    badge: 'Veg',
    featured: true,
    rating: 4.5,
    menuPrice: 249
  },
  {
    id: 'pepperoni-feast',
    name: 'Pepperoni Feast',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
    base: 'Cheese Burst',
    sauce: 'Barbecue',
    cheese: 'Mozzarella',
    veggies: ['Onion'],
    meats: ['Pepperoni'],
    description: 'Loaded with premium pepperoni and cheese.',
    badge: 'Non-veg',
    featured: true,
    rating: 4.5,
    menuPrice: 349
  },
  {
    id: 'vegan-delight',
    name: 'Vegan Delight',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    base: 'Gluten Free',
    sauce: 'Pesto',
    cheese: 'Vegan Cheese',
    veggies: ['Tomato', 'Olives', 'Bell Pepper'],
    meats: [],
    description: 'Plant-based cheese with roasted veggies.',
    badge: 'Vegan',
    rating: 4.5,
    menuPrice: 319
  },
  {
    id: 'veggie-supreme',
    name: 'Veggie Supreme',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    base: 'Pan Pizza',
    sauce: 'Tomato Basil',
    cheese: 'Cheddar',
    veggies: ['Bell Pepper', 'Mushroom', 'Olives', 'Onion'],
    meats: [],
    description: 'Bell peppers, mushrooms, olives, onions.',
    badge: 'Veg',
    rating: 4.5,
    menuPrice: 299
  },
  {
    id: 'farmhouse',
    name: 'Farmhouse',
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80',
    base: 'Classic Thin Crust',
    sauce: 'Tomato Basil',
    cheese: 'Provolone',
    veggies: ['Onion', 'Bell Pepper', 'Mushroom', 'Tomato'],
    meats: [],
    description: 'Fresh veggies on a crispy thin crust.',
    badge: 'Veg',
    rating: 4.5,
    menuPrice: 279
  },
  {
    id: 'chicken-tikka',
    name: 'Chicken Tikka',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
    base: 'Cheese Burst',
    sauce: 'Buffalo',
    cheese: 'Mozzarella',
    veggies: ['Onion', 'Bell Pepper'],
    meats: ['Chicken'],
    description: 'Spicy chicken tikka with mint chutney base.',
    badge: 'Non-veg',
    rating: 4.5,
    menuPrice: 369
  },
  {
    id: 'bbq-chicken',
    name: 'BBQ Chicken',
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=900&q=80',
    base: 'Pan Pizza',
    sauce: 'Barbecue',
    cheese: 'Cheddar',
    veggies: ['Onion'],
    meats: ['Chicken', 'Bacon'],
    description: 'Smoky BBQ sauce with grilled chicken.',
    badge: 'Non-veg',
    rating: 4.5,
    menuPrice: 379
  },
  {
    id: 'pesto-veggie',
    name: 'Pesto Veggie',
    image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=900&q=80',
    base: 'Gluten Free',
    sauce: 'Pesto',
    cheese: 'Vegan Cheese',
    veggies: ['Tomato', 'Olives', 'Bell Pepper'],
    meats: [],
    description: 'Fresh pesto profile with bright veggies.',
    badge: 'Vegan',
    rating: 4.5,
    menuPrice: 289
  },
  {
    id: 'four-cheese',
    name: 'Four Cheese',
    image: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?auto=format&fit=crop&w=900&q=80',
    base: 'Cheese Burst',
    sauce: 'Garlic Ranch',
    cheese: 'Parmesan',
    veggies: ['Tomato'],
    meats: [],
    description: 'Creamy cheese blend with golden crust.',
    badge: 'Veg',
    rating: 4.5,
    menuPrice: 339
  },
  {
    id: 'meat-max',
    name: 'Meat Max',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=900&q=80',
    base: 'Pan Pizza',
    sauce: 'Buffalo',
    cheese: 'Cheddar',
    veggies: ['Onion'],
    meats: ['Sausage', 'Bacon', 'Ham'],
    description: 'A bold buffalo-sauce pizza with a hearty meat topping mix.',
    badge: 'Non-veg',
    rating: 4.5,
    menuPrice: 399
  }
];

export const pizzaImagePool = [
  ...featuredPizzas.map(pizza => pizza.image),
  '/images/pizza-supreme.png',
  '/images/pizza-tandoori.png',
  '/images/pizza-four-cheese.png',
  '/images/pizza-veggie-delight.png',
  '/images/pizza-bbq-paneer.png',
  '/images/pizza-spicy-deluxe.png'
];

export const calculatePizzaPrice = ({ base, sauce, cheese, veggies = [], meats = [] }) => {
  if (!base || !sauce || !cheese) return 0;
  return 120 + 30 + 50 + veggies.length * 15 + meats.length * 40;
};

export const pizzaIngredients = pizza => [
  pizza.base,
  pizza.sauce,
  pizza.cheese,
  ...(pizza.veggies || []),
  ...(pizza.meats || [])
].filter(Boolean);
