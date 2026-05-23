import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCustomTranslator } from "@/hooks/useCustomTranslator";
import { useState } from "react";

export const ModalUseExample = () => {
  const [modal, setModal] = useState(false);
  const { translate } = useCustomTranslator();
  return (
    <div>
      <Dialog open={modal} onOpenChange={(open: boolean) => setModal(open)}>
        <DialogTrigger asChild>
          <Button
            className="group relative px-10 h-7"
            variant="outline"
            size="icon"
          >
            <span className="">
              {translate("ট্রিপ তালিকার ", "Trip Sheet")}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogTitle className="text-lg md:text-2xl lg:text-3xl font-bold text-primary px-6 pt-3">
            Strip sheet
          </DialogTitle>
          <div className="border-t-2 border-primary py-4 px-6">
            hello motherfucker
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
