import React, { useState } from "react";
import Heading from "@/components/typography/Heading";
import HomeLoader from "@/components/loader/HomeLoader";
import getPermission from "@/utils/helper/getPermission";
import { Button } from "@/components/ui/button";
import { FaRegEdit } from "react-icons/fa";
import EditPermissions from "./EditPermissions";
import { useGetPermissionByUserQuery } from "@/components/store/api/user/UserPermissionApi";

interface UserDetailsProps {
  role: {
    id: number;
    name: string;
    description?: string;
    branchId: number;
    isSystemRole: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}

const UserDetails: React.FC<UserDetailsProps> = ({ role }) => {
  const [isEdit, setIsEdit] = useState(false);

  const { data: roleDetails, isLoading } = useGetPermissionByUserQuery(
    role?.id
  );

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handEditClose = () => {
    setIsEdit(false);
  };

  if (isLoading) return <HomeLoader />;

  const details = roleDetails?.user;
  const permissions = details?.permissions || [];

  if (!role) return null;

  return (
    <div className="space-y-4">
      {/* Permissions */}
      <div className="mt-6">
        <Heading className="text-gray-700 mb-2">Permissions</Heading>

        {isEdit ? (
          <>
            <EditPermissions onClose={handEditClose} editingRole={role} />
          </>
        ) : (
          <>
            {" "}
            {permissions.length === 0 ? (
              <div>
                <div className="mb-10 flex justify-end">
                  {getPermission("User", "create") && (
                    <Button
                      className="flex items-center gap-2 bg-[#6E56CF] text-white"
                      onClick={handleEdit}
                    >
                      <FaRegEdit />
                    </Button>
                  )}
                </div>
                <p className="text-gray-500 text-sm text-center">
                  No permissions assigned.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-10 flex justify-end">
                  {getPermission("User", "create") && (
                    <Button
                      className="flex items-center gap-2 bg-[#6E56CF] text-white"
                      onClick={handleEdit}
                    >
                      <FaRegEdit />
                    </Button>
                  )}
                </div>
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border text-left">Module</th>
                      <th className="p-2 border text-left">Action</th>
                      <th className="p-2 border text-center">Allowed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm: any) => (
                      <tr key={perm.id} className="border-b">
                        <td className="p-2 border">{perm?.module}</td>
                        <td className="p-2 border">{perm?.action}</td>
                        <td className="p-2 border text-center">
                          {perm.isAllowed ? (
                            <span className="text-green-600 font-semibold">
                              ✅ Yes
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold">
                              ❌ No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-10 flex justify-end">
                  {getPermission("Role", "create") && (
                    <Button
                      className="flex items-center gap-2 bg-[#6E56CF] text-white"
                      onClick={handleEdit}
                    >
                      <FaRegEdit />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
