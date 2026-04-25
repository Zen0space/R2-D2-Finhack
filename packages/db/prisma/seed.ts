import { PrismaClient, MykasihCategory } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products: Array<{
  name: string;
  nameMs: string;
  brand: string;
  category: MykasihCategory;
  description: string;
  unit: string;
  priceRm: number;
  subsidyRm: number;
  barcode: string;
  stock: number;
}> = [
  // GROCERY
  { name: "Jasmine Rice", nameMs: "Beras Jasmine", brand: "Cap Faiza", category: "GROCERY", description: "Premium jasmine rice, fragrant and soft", unit: "5kg", priceRm: 22.90, subsidyRm: 16.00, barcode: "9556041100019", stock: 200 },
  { name: "All-Purpose Flour", nameMs: "Tepung Gandum", brand: "Superbrand", category: "GROCERY", description: "Fine all-purpose wheat flour", unit: "1kg", priceRm: 2.85, subsidyRm: 1.90, barcode: "9556041100026", stock: 300 },
  { name: "Refined Sugar", nameMs: "Gula Putih", brand: "CSR", category: "GROCERY", description: "Fine white refined sugar", unit: "1kg", priceRm: 2.85, subsidyRm: 1.90, barcode: "9556041100033", stock: 400 },
  { name: "Cooking Oil", nameMs: "Minyak Masak", brand: "Saji", category: "GROCERY", description: "Pure refined palm cooking oil", unit: "2L", priceRm: 9.90, subsidyRm: 7.00, barcode: "9556041100040", stock: 250 },
  { name: "Table Salt", nameMs: "Garam Meja", brand: "Adabi", category: "GROCERY", description: "Iodised fine table salt", unit: "500g", priceRm: 1.50, subsidyRm: 0.90, barcode: "9556041100057", stock: 500 },
  { name: "Oyster Sauce", nameMs: "Sos Tiram", brand: "Lee Kum Kee", category: "GROCERY", description: "Premium oyster-flavoured sauce", unit: "510g", priceRm: 8.50, subsidyRm: 6.00, barcode: "9556041100064", stock: 150 },
  { name: "Soy Sauce", nameMs: "Kicap Masin", brand: "Maggi", category: "GROCERY", description: "Dark soy sauce for cooking", unit: "500ml", priceRm: 4.20, subsidyRm: 2.80, barcode: "9556041100071", stock: 200 },
  { name: "Fish Sauce", nameMs: "Sos Ikan", brand: "Tiparos", category: "GROCERY", description: "Authentic Thai fish sauce", unit: "700ml", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041100088", stock: 120 },
  { name: "Instant Noodles Chicken", nameMs: "Mi Segera Ayam", brand: "Maggi", category: "GROCERY", description: "Quick-cook chicken-flavour noodles", unit: "5-pack", priceRm: 4.50, subsidyRm: 3.00, barcode: "9556041100095", stock: 500 },
  { name: "Instant Noodles Curry", nameMs: "Mi Segera Kari", brand: "Maggi", category: "GROCERY", description: "Quick-cook curry-flavour noodles", unit: "5-pack", priceRm: 4.50, subsidyRm: 3.00, barcode: "9556041100101", stock: 450 },
  { name: "Canned Sardines", nameMs: "Sardin Tin", brand: "Ayam Brand", category: "GROCERY", description: "Sardines in tomato sauce", unit: "425g", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041100118", stock: 300 },
  { name: "Canned Tuna", nameMs: "Tuna Tin", brand: "Ayam Brand", category: "GROCERY", description: "Chunk light tuna in water", unit: "180g", priceRm: 4.20, subsidyRm: 2.80, barcode: "9556041100125", stock: 250 },
  { name: "Peanut Butter Creamy", nameMs: "Mentega Kacang", brand: "Skippy", category: "GROCERY", description: "Smooth creamy peanut butter", unit: "340g", priceRm: 8.90, subsidyRm: 6.00, barcode: "9556041100132", stock: 100 },
  { name: "Milo 3-in-1", nameMs: "Milo 3-in-1", brand: "Milo", category: "GROCERY", description: "Chocolate malt energy drink sachet pack", unit: "15-pack", priceRm: 14.90, subsidyRm: 10.50, barcode: "9556041100149", stock: 200 },
  { name: "Oat Porridge", nameMs: "Oat Segera", brand: "Quaker", category: "GROCERY", description: "Instant rolled oats", unit: "800g", priceRm: 11.90, subsidyRm: 8.00, barcode: "9556041100156", stock: 150 },
  { name: "Sambal Paste", nameMs: "Pes Sambal", brand: "Adabi", category: "GROCERY", description: "Authentic Malaysian chilli sambal paste", unit: "250g", priceRm: 3.90, subsidyRm: 2.50, barcode: "9556041100163", stock: 180 },
  { name: "Curry Powder", nameMs: "Serbuk Kari", brand: "Baba's", category: "GROCERY", description: "Aromatic Malaysian curry powder blend", unit: "250g", priceRm: 4.50, subsidyRm: 3.00, barcode: "9556041100170", stock: 200 },
  { name: "Canned Coconut Milk", nameMs: "Santan Tin", brand: "Kara", category: "GROCERY", description: "Thick coconut milk for cooking", unit: "400ml", priceRm: 3.50, subsidyRm: 2.20, barcode: "9556041100187", stock: 250 },
  { name: "Beehoon Rice Vermicelli", nameMs: "Bihun Beras", brand: "Pagoda", category: "GROCERY", description: "Dried rice vermicelli noodles", unit: "400g", priceRm: 2.90, subsidyRm: 1.90, barcode: "9556041100194", stock: 300 },
  { name: "Vermicelli (Mihun)", nameMs: "Mihun", brand: "Cap Lili", category: "GROCERY", description: "Dried wheat vermicelli noodles", unit: "500g", priceRm: 3.20, subsidyRm: 2.10, barcode: "9556041100200", stock: 250 },

  // DAIRY
  { name: "Full Cream UHT Milk", nameMs: "Susu UHT Penuh Krim", brand: "Dutch Lady", category: "DAIRY", description: "Full cream long-life UHT milk", unit: "1L", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041200019", stock: 300 },
  { name: "Low Fat UHT Milk", nameMs: "Susu UHT Rendah Lemak", brand: "Dutch Lady", category: "DAIRY", description: "Low-fat long-life UHT milk", unit: "1L", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041200026", stock: 280 },
  { name: "Sweetened Creamer", nameMs: "Krimer Manis", brand: "Carnation", category: "DAIRY", description: "Sweetened condensed creamer", unit: "500g", priceRm: 6.50, subsidyRm: 4.50, barcode: "9556041200033", stock: 200 },
  { name: "Evaporated Milk", nameMs: "Susu Sejat", brand: "F&N", category: "DAIRY", description: "Unsweetened evaporated milk", unit: "390g", priceRm: 3.90, subsidyRm: 2.50, barcode: "9556041200040", stock: 220 },
  { name: "Cheddar Cheese Slices", nameMs: "Keju Cheddar Hirisan", brand: "Kraft", category: "DAIRY", description: "Processed cheddar cheese slices", unit: "250g", priceRm: 8.90, subsidyRm: 6.00, barcode: "9556041200057", stock: 100 },
  { name: "Natural Yoghurt", nameMs: "Yogurt Biasa", brand: "Marigold", category: "DAIRY", description: "Plain natural yoghurt", unit: "500g", priceRm: 6.90, subsidyRm: 4.80, barcode: "9556041200064", stock: 120 },
  { name: "Strawberry Yoghurt", nameMs: "Yogurt Strawberi", brand: "Marigold", category: "DAIRY", description: "Strawberry fruit yoghurt", unit: "135g", priceRm: 2.50, subsidyRm: 1.70, barcode: "9556041200071", stock: 150 },
  { name: "Butter Salted", nameMs: "Mentega Masin", brand: "Anchor", category: "DAIRY", description: "Salted pure butter for baking and cooking", unit: "250g", priceRm: 8.90, subsidyRm: 6.00, barcode: "9556041200088", stock: 80 },
  { name: "Infant Formula Stage 1", nameMs: "Susu Formula Bayi Tahap 1", brand: "Dumex", category: "DAIRY", description: "Follow-on milk formula for infants 0–6 months", unit: "900g", priceRm: 52.90, subsidyRm: 35.00, barcode: "9556041200095", stock: 50 },
  { name: "Growing Up Milk Stage 3", nameMs: "Susu Tumbesaran Tahap 3", brand: "Dumex", category: "DAIRY", description: "Growing-up formula for children 1–3 years", unit: "900g", priceRm: 48.90, subsidyRm: 32.00, barcode: "9556041200101", stock: 60 },

  // PRODUCE
  { name: "White Onion", nameMs: "Bawang Besar", brand: "Local Farm", category: "PRODUCE", description: "Fresh white onion from local farm", unit: "1kg", priceRm: 3.90, subsidyRm: 2.50, barcode: "9556041300019", stock: 400 },
  { name: "Garlic", nameMs: "Bawang Putih", brand: "Local Farm", category: "PRODUCE", description: "Fresh garlic bulbs", unit: "500g", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041300026", stock: 350 },
  { name: "Ginger", nameMs: "Halia", brand: "Local Farm", category: "PRODUCE", description: "Fresh root ginger", unit: "500g", priceRm: 4.50, subsidyRm: 3.00, barcode: "9556041300033", stock: 300 },
  { name: "Red Chillies", nameMs: "Cili Merah", brand: "Local Farm", category: "PRODUCE", description: "Fresh red chillies", unit: "250g", priceRm: 3.50, subsidyRm: 2.20, barcode: "9556041300040", stock: 250 },
  { name: "Potato", nameMs: "Kentang", brand: "Local Farm", category: "PRODUCE", description: "Fresh potatoes", unit: "1kg", priceRm: 4.90, subsidyRm: 3.20, barcode: "9556041300057", stock: 300 },
  { name: "Carrot", nameMs: "Lobak Merah", brand: "Local Farm", category: "PRODUCE", description: "Fresh carrots", unit: "1kg", priceRm: 3.90, subsidyRm: 2.50, barcode: "9556041300064", stock: 280 },
  { name: "Cabbage", nameMs: "Kobis", brand: "Local Farm", category: "PRODUCE", description: "Fresh green cabbage", unit: "1 head (~1kg)", priceRm: 3.50, subsidyRm: 2.20, barcode: "9556041300071", stock: 200 },
  { name: "Spinach (Bayam)", nameMs: "Bayam", brand: "Local Farm", category: "PRODUCE", description: "Fresh green water spinach", unit: "250g", priceRm: 1.90, subsidyRm: 1.20, barcode: "9556041300088", stock: 200 },
  { name: "Banana (Pisang Berangan)", nameMs: "Pisang Berangan", brand: "Local Farm", category: "PRODUCE", description: "Sweet local bananas", unit: "per hand (~6 pcs)", priceRm: 3.90, subsidyRm: 2.50, barcode: "9556041300095", stock: 150 },
  { name: "Eggs", nameMs: "Telur Ayam", brand: "Farm Fresh", category: "PRODUCE", description: "Fresh grade A chicken eggs", unit: "10 pcs", priceRm: 4.50, subsidyRm: 3.20, barcode: "9556041300101", stock: 500 },

  // HOUSEHOLD
  { name: "Laundry Powder Detergent", nameMs: "Serbuk Pencuci Baju", brand: "Breeze", category: "HOUSEHOLD", description: "Powerful stain-removal laundry powder", unit: "1.8kg", priceRm: 12.90, subsidyRm: 8.50, barcode: "9556041400019", stock: 200 },
  { name: "Laundry Liquid Detergent", nameMs: "Cecair Pencuci Baju", brand: "Dynamo", category: "HOUSEHOLD", description: "Concentrated liquid laundry detergent", unit: "1.5L", priceRm: 14.90, subsidyRm: 9.90, barcode: "9556041400026", stock: 180 },
  { name: "Dishwashing Liquid", nameMs: "Cecair Basuh Pinggan", brand: "Mama Lemon", category: "HOUSEHOLD", description: "Lemon-scented dishwashing liquid", unit: "750ml", priceRm: 5.50, subsidyRm: 3.50, barcode: "9556041400033", stock: 250 },
  { name: "Floor Cleaner", nameMs: "Pencuci Lantai", brand: "Dettol", category: "HOUSEHOLD", description: "Antibacterial floor cleaner", unit: "1L", priceRm: 8.90, subsidyRm: 5.90, barcode: "9556041400040", stock: 150 },
  { name: "Toilet Bowl Cleaner", nameMs: "Pencuci Tandas", brand: "Harpic", category: "HOUSEHOLD", description: "Limescale-removing toilet cleaner", unit: "500ml", priceRm: 6.90, subsidyRm: 4.50, barcode: "9556041400057", stock: 120 },
  { name: "Garbage Bags", nameMs: "Beg Sampah", brand: "Poly Pac", category: "HOUSEHOLD", description: "Heavy-duty black garbage bags", unit: "25-pack", priceRm: 4.90, subsidyRm: 3.20, barcode: "9556041400064", stock: 300 },
  { name: "Kitchen Paper Towel", nameMs: "Tuala Kertas Dapur", brand: "Scott", category: "HOUSEHOLD", description: "Absorbent kitchen paper towel roll", unit: "3-roll pack", priceRm: 7.90, subsidyRm: 5.20, barcode: "9556041400071", stock: 180 },
  { name: "Toilet Tissue", nameMs: "Tisu Tandas", brand: "Paseo", category: "HOUSEHOLD", description: "Soft 3-ply toilet tissue", unit: "10-roll pack", priceRm: 9.90, subsidyRm: 6.50, barcode: "9556041400088", stock: 250 },
  { name: "Facial Tissue", nameMs: "Tisu Muka", brand: "Kleenex", category: "HOUSEHOLD", description: "Soft 2-ply facial tissue box", unit: "100-sheet box", priceRm: 3.90, subsidyRm: 2.50, barcode: "9556041400095", stock: 200 },
  { name: "Mosquito Coil", nameMs: "Gegelung Nyamuk", brand: "Ridsect", category: "HOUSEHOLD", description: "10-hour mosquito repellent coil", unit: "10-coil pack", priceRm: 4.50, subsidyRm: 2.90, barcode: "9556041400101", stock: 150 },
  { name: "Insect Repellent Spray", nameMs: "Racun Serangga", brand: "Shieldtox", category: "HOUSEHOLD", description: "Fast-acting insecticide spray", unit: "600ml", priceRm: 9.90, subsidyRm: 6.50, barcode: "9556041400118", stock: 100 },
  { name: "AA Batteries", nameMs: "Bateri AA", brand: "Energizer", category: "HOUSEHOLD", description: "Long-lasting alkaline AA batteries", unit: "4-pack", priceRm: 7.90, subsidyRm: 5.20, barcode: "9556041400125", stock: 200 },

  // PERSONAL_CARE
  { name: "Body Soap Bar", nameMs: "Sabun Mandi", brand: "Lifebuoy", category: "PERSONAL_CARE", description: "Antibacterial body soap bar", unit: "100g × 3 bars", priceRm: 5.50, subsidyRm: 3.50, barcode: "9556041500019", stock: 300 },
  { name: "Shampoo", nameMs: "Syampu", brand: "Sunsilk", category: "PERSONAL_CARE", description: "Smooth and manageable hair shampoo", unit: "320ml", priceRm: 7.90, subsidyRm: 5.20, barcode: "9556041500026", stock: 200 },
  { name: "Conditioner", nameMs: "Perapi Rambut", brand: "Sunsilk", category: "PERSONAL_CARE", description: "Hair conditioner for soft hair", unit: "320ml", priceRm: 7.90, subsidyRm: 5.20, barcode: "9556041500033", stock: 180 },
  { name: "Toothpaste", nameMs: "Ubat Gigi", brand: "Colgate", category: "PERSONAL_CARE", description: "Fluoride toothpaste for cavity protection", unit: "200g", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041500040", stock: 350 },
  { name: "Toothbrush", nameMs: "Berus Gigi", brand: "Oral-B", category: "PERSONAL_CARE", description: "Medium-bristle manual toothbrush", unit: "2-pack", priceRm: 6.90, subsidyRm: 4.50, barcode: "9556041500057", stock: 300 },
  { name: "Deodorant Roll-On", nameMs: "Deodoran", brand: "Rexona", category: "PERSONAL_CARE", description: "48-hour protection antiperspirant roll-on", unit: "50ml", priceRm: 7.90, subsidyRm: 5.20, barcode: "9556041500064", stock: 200 },
  { name: "Sanitary Pads", nameMs: "Tuala Wanita", brand: "Kotex", category: "PERSONAL_CARE", description: "Ultra-thin day pads with wings", unit: "16-pack", priceRm: 7.90, subsidyRm: 5.20, barcode: "9556041500071", stock: 200 },
  { name: "Panty Liners", nameMs: "Pelindung Dalam", brand: "Laurier", category: "PERSONAL_CARE", description: "Breathable daily panty liners", unit: "30-pack", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041500088", stock: 180 },
  { name: "Hand Sanitiser", nameMs: "Pembersih Tangan", brand: "Dettol", category: "PERSONAL_CARE", description: "70% alcohol hand sanitiser", unit: "500ml", priceRm: 9.90, subsidyRm: 6.50, barcode: "9556041500095", stock: 150 },
  { name: "Sunscreen SPF50", nameMs: "Pelindung Matahari", brand: "Biore", category: "PERSONAL_CARE", description: "Lightweight SPF50 PA+++ sunscreen", unit: "50ml", priceRm: 22.90, subsidyRm: 15.00, barcode: "9556041500101", stock: 80 },
  { name: "Face Wash", nameMs: "Pencuci Muka", brand: "Garnier", category: "PERSONAL_CARE", description: "Brightening face wash with vitamin C", unit: "100ml", priceRm: 11.90, subsidyRm: 7.90, barcode: "9556041500118", stock: 120 },
  { name: "Razor Disposable", nameMs: "Pisau Cukur Buang", brand: "Gillette", category: "PERSONAL_CARE", description: "3-blade disposable razors", unit: "4-pack", priceRm: 12.90, subsidyRm: 8.50, barcode: "9556041500125", stock: 100 },

  // BABY
  { name: "Newborn Diapers S", nameMs: "Lampin Bayi Saiz S", brand: "Mamypoko", category: "BABY", description: "Ultra-dry newborn diapers size S (up to 5kg)", unit: "30-pack", priceRm: 29.90, subsidyRm: 20.00, barcode: "9556041600019", stock: 100 },
  { name: "Baby Diapers M", nameMs: "Lampin Bayi Saiz M", brand: "Mamypoko", category: "BABY", description: "Ultra-dry baby diapers size M (6–11kg)", unit: "28-pack", priceRm: 32.90, subsidyRm: 22.00, barcode: "9556041600026", stock: 120 },
  { name: "Baby Diapers L", nameMs: "Lampin Bayi Saiz L", brand: "Drypers", category: "BABY", description: "Breathable baby diapers size L (9–14kg)", unit: "24-pack", priceRm: 34.90, subsidyRm: 23.00, barcode: "9556041600033", stock: 100 },
  { name: "Baby Wipes", nameMs: "Tisu Basah Bayi", brand: "Huggies", category: "BABY", description: "Gentle fragrance-free baby wipes", unit: "80-pack", priceRm: 8.90, subsidyRm: 5.90, barcode: "9556041600040", stock: 200 },
  { name: "Baby Shampoo & Body Wash", nameMs: "Syampu & Sabun Mandi Bayi", brand: "Johnson's Baby", category: "BABY", description: "Gentle no-tears baby wash", unit: "500ml", priceRm: 14.90, subsidyRm: 9.90, barcode: "9556041600057", stock: 150 },
  { name: "Baby Lotion", nameMs: "Losyen Bayi", brand: "Johnson's Baby", category: "BABY", description: "Moisturising hypoallergenic baby lotion", unit: "300ml", priceRm: 11.90, subsidyRm: 7.90, barcode: "9556041600064", stock: 130 },
  { name: "Baby Powder", nameMs: "Bedak Bayi", brand: "Johnson's Baby", category: "BABY", description: "Gentle talc-free baby powder", unit: "200g", priceRm: 8.90, subsidyRm: 5.90, barcode: "9556041600071", stock: 120 },
  { name: "Baby Cereal Rice", nameMs: "Bijirin Bayi Beras", brand: "Nestle Cerelac", category: "BABY", description: "Iron-fortified rice cereal for 4+ months", unit: "250g", priceRm: 14.90, subsidyRm: 9.90, barcode: "9556041600088", stock: 80 },
  { name: "Baby Food Fruit Puree", nameMs: "Puri Buah Bayi", brand: "Heinz", category: "BABY", description: "Mixed fruit puree for 4+ months", unit: "120g jar", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041600095", stock: 100 },
  { name: "Nursing Breast Pads", nameMs: "Pad Penyusu", brand: "Avent", category: "BABY", description: "Disposable nursing breast pads, ultra-absorbent", unit: "24-pack", priceRm: 18.90, subsidyRm: 12.50, barcode: "9556041600101", stock: 60 },

  // BEVERAGE
  { name: "Mineral Water", nameMs: "Air Mineral", brand: "Spritzer", category: "BEVERAGE", description: "Natural mineral water", unit: "1.5L", priceRm: 1.90, subsidyRm: 1.20, barcode: "9556041700019", stock: 500 },
  { name: "Mineral Water 600ml", nameMs: "Air Mineral 600ml", brand: "Cactus", category: "BEVERAGE", description: "Purified drinking water", unit: "600ml", priceRm: 0.90, subsidyRm: 0.60, barcode: "9556041700026", stock: 600 },
  { name: "Orange Juice 100%", nameMs: "Jus Oren 100%", brand: "Tropicana", category: "BEVERAGE", description: "100% pure squeezed orange juice", unit: "1L", priceRm: 8.90, subsidyRm: 5.90, barcode: "9556041700033", stock: 150 },
  { name: "Apple Juice", nameMs: "Jus Epal", brand: "Marigold", category: "BEVERAGE", description: "Clear apple juice drink", unit: "1L", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041700040", stock: 180 },
  { name: "Soy Milk Original", nameMs: "Susu Soya Asal", brand: "Yeo's", category: "BEVERAGE", description: "Unsweetened original soy milk", unit: "1L", priceRm: 4.50, subsidyRm: 2.90, barcode: "9556041700057", stock: 200 },
  { name: "Barley Water", nameMs: "Air Barli", brand: "Yeo's", category: "BEVERAGE", description: "Refreshing lightly sweetened barley drink", unit: "250ml × 6-pack", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041700064", stock: 200 },
  { name: "Green Tea RTD", nameMs: "Teh Hijau Sedia Minum", brand: "Pokka", category: "BEVERAGE", description: "Ready-to-drink lightly sweetened green tea", unit: "500ml", priceRm: 2.90, subsidyRm: 1.90, barcode: "9556041700071", stock: 250 },
  { name: "3-in-1 White Coffee", nameMs: "Kopi Putih 3-in-1", brand: "Oldtown", category: "BEVERAGE", description: "Instant white coffee with creamer and sugar", unit: "15-pack", priceRm: 12.90, subsidyRm: 8.50, barcode: "9556041700088", stock: 180 },
  { name: "Teh Tarik Mix", nameMs: "Teh Tarik 3-in-1", brand: "Boh", category: "BEVERAGE", description: "Authentic Malaysian pulled-tea instant mix", unit: "15-pack", priceRm: 9.90, subsidyRm: 6.50, barcode: "9556041700095", stock: 200 },
  { name: "Isotonic Sports Drink", nameMs: "Minuman Sukan", brand: "100 Plus", category: "BEVERAGE", description: "Isotonic sports drink for hydration", unit: "500ml", priceRm: 2.20, subsidyRm: 1.40, barcode: "9556041700101", stock: 300 },

  // FROZEN
  { name: "Frozen Chicken Whole", nameMs: "Ayam Sejuk Beku Keseluruhan", brand: "Ayamas", category: "FROZEN", description: "Cleaned whole frozen chicken", unit: "1.2kg", priceRm: 14.90, subsidyRm: 10.00, barcode: "9556041800019", stock: 150 },
  { name: "Frozen Chicken Drumstick", nameMs: "Peha Ayam Sejuk Beku", brand: "Ayamas", category: "FROZEN", description: "Frozen chicken drumsticks", unit: "1kg", priceRm: 11.90, subsidyRm: 8.00, barcode: "9556041800026", stock: 180 },
  { name: "Frozen Fish Fillet", nameMs: "Fillet Ikan Sejuk Beku", brand: "Ocean King", category: "FROZEN", description: "Boneless white fish fillet, wild-caught", unit: "500g", priceRm: 12.90, subsidyRm: 8.50, barcode: "9556041800033", stock: 120 },
  { name: "Frozen Shrimp", nameMs: "Udang Sejuk Beku", brand: "SeaFresh", category: "FROZEN", description: "Peeled and deveined frozen tiger prawns", unit: "500g", priceRm: 19.90, subsidyRm: 13.00, barcode: "9556041800040", stock: 80 },
  { name: "Frozen Peas", nameMs: "Kacang Pis Sejuk Beku", brand: "McCain", category: "FROZEN", description: "Sweet garden peas, flash-frozen", unit: "500g", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041800057", stock: 100 },
  { name: "Frozen Mixed Vegetables", nameMs: "Sayur Campur Sejuk Beku", brand: "McCain", category: "FROZEN", description: "Mixed corn, peas and carrot blend", unit: "500g", priceRm: 5.90, subsidyRm: 3.90, barcode: "9556041800064", stock: 120 },
  { name: "Frozen French Fries", nameMs: "Kentang Goreng Sejuk Beku", brand: "McCain", category: "FROZEN", description: "Classic straight-cut French fries", unit: "750g", priceRm: 8.90, subsidyRm: 5.90, barcode: "9556041800071", stock: 100 },
  { name: "Frozen Beef Mince", nameMs: "Daging Lembu Cincang Sejuk Beku", brand: "Farm Master", category: "FROZEN", description: "Lean halal beef mince", unit: "500g", priceRm: 18.90, subsidyRm: 12.50, barcode: "9556041800088", stock: 80 },
  { name: "Ice Cream Vanilla", nameMs: "Ais Krim Vanila", brand: "Wall's", category: "FROZEN", description: "Creamy vanilla ice cream", unit: "1L tub", priceRm: 13.90, subsidyRm: 9.20, barcode: "9556041800095", stock: 60 },
  { name: "Frozen Dim Sum Assorted", nameMs: "Dim Sum Pelbagai Sejuk Beku", brand: "Prima Taste", category: "FROZEN", description: "Assorted dim sum variety pack", unit: "360g", priceRm: 11.90, subsidyRm: 7.90, barcode: "9556041800101", stock: 80 },
];

async function main() {
  console.log(`Seeding ${products.length} MyKasih products…`);

  await prisma.mykasihProduct.deleteMany();

  const result = await prisma.mykasihProduct.createMany({
    data: products.map((p) => ({
      ...p,
      priceRm: p.priceRm.toFixed(2),
      subsidyRm: p.subsidyRm.toFixed(2),
    })),
    skipDuplicates: true,
  });

  console.log(`✓ Seeded ${result.count} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
