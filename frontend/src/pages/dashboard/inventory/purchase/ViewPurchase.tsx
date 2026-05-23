import React from "react";
import { AlertCircle } from "lucide-react";
import { useGetPurchaseByIdQuery } from "@/components/store/api/purchase/purchaseApi";
import HomeLoader from "@/components/loader/HomeLoader";
import { PurchaseDetailsProps } from "@/schemas/admin/inventory/purchase/purchaseSchema";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import toast from "react-hot-toast";
import PurchasePrint from "@/components/common/PrintPdf/PurchasePrint";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import PurchaseChalanPrint from "@/components/common/PrintPdf/PurchaseChalanPrint";
import PdfPurchase from "@/components/common/PrintPdf/PdfPurchase";

const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({ purchaseData }) => {
  const { data, isLoading: isLoadingPurchase } = useGetPurchaseByIdQuery(
    purchaseData.id ? Number(purchaseData.id) : 0,
    { skip: !purchaseData.id }
  );

  const currentCurrency = useSelector(selectCurrentCurrency);

  const purchase = data?.data;

  if (isLoadingPurchase) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HomeLoader />
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No purchase data found.</p>
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
              if (!purchase) {
                toast.error("No purchase data found to print");
                return;
              }
              PurchasePrint([purchase], currentCurrency);
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
              if (!purchase) {
                toast.error("No purchase data found to download");
                return;
              }
              PdfPurchase([purchase], currentCurrency);
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
              if (!purchase) {
                toast.error("No purchase data found to print");
                return;
              }
              PurchaseChalanPrint([purchase], currentCurrency);
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
            Challan No: {purchase.challanNo}
          </h2>
          <p className="text-sm text-gray-600">
            Date: {new Date(purchase.date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Supplier & Account Info */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Supplier Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {purchase.supplier?.companyName || purchase.supplier?.accountType}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {purchase.supplier?.email}
          </p>
          <p>
            <span className="font-medium">Mobile:</span>{" "}
            {purchase.supplier?.mobileNumber || "N/A"}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {purchase.supplier?.address || "N/A"}
          </p>
          <p>
            <span className="font-medium">Balance:</span>{" "}
            {purchase.supplier?.balance?.toFixed(2)} {currentCurrency.symbol}
          </p>
        </div>

        <div className="border p-3 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Payment Account</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {purchase.account?.accountType}
          </p>
          <p>
            <span className="font-medium">Company:</span>{" "}
            {purchase.account?.companyName}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {purchase.account?.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {purchase.account?.mobileNumber}
          </p>
          <p>
            <span className="font-medium">Balance:</span>{" "}
            {purchase.account?.balance?.toFixed(2)} {currentCurrency.symbol}
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
                <th className="p-2 border text-right">Damaged</th>
                <th className="p-2 border text-right">Unit Price</th>
                <th className="p-2 border text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {purchase.PurchaseProduct?.map((item: any, i: number) => {
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
                    <td className="p-2 border text-right text-red-600">
                      {item.damageQuantity}
                    </td>
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
          <p>VAT: {purchase.vat?.toFixed(2)}%</p>
          <p>
            Previous Due: {purchase.previousDue?.toFixed(2)}{" "}
            {currentCurrency.symbol} ({currentCurrency.name})
          </p>
          <p className="font-medium">
            Total: {purchase.totalAmount?.toFixed(2)} {currentCurrency.symbol} (
            {currentCurrency.name})
          </p>
          <p className="text-green-600 font-medium">
            Paid: {purchase.totalPaymentAmount?.toFixed(2)}{" "}
            {currentCurrency.symbol} ({currentCurrency.name})
          </p>
          {purchase.dueAmount > 0 && (
            <p className="text-red-600 font-medium">
              Due: {purchase.dueAmount?.toFixed(2)} {currentCurrency.symbol} (
              {currentCurrency.name})
            </p>
          )}
          <p className="font-bold border-t pt-1 mt-1">
            Total Outstanding:{" "}
            {(purchase.previousDue + purchase.dueAmount)?.toFixed(2)}{" "}
            {currentCurrency.symbol} ({currentCurrency.name})
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetails;
