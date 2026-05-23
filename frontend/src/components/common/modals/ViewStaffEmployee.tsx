import { useGetEmployeeByIdQuery } from "@/components/store/api/employee/employeeApi";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FaMailBulk } from "react-icons/fa";
import { FaLocationDot, FaPhone, FaVoicemail } from "react-icons/fa6";
import { useParams } from "react-router-dom";

const ViewStaffEmployee = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetEmployeeByIdQuery(Number(id));
  const employee = data?.data;

  if (isLoading) return <p>Loading...</p>;
  if (isError || !employee) return <p>Employee not found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-7 2xl:md:grid-cols-6  gap-6">

      {/* Left Section */}
      <div className="md:col-span-3 xl:col-span-3 2xl:col-span-2 bg-white">
        {/* Profile */}
        <div className="bg-gray-100 py-3">
          <h2 className="text-base font-semibold px-4 text-gray-800">Profile</h2>
        </div>
        <div className="p-3">
          <div className="flex gap-3 items-center text-start">
            <div>
              <img
                src={employee.image}
                alt={employee.name}
                className="w-32 h-32 rounded-lg object-cover mb-3 border border-gray-200"
              />
            </div>
            <div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  employee.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {employee.isActive ? "Active" : "Inactive"}
              </span>
              <h2 className="text-lg font-semibold mt-2">{employee.name}</h2>
              <p className="text-sm text-gray-500">Role: {employee.designationId}</p>
              <p className="text-xs text-gray-400 mt-1">
                Entry Time: {new Date(employee.createdAt).toLocaleDateString()} |{" "}
                {new Date(employee.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="mt-4">
            <div className="bg-gray-100 py-3">
              <h2 className="text-base font-semibold px-4 text-gray-800">
                Basic Information
              </h2>
            </div>
            <ul className="text-sm text-gray-600 space-y-4 p-3">
              <li className="flex justify-between">
                <strong>Staff ID:</strong> <p>{employee.uuid}</p>
              </li>
              <li className="flex justify-between">
                <strong>Gender:</strong> <p>Male</p>
              </li>
              <li className="flex justify-between">
                <strong>Designation:</strong> <p>{employee.name}</p>
              </li>
              <li className="flex justify-between">
                <strong>Department:</strong> <p>{employee.name}</p>
              </li>
              <li className="flex justify-between">
                <strong>Salary:</strong> <p>{employee.salary?.toLocaleString()}</p>
              </li>
              <li className="flex justify-between">
                <strong>Joining Date:</strong> <p>{employee.joiningDate}</p>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="pt-4">
            <div className="bg-gray-100 py-3">
              <h2 className="text-base font-semibold px-4 text-gray-800">
                Primary Contact Info
              </h2>
            </div>
            <div className="text-sm text-gray-600 space-y-2 p-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-gray-100 text-gray-600" size="icon">
                  <FaPhone />
                </Button>
                <div>
                  <strong>Phone:</strong> <p>{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-gray-100 text-gray-600" size="icon">
                  <FaVoicemail />
                </Button>
                <div>
                  <strong>Email:</strong>{" "}
                  <p>
                    <a
                      href={`mailto:${employee.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {employee.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="md:col-span-3 xl:col-span-4 2xl:col-span-4">
        {/* Address */}
        <div className="bg-gray-100 py-3">
          <h2 className="text-base font-semibold px-4 text-gray-800">Address</h2>
        </div>
        <div className="p-4 bg-white">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-4">
              <Button variant="outline" className="bg-gray-100 text-gray-600" size="icon">
                <FaLocationDot />
              </Button>
              <div>
                <strong>Current Address:</strong> <p>{employee.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="bg-gray-100 text-gray-600" size="icon">
                <FaMailBulk />
              </Button>
              <div>
                <strong>Permanent Address:</strong> <p>{employee.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="mt-4">
          <div className="bg-gray-100 py-3">
            <h2 className="text-base font-semibold px-4 text-gray-800">Bank Details</h2>
          </div>
          <div className="text-sm text-gray-600 grid grid-cols-2 gap-y-2 p-4 bg-white">
            <p>
              <strong>Bank Name:</strong> <p>Islamic Bank Bangladesh Ltd.</p>
            </p>
            <p>
              <strong>Account Number:</strong> <p>012012484518025</p>
            </p>
            <p>
              <strong>Account Type:</strong> <p>Savings</p>
            </p>
            <p>
              <strong>Company Name:</strong> <p>Kolabagan, Panthapoth, Dhaka</p>
            </p>
            <p>
              <strong>Routing Number:</strong> <p>2025489</p>
            </p>
          </div>
        </div>

        {/* Document */}
        <div className="mt-4 bg-white">
          <div className="bg-gray-100 py-3">
            <h2 className="text-base font-semibold px-4 text-gray-800">Document</h2>
          </div>
          <div className="space-y-3 mt-4 p-3">
            <div className="flex items-center justify-between w-[50%] bg-gray-100 p-3">
              <p className="text-sm">Resume.PDF</p>
              <Button size="icon" variant="outline" className="bg-gray-100 text-[#5e48d8]">
                <Download className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            <div className="flex items-center justify-between w-[50%] bg-gray-100 p-3">
              <p className="text-sm">Joining Letter.PDF</p>
              <Button size="icon" variant="outline" className="bg-gray-100 text-[#5e48d8]">
                <Download className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStaffEmployee;
