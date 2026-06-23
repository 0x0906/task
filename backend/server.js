import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Beauty', 'Sports & Outdoors', 'Books', 'Automotive', 'Toys', 'Office Products', 'Health'];

const brands = [
  'Apple', 'Samsung', 'Sony', 'Bose', 'Dell', 'HP', 'Xiaomi', 'Lenovo', 'LG', 'Asus',
  'Nike', 'Adidas', 'Levis', 'Zara', 'HM', 'Under Armour', 'Puma', 'Gucci', 'Ralph Lauren', 'Calvin Klein',
  'Keurig', 'Ninja', 'Dyson', 'Philips', 'Instant Pot', 'Cuisinart', 'KitchenAid', 'iRobot', 'Shark', 'Le Creuset',
  'LOreal', 'Estee Lauder', 'Clinique', 'Sephora', 'MAC', 'Nivea', 'Maybelline', 'Dove', 'Olay', 'Lancome',
  'Columbia', 'Patagonia', 'North Face', 'Yeti', 'Coleman', 'Garmin', 'Shimano', 'Rawlings', 'Spalding', 'Callaway',
  'Penguin', 'HarperCollins', 'Random House', 'Scholastic', 'Simon Schuster', 'Macmillan', 'Hachette', 'Pearson', 'Oxford', 'Wiley',
  'Bosch', 'Michelin', '3M', 'Castrol', 'Pioneer', 'Meguiars', 'Goodyear', 'Mobil 1', 'Garmin', 'Cobra',
  'Lego', 'Hasbro', 'Mattel', 'Fisher-Price', 'Nerf', 'Barbie', 'Hot Wheels', 'Play-Doh', 'Melissa Doug', 'Funko',
  'Bic', 'Pilot', 'Paper Mate', 'Mead', 'Sharpie', 'HP', 'Epson', 'Canon', 'Post-it', 'Avery',
  'Centrum', 'MuscleTech', 'Nature Made', 'Dettol', 'Band-Aid', 'Theragun', 'Omron', 'Advil', 'Kirkland', 'Optimum Nutrition'
];

const nouns = [
  'Smartphone', 'Laptop', 'Headphones', 'Smartwatch', 'Speaker',
  'T-Shirt', 'Jeans', 'Shoes', 'Jacket', 'Sunglasses',
  'Coffee Maker', 'Air Fryer', 'Desk Lamp', 'Blender', 'Cookware',
  'Moisturizer', 'Lipstick', 'Perfume', 'Face Wash', 'Hair Dryer',
  'Yoga Mat', 'Water Bottle', 'Backpack', 'Tent', 'Sleeping Bag',
  'Novel', 'Sci-Fi Book', 'Self-Help Book', 'History Book', 'Biography',
  'Phone Mount', 'Car Charger', 'Seat Cover', 'Tire Inflator', 'Dash Cam',
  'Building Blocks', 'Board Game', 'Puzzle', 'Action Figure', 'RC Car',
  'Notebook', 'Gel Pens', 'Cabinet', 'Stapler', 'Whiteboard',
  'Multivitamin', 'Protein Powder', 'First Aid Kit', 'Thermometer', 'Massage Gun'
];

app.use(cors());
app.use(express.json());

app.get('/api/products', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const category = req.query.category;
  const cursor = req.query.cursor;

  const where = {};
  if (category) {
    where.category = category;
  }

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));
      const cursorCreatedAt = new Date(decoded.createdAt);
      const cursorId = parseInt(decoded.id);

      where.OR = [
        {
          createdAt: { lt: cursorCreatedAt }
        },
        {
          createdAt: cursorCreatedAt,
          id: { lt: cursorId }
        }
      ];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid cursor' });
    }
  }

  const products = await prisma.product.findMany({
    take: limit + 1,
    where,
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ]
  });

  let nextCursor = null;
  let hasNextPage = false;

  if (products.length > limit) {
    hasNextPage = true;
    const nextItem = products[limit - 1];
    nextCursor = Buffer.from(
      JSON.stringify({ createdAt: nextItem.createdAt, id: nextItem.id })
    ).toString('base64');
    products.pop();
  }

  res.json({
    products,
    nextCursor,
    hasNextPage
  });
});

app.get('/api/categories', async (req, res) => {
  const distinctCats = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });
  res.json(distinctCats.map(c => c.category));
});

app.post('/api/products/simulate-add', async (req, res) => {
  const categoryFilter = req.body.category || req.query.category;
  
  let catIdx;
  if (categoryFilter && categories.includes(categoryFilter)) {
    catIdx = categories.indexOf(categoryFilter);
  } else {
    catIdx = Math.floor(Math.random() * 10);
  }

  const newProducts = [];
  const now = new Date();
  const timestamp = Date.now();

  for (let i = 0; i < 50; i++) {
    const brandSubIdx = Math.floor(Math.random() * 10);
    const brandIdx = catIdx * 10 + brandSubIdx;
    const nounSubIdx = Math.floor(Math.random() * 5);
    const nounIdx = catIdx * 5 + nounSubIdx;
    const name = `${brands[brandIdx]} ${nouns[nounIdx]} ${timestamp}-${i}`;
    const category = categories[catIdx];

    newProducts.push({
      name,
      category,
      price: parseFloat((10.00 + Math.random() * 100).toFixed(2)),
      createdAt: new Date(now.getTime() + i * 1000),
      updatedAt: new Date(now.getTime() + i * 1000)
    });
  }

  await prisma.product.createMany({
    data: newProducts
  });

  res.json({ message: `Successfully added 50 new products to ${categories[catIdx]}` });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
