import React from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Heading from "@/components/typography/Heading";

interface ViewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewData?: Record<string, any> | null;
  title?: string;
}

const shouldHideKey = (key: string) =>
  key === "id" ||
  key.endsWith("Id") ||
  key.endsWith("_id") ||
  key === "createdAt" ||
  key === "updatedAt";

const formatKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

const formatPrimitive = (value: any) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && !isNaN(Date.parse(value)))
    return new Date(value).toLocaleString();
  return value.toString();
};

const isImageUrl = (value: string) =>
  typeof value === "string" &&
  value.startsWith("http") &&
  (value.endsWith(".png") ||
    value.endsWith(".jpg") ||
    value.endsWith(".jpeg") ||
    value.endsWith(".webp"));

/* Render nested object for `data` key */
// const RenderNestedData = ({ data }: { data: Record<string, any> }) => {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
//       {Object.entries(data).map(([key, value]) => {
//         if (shouldHideKey(key)) return null;

//         if (typeof value === "object" && value !== null) {
//           // If object inside data, flatten it recursively
//           return (
//             <div
//               key={key}
//               className="border rounded-md p-3 bg-gray-50 col-span-2"
//             >
//               <p className="text-xs text-gray-500 mb-1">{formatKey(key)}</p>
//               <pre className="text-sm font-medium text-gray-800 break-words whitespace-pre-wrap">
//                 {JSON.stringify(value, null, 2)}
//               </pre>
//             </div>
//           );
//         }

//         if (isImageUrl(value)) {
//           return (
//             <div key={key} className="border rounded-md p-3 bg-gray-50">
//               <p className="text-xs text-gray-500 mb-1">{formatKey(key)}</p>
//               <img src={value} alt={key} className="h-20 rounded border" />
//             </div>
//           );
//         }

//         return (
//           <div key={key} className="border rounded-md p-3 bg-gray-50">
//             <p className="text-xs text-gray-500 mb-1">{formatKey(key)}</p>
//             <p className="text-sm font-medium text-gray-800 break-words">
//               {formatPrimitive(value)}
//             </p>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

const RenderNestedData = ({
  data,
  level = 0,
}: {
  data: Record<string, any>;
  level?: number;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.entries(data).map(([key, value]) => {
        if (shouldHideKey(key)) return null;

        /* =====================
           NESTED OBJECT
        ===================== */
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return (
            <div
              key={key}
              className="col-span-2 border rounded-md p-3 bg-gray-50"
              style={{ marginLeft: level * 8 }}
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {formatKey(key)}
              </p>

              <RenderNestedData
                data={value}
                level={level + 1}
              />
            </div>
          );
        }

        /* =====================
           ARRAY
        ===================== */
        if (Array.isArray(value)) {
          return (
            <div
              key={key}
              className="col-span-2 border rounded-md p-3 bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {formatKey(key)}
              </p>

              <div className="space-y-2">
                {value.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded p-2 bg-white"
                  >
                    {typeof item === "object" ? (
                      <RenderNestedData data={item} level={level + 1} />
                    ) : (
                      <p className="text-sm">
                        {formatPrimitive(item)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        /* =====================
           IMAGE
        ===================== */
        if (isImageUrl(value)) {
          return (
            <div
              key={key}
              className="border rounded-md p-3 bg-gray-50"
            >
              <p className="text-xs text-gray-500 mb-1">
                {formatKey(key)}
              </p>
              <img
                src={value}
                alt={key}
                className="h-20 rounded border"
              />
            </div>
          );
        }

        /* =====================
           PRIMITIVE
        ===================== */
        return (
          <div
            key={key}
            className="border rounded-md p-3 bg-gray-50"
          >
            <p className="text-xs text-gray-500 mb-1">
              {formatKey(key)}
            </p>
            <p className="text-sm font-medium text-gray-800 break-words">
              {formatPrimitive(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const ReusableLogViewModal: React.FC<ViewDetailsModalProps> = ({
  open,
  onOpenChange,
  viewData,
  title = "Log Details",
}) => {
  if (!viewData) return null;

  const { data, user, ...rest } = viewData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Heading className="text-[#5e48d8] font-semibold">{title}</Heading>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Top-level flat keys */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(rest).map(([key, value]) => {
              if (shouldHideKey(key)) return null;

              return (
                <div key={key} className="border rounded-md p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">{formatKey(key)}</p>
                  <p className="text-sm font-medium text-gray-800 break-words">
                    {formatPrimitive(value)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action By */}
          {user?.employee && (
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Action By
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.employee.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.role?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.employee.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.employee.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nested `data` */}
          {data && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Data</p>
              <RenderNestedData data={data} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReusableLogViewModal;
