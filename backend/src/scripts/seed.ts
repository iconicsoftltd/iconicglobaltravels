import seedProducts from "../utils/productSeed";
import seedDatabase from "../utils/seedDatabase";

const runSeed = async () => {
  try {
    console.log("Starting database seeding process...");
    await seedDatabase();
    await seedProducts();
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

runSeed();
