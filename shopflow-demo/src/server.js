import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './config/database.js';
import { seedDatabase } from './db/seed.js';

const port = Number(process.env.PORT) || 3001;

initializeDatabase();
seedDatabase();

app.listen(port, () => {
  console.log(`ShopFlow API listening on port ${port}`);
});