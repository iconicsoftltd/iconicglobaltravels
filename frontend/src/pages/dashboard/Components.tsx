import { ReusableTable } from "@/components/common/ReusableTable";
import Heading from "@/components/typography/Heading";
import SectionHeader from "@/components/ui/section-header";
import { useCustomTranslator } from "@/hooks/useCustomTranslator";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

const ComponentsPage = () => {
  const { translate } = useCustomTranslator();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const totalItems = 123;
  const itemsPerPage = 10;

  const users: User[] = [
    {
      id: 1,
      name: "Mostofa Kamal",
      email: "mostofa@example.com",
      phone: "+8801712345678",
      role: "Frontend Developer",
      status: "Active",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      phone: "+8801912345678",
      role: "Backend Developer",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+8801812345678",
      role: "Project Manager",
      status: "Active",
    },
  ];

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: () => translate("নাম", "Name"),
      cell: ({ getValue }) => (
        <span>{translate(getValue<string>(), getValue<string>())}</span>
      ),
    },
    {
      accessorKey: "email",
      header: () => translate("ইমেইল", "Email"),
      cell: ({ getValue }) => (
        <span>{translate(getValue<string>(), getValue<string>())}</span>
      ),
    },
    {
      accessorKey: "email",
      header: () => translate("ইমেইল", "Email"),
      cell: ({ getValue }) => (
        <span>{translate(getValue<string>(), getValue<string>())}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: () => translate("ফোন", "Phone"),
      cell: ({ getValue }) => (
        <span>{translate(getValue<string>(), getValue<string>())}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: () => translate("ফোন", "Phone"),
      cell: ({ getValue }) => (
        <span>{translate(getValue<string>(), getValue<string>())}</span>
      ),
    },
    {
      accessorKey: "role",
      header: translate("রোল", "Role"),
      cell: ({ getValue }) => translate(getValue<string>(), getValue<string>()),
    },
    {
      accessorKey: "role",
      header: translate("রোল", "Role"),
      cell: ({ getValue }) => translate(getValue<string>(), getValue<string>()),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="h-full">
        <Heading className="mb-[20px]">Table</Heading>
        <ReusableTable
          data={users}
          columns={userColumns}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          setCurrentPage={setCurrentPage}
          columnPriority={{
            name: 1,
            email: 2,
            phone: 3,
            role: 4,
            status: 5,
          }}
          visibleColumnsCount={{
            smMobile: 6,
            mobile: 6,
            tablet: 6,
          }}
        />
      </div>
      {/* section header  */}
      <div className="mt-6">
        <SectionHeader
          title="Groups Account Type List"
          searchValue={search}
          onSearchChange={setSearch}
          onCreate={() => alert("Create button clicked")}
        />
      </div>
    </div>
  );
};

export default ComponentsPage;
