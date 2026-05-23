import React from "react";
import { AlertCircle } from "lucide-react";
import { useGetPurchaseReturnByIdQuery } from "@/components/store/api/purchase/purchaseReturnApi";
import HomeLoader from "@/components/loader/HomeLoader";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import toast from "react-hot-toast";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import PurchaseReturnPrint from "@/components/common/PrintPdf/PurchaseReturnPrint";
import PurchaseReturnChalanPrint from "@/components/common/PrintPdf/PurchaseReturnChalanPrint";
import PdfPurchaseReturn from "@/components/common/PrintPdf/PdfPurchaseReturn";

interface PurchaseReturnType {
  id: number;
  challanNo: string;
  date: string;
  purchaseId: number;
  totalAmount: number;
  totalPaymentAmount: number;
  supplier: {
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
  PurchaseReturnProduct: Array<{
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

interface PurchaseReturnDetailsProps {
  purchaseReturnData: PurchaseReturnType | null;
}

const ViewPurchaseReturn: React.FC<PurchaseReturnDetailsProps> = ({
  purchaseReturnData,
}) => {
  const purchaseReturnId = purchaseReturnData?.id
    ? Number(purchaseReturnData.id)
    : 0;
  const { data, isLoading: isLoadingPurchaseReturn } =
    useGetPurchaseReturnByIdQuery(purchaseReturnId, {
      skip: !purchaseReturnData?.id,
    });

  const currentCurrency = useSelector(selectCurrentCurrency);

  const purchaseReturn = data?.data;

  if (isLoadingPurchaseReturn) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HomeLoader />
        </div>
      </div>
    );
  }

  if (!purchaseReturn) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No purchase return data found.</p>
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
              if (!purchaseReturn) {
                toast.error("No purchase return data found to print");
                return;
              }
              PurchaseReturnPrint([purchaseReturn], currentCurrency);
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
              if (!purchaseReturn) {
                toast.error("No purchase return data found to print");
                return;
              }
              PdfPurchaseReturn([purchaseReturn], currentCurrency);
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
              if (!purchaseReturn) {
                toast.error("No purchase return data found to print");
                return;
              }
              PurchaseReturnChalanPrint([purchaseReturn], currentCurrency);
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
            Return Challan No: {purchaseReturn.challanNo}
          </h2>
          <p className="text-sm text-gray-600">
            Date: {new Date(purchaseReturn.date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Supplier & Account Info */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Supplier Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {purchaseReturn.supplier?.companyName ||
              purchaseReturn.supplier?.accountType}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {purchaseReturn.supplier?.email}
          </p>
          <p>
            <span className="font-medium">Mobile:</span>{" "}
            {purchaseReturn.supplier?.mobileNumber || "N/A"}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {purchaseReturn.supplier?.address || "N/A"}
          </p>
          <p>
            <span className="font-medium">Balance:</span>{" "}
            {purchaseReturn.supplier?.balance?.toFixed(2)}{" "}
            {currentCurrency.symbol}
          </p>
        </div>

        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Payment Account</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {purchaseReturn.account?.accountType}
          </p>
          <p>
            <span className="font-medium">Company:</span>{" "}
            {purchaseReturn.account?.companyName}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {purchaseReturn.account?.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {purchaseReturn.account?.mobileNumber}
          </p>
          <p>
            <span className="font-medium">Balance:</span>{" "}
            {purchaseReturn.account?.balance?.toFixed(2)}{" "}
            {currentCurrency.symbol}
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
                {/* <th className="p-2 border text-left">Category</th>
                <th className="p-2 border text-left">Subcategory</th> */}
                <th className="p-2 border text-left">Color</th>
                <th className="p-2 border text-left">Size</th>
                <th className="p-2 border text-left">Unit</th>
                <th className="p-2 border text-right">Return Qty</th>
                <th className="p-2 border text-right">Damaged Qty</th>
                <th className="p-2 border text-right">Unit Price</th>
                <th className="p-2 border text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {purchaseReturn.PurchaseReturnProduct?.map(
                (item: any, i: number) => {
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
                      {/* <td className="p-2 border">{product?.category?.name}</td>
                    <td className="p-2 border">{product?.subCategory?.name}</td> */}
                      <td className="p-2 border">{variation?.color?.name}</td>
                      <td className="p-2 border">{variation?.size?.name}</td>
                      <td className="p-2 border">{product?.unit?.name}</td>
                      <td className="p-2 border text-right">{item.quantity}</td>
                      <td className="p-2 border text-right text-red-600">
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
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-end mt-4">
        <div className="text-sm space-y-1 text-right">
          <p className="font-medium">
            Total Return Amount: ({currentCurrency.name}){" "}
            {purchaseReturn.totalAmount?.toFixed(2)}
          </p>
          <p className="text-green-600 font-medium">
            Refund Amount: ({currentCurrency.name}){" "}
            {purchaseReturn.totalPaymentAmount?.toFixed(2)}
          </p>
          {purchaseReturn.totalAmount !== purchaseReturn.totalPaymentAmount && (
            <p className="text-red-600 font-medium">
              Adjustment: ({currentCurrency.name}){" "}
              {(
                purchaseReturn.totalAmount - purchaseReturn.totalPaymentAmount
              )?.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseReturn;
