"use client";

import { useState, useEffect } from "react";
import { useGetPermissionAllQuery } from "@/components/store/api/premission/permissionApi";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/loader/ButtonLoader";
import toast from "react-hot-toast";
import HomeLoader from "@/components/loader/HomeLoader";
import {
  useCreateUserPermissionMutation,
  useGetPermissionByUserQuery,
} from "@/components/store/api/user/UserPermissionApi";
import { Label } from "@/components/ui/label";

interface ModulePermissions {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  all?: boolean;
}

interface Module {
  name: string;
  actions: {
    permissionId: number;
    action: string;
  }[];
  permissions: ModulePermissions;
}

interface EditPermissionsProps {
  onClose: () => void;
  editingRole?: any | null;
}

const EditPermissions = ({ onClose, editingRole }: EditPermissionsProps) => {
  const [isAllPermited, setIsAllPermited] = useState(false);
  const [isAllPermitedCheckBoxClicked, setIsAllPermitedCheckBoxClicked] =
    useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const { data: roleDetails, isLoading } = useGetPermissionByUserQuery(
    editingRole?.id
  );
  const { data: permissionData, isLoading: loadingPermissions } =
    useGetPermissionAllQuery({});

  const [updateRole, { isLoading: updatingRole }] =
    useCreateUserPermissionMutation();

  // Load permissions
  useEffect(() => {
    if (permissionData?.data) {
      const formattedModules = permissionData.data.map((module: any) => {
        const permissions = module.actions.reduce(
          (acc: ModulePermissions, action: any) => {
            acc[action.action] = false;
            return acc;
          },
          {} as ModulePermissions
        );
        return {
          name: module.module,
          actions: module.actions,
          permissions: { ...permissions, all: false },
        };
      });
      setModules(formattedModules);
    }
  }, [permissionData]);

  // Prefill when editing user permissions
  useEffect(() => {
    if (editingRole && permissionData?.data && roleDetails?.user) {
      const assignedPerms = roleDetails.user.permissions || [];

      const formattedModules = permissionData.data.map((module: any) => {
        const perms: ModulePermissions = {};

        module.actions.forEach((action: any) => {
          // ✅ Match by module name and action
          const found = assignedPerms.find(
            (p: any) => p.module === module.module && p.action === action.action
          );

          if (found?.isAllowed) {
            if (action.action === "create") perms.create = true;
            if (action.action === "read") perms.read = true;
            if (action.action === "update") perms.update = true;
            if (action.action === "delete") perms.delete = true;
          } else {
            if (action.action === "create") perms.create = false;
            if (action.action === "read") perms.read = false;
            if (action.action === "update") perms.update = false;
            if (action.action === "delete") perms.delete = false;
          }
        });

        // ✅ Auto-check "All" if all are true
        perms.all = Object.values(perms).every((v) => v === true);

        return {
          name: module.module,
          actions: module.actions,
          permissions: perms,
        };
      });

      setModules(formattedModules);
    }
  }, [editingRole, permissionData, roleDetails]);

  // Handle permission toggle
  const handlePermissionChange = (
    moduleIndex: number,
    permission: keyof ModulePermissions,
    value: boolean
  ) => {
    const updatedModules = [...modules];

    if (permission === "all") {
      const permissions = modules[moduleIndex].actions.reduce(
        (acc: ModulePermissions, action: any) => {
          acc[action.action] = value;
          return acc;
        },
        {} as ModulePermissions
      );
      updatedModules[moduleIndex].permissions = permissions;
    } else {
      updatedModules[moduleIndex].permissions[permission] = value;

      const actions = updatedModules[moduleIndex].actions.map((a) => a.action);
      const isAnyUnchecked = actions.find(
        (action) =>
          updatedModules[moduleIndex].permissions[
            action as keyof ModulePermissions
          ] === false
      );
      if (isAnyUnchecked) {
        updatedModules[moduleIndex].permissions.all = false;
      } else {
        updatedModules[moduleIndex].permissions.all = true;
      }
    }

    setModules(updatedModules);
  };

  // Handle all of all permission toggle
  useEffect(() => {
    if (!isAllPermitedCheckBoxClicked) return;
    if (isAllPermited) {
      const updatedModules = modules.map((module) => {
        const permissions = module.actions.reduce(
          (acc: ModulePermissions, action: any) => {
            acc[action.action] = true;
            return acc;
          },
          {} as ModulePermissions
        );
        return {
          ...module,
          permissions: { ...permissions, all: true },
        };
      });
      setModules(updatedModules);
      setIsAllPermitedCheckBoxClicked(false);
    } else {
      const updatedModules = modules.map((module) => {
        const permissions = module.actions.reduce(
          (acc: ModulePermissions, action: any) => {
            acc[action.action] = false;
            return acc;
          },
          {} as ModulePermissions
        );
        return {
          ...module,
          permissions: { ...permissions, all: false },
        };
      });
      setModules(updatedModules);
      setIsAllPermitedCheckBoxClicked(false);
    }
  }, [isAllPermited]);

  // set isAllPermited true if all modules have all permissions selected else false
  useEffect(() => {
    const allPermsSelected = modules.every((module) =>
      Object.values(module.permissions).every((v) => v === true)
    );
    setIsAllPermited(allPermsSelected);
  }, [modules]);

  // Submit create or update
  const handleSubmit = async () => {
    const selectedPermissions: { permissionId: number; isAllowed: boolean }[] =
      [];

    modules.forEach((module) => {
      module.actions.forEach((action) => {
        let isAllowed = false;
        if (action.action === "create")
          isAllowed = module.permissions.create as boolean;
        if (action.action === "read")
          isAllowed = module.permissions.read as boolean;
        if (action.action === "update")
          isAllowed = module.permissions.update as boolean;
        if (action.action === "delete")
          isAllowed = module.permissions.delete as boolean;
        selectedPermissions.push({
          permissionId: action.permissionId,
          isAllowed,
        });
      });
    });

    const payload = {
      permissions: selectedPermissions,
      userId: editingRole.id,
    };

    try {
      await updateRole(payload).unwrap();
      toast.success("Permission updated successfully");

      onClose();
    } catch (err: any) {
      console.error("Error saving role:", err);
      toast.error(err?.data?.message || "Failed to save role");
    }
  };

  if (loadingPermissions || isLoading) return <HomeLoader />;

  const isSaving = updatingRole;

  return (
    <div className="p-5 bg-white">
      <div className="flex justify-end items-center gap-4">
        <input
          type="checkbox"
          id="isAllPermited"
          checked={isAllPermited}
          onChange={(e) => {
            setIsAllPermited(e.target.checked);
            setIsAllPermitedCheckBoxClicked(true);
          }}
        />
        <Label htmlFor="isAllPermited" className="cursor-pointer pt-3">
          Select All Permissions
        </Label>
      </div>
      {/* Permissions Table */}
      <table className="w-full border-collapse border mb-5 mt-4">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2 text-left">SL</th>
            <th className="p-2 text-left">Module</th>
            {/* Dynamically show only existing actions + All */}
            <th className="p-2 text-center">Create</th>
            <th className="p-2 text-center">Read</th>
            <th className="p-2 text-center">Update</th>
            <th className="p-2 text-center">Delete</th>
            <th className="p-2 text-center">All</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module, index) => (
            <tr key={module.name} className="border-b hover:bg-gray-50">
              <td className="p-2">{index + 1}</td>
              <td className="p-2 font-medium">{module.name}</td>

              {(["create", "read", "update", "delete"] as const).map((perm) => {
                // Check if this action exists in module.actions
                const hasAction = module.actions.some((a) => a.action === perm);
                if (!hasAction) return <td key={perm}></td>; // empty cell if action not exists

                return (
                  <td key={perm} className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={module.permissions[perm]}
                      onChange={(e) =>
                        handlePermissionChange(index, perm, e.target.checked)
                      }
                    />
                  </td>
                );
              })}

              {/* All checkbox */}
              {module.actions.length > 1 ? (
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={module.permissions.all}
                    onChange={(e) =>
                      handlePermissionChange(index, "all", e.target.checked)
                    }
                  />
                </td>
              ) : (
                <td></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Submit Button */}
      <div className="text-right flex items-center gap-3 justify-end">
        <Button onClick={onClose} variant={"destructive"}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={isSaving}
        >
          {isSaving && <ButtonLoader />} Update
        </Button>
      </div>
    </div>
  );
};

export default EditPermissions;
