import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, Phone, Mail, MapPin } from "lucide-react";

interface ParticularAccountType {
  id: number;
  branchId: number;
  ledgerId: number;
  type: "Debit" | "Credit";
  balance: number;
  openingBalance: number;
  openingBalanceType: "Debit" | "Credit";
  openingBalanceDate: string;
  companyName: string | null;
  accountType: string;
  mobileNumber: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  ledger: {
    id: number;
    branchId: number;
    groupAccountId: number;
    ledgerType: string;
    code: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    group: {
      id: number;
      branchId: number;
      account: string;
      accountType: string;
      code: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface ViewParticularAccountModalProps {
  particular: ParticularAccountType | null;
  onClose: () => void;
}

const ViewParticularAccountModal: React.FC<ViewParticularAccountModalProps> = ({
  particular,
  onClose,
}) => {
  if (!particular) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Ledger Name</Label>
          <p className="text-lg font-semibold">{particular.ledger.ledgerType}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Account Name</Label>
          <p className="text-lg font-semibold">{particular.accountType}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Opening Balance</Label>
          <p className="text-lg font-semibold">{formatCurrency(particular.openingBalance)}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Current Balance</Label>
          <p className="text-lg font-semibold">{formatCurrency(particular.balance)}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Ledger Code</Label>
          <p className="text-lg font-semibold">{particular.ledger.code}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Type</Label>
          <Badge
            variant={particular.type === "Debit" ? "destructive" : "default"}
            className={
              particular.type === "Debit"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }
          >
            {particular.type}
          </Badge>
        </div>

        
      </div>

      {/* Group Information */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-3 text-[#5e48d8]">Group Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Group Account</Label>
            <p>{particular.ledger.group.account}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Account Type</Label>
            <p>{particular.ledger.group.accountType}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Group Code</Label>
            <p>{particular.ledger.group.code}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(particular.companyName || particular.mobileNumber || particular.email || particular.address) && (
        <div className="border-t pt-4 ">
          <h4 className="text-lg font-semibold mb-3 text-[#5e48d8]">Contact Information</h4>
          <div className="space-y-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {particular.companyName && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span>{particular.companyName}</span>
              </div>
            )}
            {particular.mobileNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{particular.mobileNumber}</span>
              </div>
            )}
            {particular.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{particular.email}</span>
              </div>
            )}
            {particular.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="flex-1">{particular.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-3 text-[#5e48d8]">Dates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <Label className="text-sm font-medium text-gray-500">Opening Balance Date</Label>
              <p>{formatDate(particular.openingBalanceDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <Label className="text-sm font-medium text-gray-500">Created Date</Label>
              <p>{formatDate(particular.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end border-t pt-4">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
};

export default ViewParticularAccountModal;