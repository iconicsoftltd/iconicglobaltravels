


import { selectDatePermission, selectPermissions, store } from "@/components/store/store";


const getPermission = (module: string, action: string) => {
  const state = store.getState();

  // ✅ Date module আলাদাভাবে handle করুন
  if (module === "Date") {
    const datePermission = selectDatePermission(state);
    if (action === "read") return datePermission.read;
    if (action === "create") return datePermission.create;
    return false;
  }

  const permissions = selectPermissions(state);
  const find = permissions.find(
    (permission: any) =>
      permission.module === module &&
      permission.action === action &&
      permission.isAllowed === true
  );

  return !!find;
};

export default getPermission;