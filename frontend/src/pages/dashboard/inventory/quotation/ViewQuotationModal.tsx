import React from "react";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useGetQuotationsByIdQuery } from "@/components/store/api/quotation/quotationApi";
import QuotationPrint from "@/components/common/PrintPdf/QuotationPrint";
import PdfQuotation from "@/components/common/PrintPdf/PdfQuotation";
import QuotationChalanPrint from "@/components/common/PrintPdf/QuotationChalanPrint";

interface ViewQuotationModalProps {
  quotationId: number;
}

const ViewQuotationModal: React.FC<ViewQuotationModalProps> = ({ quotationId }) => {
  const { data, isLoading, isError } = useGetQuotationsByIdQuery(quotationId);
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
        Failed to load quotation details
      </p>
    );
  }

  const quotation = data.data;

  const handlePrint = () => {
    if (!quotation) {
      toast.error("No quotation data found to print");
      return;
    }
    QuotationPrint([quotation], currentCurrency);
  };

  const handleChalanPrint = () => {
    if (!quotation) {
      toast.error("No quotation data found to print");
      return;
    }
    QuotationChalanPrint([quotation]);
  };

  const handlePdf = () => {
    if (!quotation) {
      toast.error("No quotation data found to generate PDF");
      return;
    }
    PdfQuotation([quotation], currentCurrency);
    toast.success("PDF functionality to be implemented");
  };

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <div>
          <Button onClick={handlePrint}>
            <FaPrint />
            Print
          </Button>
        </div>

        <div>
          <Button variant={"red"} onClick={handlePdf}>
            <FaFilePdf />
            PDF
          </Button>
        </div>

         <div>
          <Button variant={"red_outeline"} onClick={handleChalanPrint}>
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
            Quotation No: {quotation.invoiceNo}
          </h2>
          <p className="text-sm text-gray-600">
            Date: {new Date(quotation.date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid sm:grid-cols-1 gap-4 mt-4">
        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {quotation.customer?.accountType || "N/A"}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {quotation.customer?.email || "N/A"}
          </p>
          <p>
            <span className="font-medium">Mobile:</span>{" "}
            {quotation.customer?.mobileNumber || "N/A"}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {quotation.customer?.address || "N/A"}
          </p>
          <p>
            <span className="font-medium">Company:</span>{" "}
            {quotation.customer?.companyName || "N/A"}
          </p>
        </div>
      </div>

      {/* Product List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Products</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-center">SL</th>
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
              {quotation.quotationProducts?.map((item: any, i: number) => {
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
                    <td className="p-2 border">{product?.name || "N/A"}</td>
                    <td className="p-2 border">{product?.brand?.name || "N/A"}</td>
                    <td className="p-2 border">{product?.category?.name || "N/A"}</td>
                    <td className="p-2 border">{product?.subCategory?.name || "N/A"}</td>
                    <td className="p-2 border">{variation?.color?.name || "N/A"}</td>
                    <td className="p-2 border">{variation?.size?.name || "N/A"}</td>
                    <td className="p-2 border">{product?.unit?.name || "N/A"}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-end mt-4">
        <div className="text-sm space-y-1 text-right">
          <p>
            VAT: {quotation.vat?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
          <p>
            Discount: {quotation.discount?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
          {quotation.tc > 0 && (
            <p>
              Terms & Conditions: {quotation.tc?.toFixed(2)} {currentCurrency.symbol} (
              {currentCurrency.name})
            </p>
          )}
          <p className="font-medium text-lg">
            Total: {quotation.totalAmount?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotationModal;