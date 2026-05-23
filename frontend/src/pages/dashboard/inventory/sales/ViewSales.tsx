import React from "react";
import { Loader2 } from "lucide-react";
import { useGetSalesByIdQuery } from "@/components/store/api/sales/salesApi";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import SalesPrint from "@/components/common/PrintPdf/SalesPrint";
import toast from "react-hot-toast";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import SalesChalanPrint from "@/components/common/PrintPdf/SalesChalanPrint";
import PdfSales from "@/components/common/PrintPdf/PdfSales";

interface ViewSalesProps {
  saleId: number;
}

const ViewSales: React.FC<ViewSalesProps> = ({ saleId }) => {
  const { data, isLoading, isError } = useGetSalesByIdQuery(saleId);
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
            SalesPrint([sale], currentCurrency);
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
            PdfSales([sale], currentCurrency);
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
            SalesChalanPrint([sale]);
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
      <div>
        <h3 className="font-semibold mb-2">Products</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-center">#</th>
                <th className="p-2 border text-left">Image</th>
                <th className="p-2 border text-left">Product</th>
                <th className="p-2 border text-left">Brand</th>
                <th className="p-2 border text-left">Category</th>
                <th className="p-2 border text-left">Sub Category</th>
                <th className="p-2 border text-left">Color</th>
                <th className="p-2 border text-left">Size</th>
                <th className="p-2 border text-left">Unit</th>
                <th className="p-2 border text-right">Qty</th>
                <th className="p-2 border text-right">Unit Price</th>
                <th className="p-2 border text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.SaleProduct?.map((item: any, i: number) => {
                const variation = item.productVariation;
                const product = variation?.product;

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border">
                      {product?.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2 border">{product?.name}</td>
                    <td className="p-2 border">{product?.brand?.name}</td>
                    <td className="p-2 border">{product?.category?.name}</td>
                    <td className="p-2 border">{product?.subCategory?.name}</td>
                    <td className="p-2 border">{variation?.color?.name}</td>
                    <td className="p-2 border">{variation?.size?.name}</td>
                    <td className="p-2 border">{product?.unit?.name}</td>
                    <td className="p-2 border text-right">{item.quantity}</td>
                    <td className="p-2 border text-right">{item.unitPrice}</td>
                    <td className="p-2 border text-right">{item.subTotal}</td>
                  </tr>
                );
              })}
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

export default ViewSales;
