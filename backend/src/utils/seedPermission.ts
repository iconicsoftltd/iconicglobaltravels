import fs from "fs";
import path from "path";
import prisma from "./prisma";
const seedPermission = async () => {
  const filePath = path.join(__dirname, "../..", "permission.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const permissions = JSON.parse(jsonData);

  const createdPermissions: {
    action: string;
    module: string;
    description: string;
  }[] = [];

  for (const permission of permissions) {
    for (const action of permission.actions) {
      createdPermissions.push({
        module: permission.module as string,
        action: action as string,
        description: `${permission.module} ${action} permission`,
      });
    }
  }
  await prisma.userPermission.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.permission.createMany({
    data: createdPermissions,
  });
  const findPermission = await prisma.permission.findMany({});
  const findRole = await prisma.role.findFirst({
    where: { isSystemRole: true, name: "SuperAdmin" },
  });
  if (findRole) {
    // Delete existing role permissions for SuperAdmin to avoid duplicates
    await prisma.rolePermission.deleteMany({
      where: { roleId: findRole.id },
    });

    await prisma.rolePermission.createMany({
      data: findPermission.map((permission) => ({
        roleId: findRole.id,
        permissionId: permission.id,
        isAllowed: true,
      })),
    });
  }

  return createdPermissions;
};

export default seedPermission;
