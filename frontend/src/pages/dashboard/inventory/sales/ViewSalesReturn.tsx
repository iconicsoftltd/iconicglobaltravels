import React from "react";
import { AlertCircle } from "lucide-react";
import { useGetSalesReturnByIdQuery } from "@/components/store/api/sales/salesReturnApi";
import HomeLoader from "@/components/loader/HomeLoader";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import toast from "react-hot-toast";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import SalesReturnPrint from "@/components/common/PrintPdf/SalesReturnPrint";
import SalesReturnChalanPrint from "@/components/common/PrintPdf/SalesReturnChalanPrint";
import PdfSalesReturn from "@/components/common/PrintPdf/PdfSalesReturn";

interface SalesReturnType {
  id: number;
  invoiceNo: string;
  date: string;
  saleId: number;
  totalAmount: number;
  totalPaymentAmount: number;
  customer: {
    companyName: string;
    accountType: string;
    email: string;
    mobileNumber: string;
    address: string;
    balance: number;
  };
  account: {
    accountType: string;
    companyName: string;
    email: string;
    mobileNumber: string;
    balance: number;
  };
  SalesReturnProduct: Array<{
    id: number;
    quantity: number;
    damageQuantity: number;
    unitPrice: number;
    subTotal: number;
    productVariation: {
      color: { name: string };
      size: { name: string };
      product: {
        name: string;
        image: string;
        brand: { name: string };
        category: { name: string };
        subCategory: { name: string };
        unit: { name: string };
      };
    };
  }>;
}

interface SalesReturnDetailsProps {
  salesReturnData: SalesReturnType | null;
}

const ViewSalesReturn: React.FC<SalesReturnDetailsProps> = ({
  salesReturnData,
}) => {
  const salesReturnId = salesReturnData?.id ? Number(salesReturnData.id) : 0;
  const { data, isLoading: isLoadingSalesReturn } = useGetSalesReturnByIdQuery(
    salesReturnId,
    {
      skip: !salesReturnData?.id,
    }
  );

  const currentCurrency = useSelector(selectCurrentCurrency);

  const salesReturn = data?.data;

  if (isLoadingSalesReturn) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HomeLoader />
        </div>
      </div>
    );
  }

  if (!salesReturn) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sales return data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-end gap-3">
        <div>
          <Button
            onClick={() => {
              if (!salesReturn) {
                toast.error("No sales return data found to print");
                return;
              }
              SalesReturnPrint([salesReturn], currentCurrency);
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
              if (!salesReturn) {
                toast.error("No sales return data found to download");
                return;
              }
              PdfSalesReturn([salesReturn], currentCurrency);
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
              if (!salesReturn) {
                toast.error("No sales return data found to print");
                return;
              }
              SalesReturnChalanPrint([salesReturn], currentCurrency);
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
            Return Invoice No: {salesReturn.invoiceNo}
          </h2>
          <p className="text-sm text-gray-600">
            Date: {new Date(salesReturn.date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customer & Account Info */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {salesReturn.customer?.companyName ||
              salesReturn.customer?.accountType}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {salesReturn.customer?.email}
          </p>
          <p>
            <span className="font-medium">Mobile:</span>{" "}
            {salesReturn.customer?.mobileNumber || "N/A"}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {salesReturn.customer?.address || "N/A"}
          </p>
          <p>
            <span className="font-medium">Balance:</span>{" "}
            {salesReturn.customer?.balance?.toFixed(2)} {currentCurrency.symbol}
          </p>
        </div>

        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Payment Account</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {salesReturn.account?.accountType}
          </p>
          <p>
            <span className="font-medium">Company:</span>{" "}
            {salesReturn.account?.companyName}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {salesReturn.account?.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {salesReturn.account?.mobileNumber}
          </p>
          <p>
            <span className="font-medium">Balance:</span>{" "}
            {salesReturn.account?.balance?.toFixed(2)} {currentCurrency.symbol}
          </p>
        </div>
      </div>

      {/* Return Product List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Return Products</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-center">#</th>
                <th className="p-2 border text-left">Image</th>
                <th className="p-2 border text-left">Product</th>
                <th className="p-2 border text-left">Brand</th>
                <th className="p-2 border text-left">Unit</th>
                <th className="p-2 border text-right">Return Qty</th>
                <th className="p-2 border text-right">Damaged Qty</th>
                <th className="p-2 border text-right">Unit Price</th>
                <th className="p-2 border text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {salesReturn?.salesReturnProducts?.map((item: any, i: number) => {
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
                    <td className="p-2 border">{product?.unit?.name}</td>
                    <td className="p-2 border text-center">{item.quantity}</td>
                    <td className="p-2 border text-center text-red-600">
                      {item.damageQuantity}
                    </td>
                    <td className="p-2 border text-right">
                      ({currentCurrency.name}) {item.unitPrice?.toFixed(2)}
                    </td>
                    <td className="p-2 border text-right">
                      ({currentCurrency.name}) {item.subTotal?.toFixed(2)}
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
          <p className="font-medium">
            Total Return Amount: ({currentCurrency.name}){" "}
            {salesReturn.totalAmount?.toFixed(2)}
          </p>
          <p className="text-green-600 font-medium">
            Refund Amount: ({currentCurrency.name}){" "}
            {salesReturn.totalPaymentAmount?.toFixed(2)}
          </p>
          {salesReturn.totalAmount !== salesReturn.totalPaymentAmount && (
            <p className="text-red-600 font-medium">
              Adjustment: ({currentCurrency.name}){" "}
              {(
                salesReturn.totalAmount - salesReturn.totalPaymentAmount
              )?.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSalesReturn;
