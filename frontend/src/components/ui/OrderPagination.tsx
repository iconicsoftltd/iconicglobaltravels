// interface PaginationProps {
//   totalPages: number;
//   currentPage: number;
//   itemsPerPage: number;
//   onPageChange: (page: number) => void;
//   onItemsPerPageChange: (itemsPerPage: number) => void;
// }

import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// export default function Pagination({
//   totalPages,
//   currentPage,
//   itemsPerPage,
//   onPageChange,
//   onItemsPerPageChange,
// }: PaginationProps) {
//   const maxPageButtons = 10;

//   const getPageNumbers = () => {
//     const pages: number[] = [];
//     const half = Math.floor(maxPageButtons / 2);

//     let start = Math.max(1, currentPage - half);
//     let end = Math.min(totalPages, currentPage + half);

//     if (start === 1) {
//       end = Math.min(totalPages, start + maxPageButtons - 1);
//     } else if (end === totalPages) {
//       start = Math.max(1, end - maxPageButtons + 1);
//     }

//     for (let i = start; i <= end; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   // This function is only responsible for changing the page number
//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       onPageChange(page);
//     }
//   };

//   // This function will handle the change in the number of items per page
//   const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newItemsPerPage = Number(e.target.value);
//     onItemsPerPageChange(newItemsPerPage);
//   };

//   return (
//     <div className="flex items-center justify-between lg:px-4 py-2">
//       {/* Prev Button */}
//       <div className="flex items-center gap-5">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className={`px-3 py-1 rounded-md ${
//             currentPage === 1
//               ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//           }`}
//         >
//           Prev
//         </button>

//         {/* Page Numbers */}
//         <div className="flex items-center gap-2">
//           {getPageNumbers().map((page) => (
//             <button
//               key={page}
//               onClick={() => handlePageChange(page)}
//               className={`px-3 py-1 rounded-md ${
//                 page === currentPage
//                   ? "bg-gray-800 text-white"
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//             >
//               {page}
//             </button>
//           ))}
//           {totalPages > maxPageButtons &&
//             currentPage + Math.floor(maxPageButtons / 2) < totalPages && (
//               <span className="px-2">...</span>
//             )}
//         </div>

//         {/* Next Button */}
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className={`px-3 py-1 rounded-md ${
//             currentPage === totalPages
//               ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//           }`}
//         >
//           Next
//         </button>
//       </div>

//       {/* Items Per Page Dropdown */}
//       <div className="lg:ml-4 flex items-center">
//         <span className="mx-2 text-sm text-gray-600">Items per page</span>
//         <select
//           value={itemsPerPage}
//           onChange={handleItemsPerPageChange}
//           className="px-3 py-1 border border-gray-300 rounded-md text-sm"
//         >
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//           <option value={30}>30</option>
//           <option value={50}>50</option>
//           <option value={100}>100</option>
//           <option value={9999999}>All</option>
//         </select>
//       </div>
//     </div>
//   );
// }

// The new pagination.....

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
}

const OrderPagination = ({
  totalPages,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) => {
  const [visiblePages, setVisiblePages] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setVisiblePages(window.innerWidth >= 768 ? 6 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= visiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const end = Math.min(totalPages, start + visiblePages - 1);

    if (end - start + 1 < visiblePages) {
      start = Math.max(1, end - visiblePages + 1);
    }

    const pages: (number | string)[] = [];

    if (start > 1) pages.push(1);

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      //@ts-ignore
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");

    if (end < totalPages) pages.push("Last");

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[100, 200, 300, 500].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 lg:p-1.5 rounded border disabled:opacity-50 text-sm sm:text-base hover:bg-gray-50"
        >
          <IoIosArrowBack className="text-xl"/>
        </button>

        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => {
                if (page === "Last") {
                  onPageChange(totalPages);
                } else if (typeof page === "number") {
                  onPageChange(page);
                }
              }}
              className={`min-w-[36px] px-2 py-1 rounded border text-sm sm:text-base ${
                page === currentPage ||
                (page === "Last" && currentPage === totalPages)
                  ? "bg-primary text-white border-primary"
                  : "hover:bg-gray-50"
              } ${page === "..." && "pointer-events-none cursor-default"}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 lg:p-1.5 rounded border disabled:opacity-50 text-sm sm:text-base hover:bg-gray-50"
        >
          <IoIosArrowForward className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default OrderPagination;
