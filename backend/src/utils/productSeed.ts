import prisma from "./prisma";

const seedProducts = async () => {
  const mainBranch = await prisma.branch.findFirst();
  const category = await prisma.category.findFirst();
  const subCategory = await prisma.subCategory.findFirst();
  const unit = await prisma.unit.findFirst();
  const brand = await prisma.brand.findFirst();

  if (!mainBranch || !category || !subCategory || !unit || !brand) {
    throw new Error("Required relations not found. Seed dependencies first.");
  }

  await prisma.product.createMany({
    data: [
      {
        branchId: mainBranch.id,
        name: "Premium Face Wash",
        categoryId: category.id,
        subCategoryId: subCategory.id,
        unitId: unit.id,
        brandId: brand.id,
        productCode: "PFW-001",
      },
      {
        branchId: mainBranch.id,
        name: "Herbal Shampoo",
        categoryId: category.id,
        subCategoryId: subCategory.id,
        unitId: unit.id,
        brandId: brand.id,
        productCode: "HS-002",
      },
      {
        branchId: mainBranch.id,
        name: "Body Lotion 250ml",
        categoryId: category.id,
        subCategoryId: subCategory.id,
        unitId: unit.id,
        brandId: brand.id,
        productCode: "BL-003",
      },
    ],
  });

  console.log("✅ Products seeded successfully!");
};

export default seedProducts;
