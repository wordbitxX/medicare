import dotenv from "dotenv";
dotenv.config();

import { seedDatabase } from "./seed";

async function main() {
  console.log("Running seed script...");
  await seedDatabase();
  console.log("Seed script finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
