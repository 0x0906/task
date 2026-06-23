import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;');

  await prisma.$executeRawUnsafe(`
    INSERT INTO "products" (name, category, price, created_at, updated_at)
    SELECT
      (ARRAY[
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
      ])[1 + (i % 10) * 10 + ((i / 10) % 10)] || ' ' ||
      (ARRAY[
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
      ])[1 + (i % 10) * 5 + ((i / 100) % 5)] || ' ' || i,
      (ARRAY['Electronics', 'Apparel', 'Home & Kitchen', 'Beauty', 'Sports & Outdoors', 'Books', 'Automotive', 'Toys', 'Office Products', 'Health'])[1 + (i % 10)],
      (5.00 + (i % 100) * 1.50)::numeric,
      NOW() - (i || ' seconds')::interval,
      NOW() - (i || ' seconds')::interval
    FROM generate_series(1, 200000) s(i);
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
