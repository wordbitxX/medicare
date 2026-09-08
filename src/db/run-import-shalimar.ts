import dotenv from "dotenv";
dotenv.config();

import { importShalimarDoctors } from "./import-shalimar-doctors";

async function main() {
  console.log("Running Shalimar doctors import...");
  await importShalimarDoctors();
  console.log("Import finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
