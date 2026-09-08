import dotenv from "dotenv";
dotenv.config();

import { expandDoctors } from "./expand-doctors";

async function main() {
  console.log("Running doctor expansion script...");
  await expandDoctors();
  console.log("Doctor expansion script finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Doctor expansion script failed:", err);
  process.exit(1);
});
