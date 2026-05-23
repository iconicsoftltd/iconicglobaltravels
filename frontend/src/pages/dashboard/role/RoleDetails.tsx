/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import Heading from "@/components/typography/Heading";
import { useGetRoleByIdQuery } from "@/components/store/api/role/roleApi";
import HomeLoader from "@/components/loader/HomeLoader";

interface RoleDetailsProps {
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

const RoleDetails: React.FC<RoleDetailsProps> = ({ role }) => {
  if (!role) return null;

  const { data: roleDetails, isLoading } = useGetRoleByIdQuery(role.id);

  if (isLoading) return <HomeLoader />;

  const details = roleDetails?.data;
  const permissions = details?.rolePermissions || [];

  return (
    <div className="space-y-4">
      <Heading className="text-[#5e48d8] font-semibold">Role Details</Heading>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Name:</strong> {details?.name}
        </div>
        <div>
          <strong>System Role:</strong> {details?.isSystemRole ? "Yes" : "No"}
        </div>
        <div>
          <strong>Created:</strong>{" "}
          {new Date(details?.createdAt || "").toLocaleString()}
        </div>
        <div>
          <strong>Updated:</strong>{" "}
          {new Date(details?.updatedAt || "").toLocaleString()}
        </div>
      </div>

      {/* Permissions */}
      <div className="mt-6">
        <Heading className="text-gray-700 mb-2">Permissions</Heading>

        {permissions.length === 0 ? (
          <p className="text-gray-500 text-sm">No permissions assigned.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="p-2 border">{perm.permission?.module}</td>
                    <td className="p-2 border">{perm.permission?.action}</td>
                    <td className="p-2 border text-center">
                      {perm.isAllowed ? (
                        <span className="text-green-600 font-semibold">✅ Yes</span>
                      ) : (
                        <span className="text-red-500 font-semibold">❌ No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDetails;
