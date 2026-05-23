import UpdateProfileModel from "@/components/common/modals/updateProfileModel";
import { useGetProfileQuery } from "@/components/store/api/user/userApi";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useState } from "react";
import { FaMailBulk, FaRegEdit } from "react-icons/fa";
import { FaLocationDot, FaPhone, FaVoicemail } from "react-icons/fa6";

const CompanyProfilePage = () => {
  const { data, isLoading, isError } = useGetProfileQuery({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const employee = data?.data?.employee;

  if (isLoading) return <p>Loading...</p>;
  if (isError || !employee) return <p>Employee not found.</p>;

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="col-span-1 bg-white">
          {/* Profile */}
          <div className="bg-gray-100 py-3 flex items-center justify-between px-4">
            <h2 className="text-base font-semibold  text-gray-800">Profile</h2>

            {/* modal  */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gray-100 text-gray-600"
                  size="icon"
                  onClick={handleModalClose}
                >
                  <FaRegEdit />
                </Button>
              </DialogTrigger>

              <DialogContent
                className={
                  "sm:max-w-[600px] max-h-[90vh] w-[96vw] overflow-y-auto scrollbar-hide"
                }
              >
                <DialogHeader>
                  <Heading className={`text-[#5e48d8] font-semibold`}>
                    Update Profile
                  </Heading>
                </DialogHeader>
                <hr className="border" />
                {/* modalContent */}
                <UpdateProfileModel
                  onClose={handleModalClose}
                  editingEmployee={employee}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-5 p-5 rounded-2xl border bg-white shadow-sm">
              {/* Image */}
              <div className="relative">
                <img
                  src={employee.image}
                  alt={employee.name}
                  className="w-28 h-28 rounded-2xl object-cover border border-gray-200 shadow-sm"
                />

                {/* Status Badge (floating) */}
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                    employee.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                {/* Name */}
                <h2 className="text-xl font-semibold text-gray-800">
                  {employee.name}
                </h2>

                {/* Role */}
                <p className="text-sm text-gray-500">
                  {employee?.designation?.name || "No designation"}
                </p>

                {/* Department */}
                <p className="text-sm text-gray-400">
                  {employee?.department?.name || "No department"}
                </p>

                {/* Meta */}
                <p className="text-xs text-gray-400 mt-2">
                  Joined: {new Date(employee.createdAt).toLocaleDateString()} •{" "}
                  {new Date(employee.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="mt-6 rounded-2xl border bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-5 py-3 border-b">
                <h2 className="text-sm font-semibold text-gray-800">
                  Basic Information
                </h2>
              </div>

              {/* Content */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <p className="text-xs text-gray-400">Staff ID</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.uuid}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Gender</p>
                  <p className="text-sm font-medium text-gray-800">Male</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Designation</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee?.designation?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee?.department?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Salary</p>
                  <p className="text-sm font-semibold text-green-600">
                    {employee.salary?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Joining Date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.joiningDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 rounded-2xl border bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-5 py-3 border-b">
                <h2 className="text-sm font-semibold text-gray-800">
                  Primary Contact Info
                </h2>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600">
                    <FaPhone className="text-sm" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">
                      {employee.phone}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600">
                    <FaVoicemail className="text-sm" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <a
                      href={`mailto:${employee.email}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {employee.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-2 space-y-6 bg-white p-4">
          {/* ADDRESS */}
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-800">Address</h2>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <FaLocationDot />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current Address</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <FaMailBulk />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Permanent Address</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BANK DETAILS */}
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-800">
                Bank Details
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <p className="text-xs text-gray-400">Bank Name</p>
                <p className="text-sm font-medium text-gray-800">
                  Islamic Bank Bangladesh Ltd.
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Account Number</p>
                <p className="text-sm font-medium text-gray-800">
                  012012484518025
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Account Type</p>
                <p className="text-sm font-medium text-gray-800">Savings</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Branch / Company</p>
                <p className="text-sm font-medium text-gray-800">
                  Kolabagan, Panthapoth, Dhaka
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Routing Number</p>
                <p className="text-sm font-medium text-gray-800">2025489</p>
              </div>
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-800">Documents</h2>
            </div>

            <div className="p-5 space-y-3">
              {/* File Item */}
              <div className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-gray-50 transition">
                <p className="text-sm text-gray-700">Resume.pdf</p>

                <Button size="icon" variant="outline" className="rounded-lg">
                  <Download className="h-4 w-4 text-gray-600" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-gray-50 transition">
                <p className="text-sm text-gray-700">Joining Letter.pdf</p>

                <Button size="icon" variant="outline" className="rounded-lg">
                  <Download className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfilePage;
