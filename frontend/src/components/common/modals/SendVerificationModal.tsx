import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SendVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  des: string;
  verifyEmail: string;
  setVerifyEmail: (value: string) => void;
  verifyLoading: boolean;
  onSend: () => void;
}

const SendVerificationModal = ({
  open,
  onOpenChange,
  title,
  des,
  verifyEmail,
  setVerifyEmail,
  verifyLoading,
  onSend,
}: SendVerificationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{des}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={verifyEmail}
            onChange={(e) => setVerifyEmail(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button disabled={verifyLoading} onClick={onSend} className="w-full">
            {verifyLoading ? "Sending..." : "Send Verification Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendVerificationModal;