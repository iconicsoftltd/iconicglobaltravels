// import { selectPermissions, store } from "@/components/store/store";

// const isDropDownShow = (permissions: string[]) => {
//       const state = store.getState();
  
//       // Get permissions from Redux
//       const parsePermissions = selectPermissions(state);

//   let flag = false;
//   for (const module of permissions) {
//     const find = parsePermissions.find(
//       (permission: any) =>
//         permission.module === module &&
//         permission.action === "read" &&
//         permission.isAllowed === true
//     );
//     if (find) {
//       flag = true;
//     }
//     break;
//   }

//   return flag;
// };

// export default isDropDownShow;

import { selectPermissions, store } from "@/components/store/store";

const isDropDownShow = (permissions: string[]) => {
  const state = store.getState();
  const allPermissions = selectPermissions(state);

  // If no specific permissions passed, show by default (optional behavior)
  if (!permissions.length) return true;

  for (const module of permissions) {
    const found = allPermissions.find(
      (perm: any) =>
        perm.module === module &&
        perm.action === "read" &&
        perm.isAllowed === true
    );

    if (found) {
      return true; // ✅ Found at least one module user can read
    }
  }

  return false; // ❌ None matched
};

export default isDropDownShow;

