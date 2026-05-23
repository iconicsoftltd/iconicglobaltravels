import bcrypt from "bcrypt";
import prisma from "./prisma";

const seedDatabase = async () => {
  try {
    console.log("🔰 Starting database seeding...");

    // ------------ Branch

    // Create main branch if it doesn't exist
    const mainBranch = await prisma.branch.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Main Branch",
        address: "Head Office",
        email: "admin@company.com",
        phone: "+1234567890",
        isActive: true,
      },
    });

    console.log("Branch created/updated");

    // ------------ Role
    // Create Super Admin Role if it doesn't exist
    const superAdminRole = await prisma.role.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "SuperAdmin",
        description: "Super Administrator with all permissions",
        isSystemRole: true,
      },
    });

    console.log("Super Admin Role created/updated");

    // -------------- User management

    // Create default department
    const department = await prisma.department.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Administration",
      },
    });

    console.log("Department created/updated");

    // Create default designation
    const designation = await prisma.designation.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "System Administrator",
      },
    });

    console.log("Designation created/updated");

    // Hash the default password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create Super Admin Employee if it doesn't exist
    const superAdminEmployee = await prisma.employee.upsert({
      where: { id: 1 },
      update: {},
      create: {
        designationId: designation.id,
        branchId: mainBranch.id,
        name: "Super Admin",
        email: "superadmin@company.com",
        phone: "+1234567890",
        address: "Head Office",
        nid: "123456789",
        uuid: "EMPLOYEE-001",
        salary: 0,
        joiningDate: new Date().toISOString(),
        image: "",
        departmentId: department.id,
        isActive: true,
      },
    });

    console.log("Super Admin Employee created/updated");

    // Create Admin Employee if it doesn't exist
    const adminEmployee = await prisma.employee.upsert({
      where: { id: 2 },
      update: {},
      create: {
        designationId: designation.id,
        branchId: mainBranch.id,
        name: "Admin User",
        email: "admin@company.com",
        phone: "+1234567891",
        address: "Head Office",
        nid: "123456790",
        uuid: "EMPLOYEE-002",
        salary: 0,
        joiningDate: new Date().toISOString(),
        image: "",
        departmentId: department.id,
        isActive: true,
      },
    });

    console.log("Admin Employee created/updated");

    // Create Super Admin User if it doesn't exist
    const superAdminUser = await prisma.user.upsert({
      where: { id: 1 },
      update: {},
      create: {
        employeeId: superAdminEmployee.id,
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        verifiedCode: null,
      },
    });

    console.log("Super Admin User created/updated");

    // Create Admin User if it doesn't exist
    const adminUser = await prisma.user.upsert({
      where: { id: 2 },
      update: {},
      create: {
        employeeId: adminEmployee.id,
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        verifiedCode: null,
      },
    });

    console.log("Admin User created/updated");

    // Create default user branch assignment
    await prisma.userBranch.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: superAdminUser.id,
        branchId: mainBranch.id,
      },
    });

    await prisma.userBranch.upsert({
      where: { id: 2 },
      update: {},
      create: {
        userId: adminUser.id,
        branchId: mainBranch.id,
      },
    });

    console.log("User branch assignments created/updated");

    // --------------------- Accounting management

    // Create default groups for accounting
    const assetGroup = await prisma.group.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        account: "Assets",
        accountType: "Current Assets",
        code: "ASSET-001",
        isActive: true,
      },
    });

    const liabilityGroup = await prisma.group.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        account: "Liability",
        accountType: "Current Liabilities",
        code: "LIAB-001",
        isActive: true,
      },
    });

    const equityGroup = await prisma.group.upsert({
      where: { id: 3 },
      update: {},
      create: {
        branchId: mainBranch.id,
        account: "Equity",
        accountType: "Capital",
        code: "EQUITY-001",
        isActive: true,
      },
    });

    const incomeGroup = await prisma.group.upsert({
      where: { id: 4 },
      update: {},
      create: {
        branchId: mainBranch.id,
        account: "Income",
        accountType: "Revenue",
        code: "INCOME-001",
        isActive: true,
      },
    });

    const expenseGroup = await prisma.group.upsert({
      where: { id: 5 },
      update: {},
      create: {
        branchId: mainBranch.id,
        account: "Expense",
        accountType: "Operating Expenses",
        code: "EXPENSE-001",
        isActive: true,
      },
    });

    console.log("Accounting groups created/updated");

    // Create default ledgers
    const handCashLedger = await prisma.ledger.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: assetGroup.id,
        ledgerType: "Cash In Hand",
        code: "CASH-001",
        isActive: true,
      },
    });

    const bankLedger = await prisma.ledger.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: assetGroup.id,
        ledgerType: "Cash At Bank",
        code: "BANK-001",
        isActive: true,
      },
    });

    const prettyCashLedger = await prisma.ledger.upsert({
      where: { id: 3 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: assetGroup.id,
        ledgerType: "Petty Cash",
        code: "PETTY-001",
        isActive: true,
      },
    });

    const salesLedger = await prisma.ledger.upsert({
      where: { id: 4 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: incomeGroup.id,
        ledgerType: "Sales",
        code: "SALES-001",
        isActive: true,
      },
    });

    const invLedger = await prisma.ledger.upsert({
      where: { id: 5 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: liabilityGroup.id,
        ledgerType: "Inventory",
        code: "INV-001",
        isActive: true,
      },
    });

    const cogsLedger = await prisma.ledger.upsert({
      where: { id: 6 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: liabilityGroup.id,
        ledgerType: "COGS",
        code: "INV-001",
        isActive: true,
      },
    });

    const accountsReceivableLedger = await prisma.ledger.upsert({
      where: { id: 7 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: assetGroup.id,
        ledgerType: "Accounts Receivable",
        code: "AR-001",
        isActive: true,
      },
    });

    const accountsPayableLedger = await prisma.ledger.upsert({
      where: { id: 8 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: liabilityGroup.id,
        ledgerType: "Accounts Payable",
        code: "AP-001",
        isActive: true,
      },
    });

    const expenseLedger = await prisma.ledger.upsert({
      where: { id: 8 },
      update: {},
      create: {
        branchId: mainBranch.id,
        groupAccountId: expenseGroup.id,
        ledgerType: "Expense",
        code: "EXP-001",
        isActive: true,
      },
    });

    // Particulars
    await prisma.particular.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: expenseLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "Expense Account",
        companyName: "Office Expense",
        mobileNumber: "+1234567899",
        email: "expense@company.com",
        address: "Head Office",
      },
    });

    await prisma.particular.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: invLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "Inventory Account",
        companyName: "Account",
        mobileNumber: "+1234567899",
        email: "customer@company.com",
        address: "Local Market",
      },
    });

    await prisma.particular.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: cogsLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "COGS",
        companyName: "Account",
        mobileNumber: "+1234567899",
        email: "customer@company.com",
        address: "Local Market",
      },
    });
    await prisma.particular.upsert({
      where: { id: 3 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: accountsReceivableLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "Customer",
        companyName: "Walk-in Customer",
        mobileNumber: "+8801000000000",
        email: "walkin@example.com",
        address: "Local Market",
      },
    });

    await prisma.particular.upsert({
      where: { id: 4 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: accountsPayableLedger.id,
        type: "Credit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Credit",
        accountType: "Supplier",
        companyName: "Default Supplier",
        mobileNumber: "+8801999999999",
        email: "supplier@example.com",
        address: "Dhaka",
      },
    });

    await prisma.particular.upsert({
      where: { id: 5 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: handCashLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "Hand Cash",
        companyName: "Main Cash",
        mobileNumber: null,
        email: null,
        address: "Office Cash Drawer",
      },
    });

    await prisma.particular.upsert({
      where: { id: 6 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: bankLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "Bank",
        companyName: "DBBL - 1234567890",
        mobileNumber: null,
        email: null,
        address: "Dutch Bangla Bank Ltd",
      },
    });

    await prisma.particular.upsert({
      where: { id: 7 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: prettyCashLedger.id,
        type: "Debit",
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Debit",
        accountType: "Cash",
        companyName: "Office Petty Cash",
        mobileNumber: null,
        email: null,
        address: "Accounts Department",
      },
    });

    await prisma.particular.upsert({
      where: { id: 8 },
      update: {},
      create: {
        branchId: mainBranch.id,
        ledgerId: salesLedger.id,
        type: "Credit", // Revenue nature
        balance: 0,
        openingBalance: 0,
        openingBalanceType: "Credit",
        accountType: "Income",
        companyName: "General Sales",
        mobileNumber: null,
        email: null,
        address: "System Generated",
      },
    });

    // * Product Size ===================

    const size = await prisma.size.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Small",
      },
    });

    await prisma.size.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Medium",
      },
    });

    await prisma.size.upsert({
      where: { id: 3 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Large",
      },
    });

    // * Product Color ===================

    const color = await prisma.color.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Black",
      },
    });

    await prisma.color.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "White",
      },
    });

    await prisma.color.upsert({
      where: { id: 3 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Red",
      },
    });

    await prisma.color.upsert({
      where: { id: 4 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Blue",
      },
    });

    // Create default categories
    const category = await prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Electronics",
      },
    });

    const subCategory = await prisma.subCategory.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        categoryId: 1,
        name: "Mobile Phones",
      },
    });

    const clothingCategory = await prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Clothing",
      },
    });

    console.log("Default categories created/updated");

    // Create default units
    const unit = await prisma.unit.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Piece",
      },
    });

    const kgUnit = await prisma.unit.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "KG",
      },
    });

    console.log("Default units created/updated");

    // Create default brand
    const brand = await prisma.brand.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branchId: mainBranch.id,
        name: "Generic",
      },
    });

    console.log("Default brand created/updated");

    // 1️⃣ Product Upsert
    const product = await prisma.product.upsert({
      where: { id: 1 },
      update: {
        name: "Samsung S24",
      },
      create: {
        branchId: mainBranch.id,
        name: "Samsung S24",
        categoryId: category.id,
        subCategoryId: subCategory.id,
        unitId: unit.id,
        brandId: brand.id,
        productCode: "SS24",
      },
    });

    const iphone15Pro = await prisma.product.upsert({
      where: {
        id: 2,
      },
      update: { name: "iPhone 15 Pro" },
      create: {
        branchId: mainBranch.id,
        name: "iPhone 15 Pro",
        categoryId: category.id,
        subCategoryId: subCategory.id,
        unitId: unit.id,
        brandId: brand.id,
        productCode: "IP15PRO",
      },
    });

    const pixel8 = await prisma.product.upsert({
      where: {
        id: 3,
      },
      update: { name: "Google Pixel 8" },
      create: {
        branchId: mainBranch.id,
        name: "Google Pixel 8",
        categoryId: category.id,
        subCategoryId: subCategory.id,
        unitId: unit.id,
        brandId: brand.id,
        productCode: "PX8",
      },
    });

    // 2️⃣ Product Variation Upsert
    await prisma.productVariation.upsert({
      where: { id: 1 },
      update: {
        salePrice: 1200,
        wholeSalePrice: 1000,
        purchasePrice: 800,
      },
      create: {
        branchId: mainBranch.id,
        productId: product.id,
        sizeId: size.id,
        colorId: color.id,
        salePrice: 1200,
        wholeSalePrice: 1000,
        purchasePrice: 800,
        stockQuantity: 100,
        damageQuantity: 0,
        saleQuantity: 0,
      },
    });

    await prisma.productVariation.upsert({
      where: {
        id: 2,
      },
      update: {
        salePrice: 1800,
        wholeSalePrice: 1600,
        purchasePrice: 1400,
      },
      create: {
        branchId: mainBranch.id,
        productId: iphone15Pro.id,
        sizeId: size.id,
        colorId: color.id,
        salePrice: 1800,
        wholeSalePrice: 1600,
        purchasePrice: 1400,
        stockQuantity: 120,
        damageQuantity: 0,
        saleQuantity: 0,
      },
    });

    await prisma.productVariation.upsert({
      where: {
        id: 3,
      },
      update: {
        salePrice: 1300,
        wholeSalePrice: 1100,
        purchasePrice: 900,
      },
      create: {
        branchId: mainBranch.id,
        productId: pixel8.id,
        sizeId: size.id,
        colorId: color.id,
        salePrice: 1300,
        wholeSalePrice: 1100,
        purchasePrice: 900,
        stockQuantity: 180,
        damageQuantity: 0,
        saleQuantity: 0,
      },
    });

    // Seed permissions
    await seedPermissions();

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
};

const seedPermissions = async () => {
  // This will use the existing seedPermission function
  const seedPermission = await import("./seedPermission");
  await seedPermission.default();
  console.log("✅ Permissions seeded successfully!");
};

export default seedDatabase;
