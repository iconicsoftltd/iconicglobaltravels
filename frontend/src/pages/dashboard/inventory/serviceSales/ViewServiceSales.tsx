import React from "react";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useGetServiceSalesByIdQuery } from "@/components/store/api/inventory/serviceSales/serviceSalesApi";
import ServiceSalesPrint from "@/components/common/PrintPdf/ServiceSalesPrint";
import ServiceSalesChalanPrint from "@/components/common/PrintPdf/ServiceSalesChalanPrint";
import PdfServiceSales from "@/components/common/PrintPdf/PdfServiceSales";

interface ViewServiceSalesProps {
  saleId: number;
}

const ViewServiceSales: React.FC<ViewServiceSalesProps> = ({ saleId }) => {
  const { data, isLoading, isError } = useGetServiceSalesByIdQuery(saleId);
  const currentCurrency = useSelector(selectCurrentCurrency);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <p className="text-center text-red-500 py-4">
        Failed to load sale details
      </p>
    );
  }

  const sale = data.data;

  return (
    <div className="p-4">
        <div className="flex justify-end gap-3">
       <div>
         <Button
          onClick={() => {
            if (!sale) {
              toast.error("No sale data found to print");
              return;
            }
            ServiceSalesPrint([sale], currentCurrency);
          }}
        >
          <FaPrint />
          Print
        </Button>
       </div>

       <div>
         <Button
         variant={"red"}
          onClick={() => {
            if (!sale) {
              toast.error("No sale data found to print");
              return;
            }
            PdfServiceSales([sale], currentCurrency);
          }}
        >
          <FaFilePdf />
          PDF
        </Button>
       </div>

       <div>
         <Button
         variant={"red_outeline"}
          onClick={() => {
            if (!sale) {
              toast.error("No sale data found to print");
              return;
            }
            ServiceSalesChalanPrint([sale]);
          }}
        >
          <FaPrint />
          Chalan
        </Button>
       </div>
      </div>
      <hr className="my-2" />
      {/* Header */}
      <div className="space-y-6 border-b pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Invoice No: {sale.invoiceNo}
          </h2>
          <p className="text-sm text-gray-600">
            Date: {new Date(sale.date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customer & Account Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {sale.customer?.accountType}
          </p>
          <p>
            <span className="font-medium">Email:</span> {sale.customer?.email}
          </p>
          <p>
            <span className="font-medium">Mobile:</span>{" "}
            {sale.customer?.mobileNumber || "N/A"}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {sale.customer?.address || "N/A"}
          </p>
        </div>

        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Payment Account</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {sale.account?.accountType}
          </p>
          <p>
            <span className="font-medium">Company:</span>{" "}
            {sale.account?.companyName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {sale.account?.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {sale.account?.mobileNumber}
          </p>
        </div>
      </div>

      {/* Product List */}
         <div className="mt-6">
        <h3 className="font-semibold mb-2">Services</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-center">#</th>
                <th className="p-2 border text-left">Service Name</th>
                <th className="p-2 border text-left">Description</th>
                <th className="p-2 border text-right">Quantity</th>
                <th className="p-2 border text-right">Unit Price</th>
                <th className="p-2 border text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.serviceSaleProducts?.map((item: any, i: number) => {
                const service = item.service;
                
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border font-medium">
                      {service?.name || "Unknown Service"}
                    </td>
                    <td className="p-2 border">
                      {service?.description || "No description"}
                    </td>
                    <td className="p-2 border text-right">{item.quantity}</td>
                    <td className="p-2 border text-right">
                      {item.unitPrice?.toFixed(2)}
                    </td>
                    <td className="p-2 border text-right">
                      {item.subTotal?.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Empty state */}
              {(!sale.serviceSaleProducts || sale.serviceSaleProducts.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-4 border text-center text-gray-500">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-end mt-4">
        <div className="text-sm space-y-1 text-right">
          <p>
            VAT: {sale.vat?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
          <p>
            Discount: {sale.discount?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
          <p className="font-medium">
            Total: {sale.totalAmount?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
          <p className="text-green-600 font-medium">
            Paid: {sale.totalPaymentAmount?.toFixed(2)} {currentCurrency.symbol}{" "}
            ({currentCurrency.name})
          </p>
          {sale.dueAmount > 0 && (
            <p className="text-red-600 font-medium">
              Due: {sale.dueAmount?.toFixed(2)} {currentCurrency.symbol} (
              {currentCurrency.name})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewServiceSales;