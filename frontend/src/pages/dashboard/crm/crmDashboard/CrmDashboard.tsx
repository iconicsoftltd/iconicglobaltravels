import { Button } from "@/components/ui/button";
import {
  Phone,
  Clock,
  FileText,
  LucideIcon,
  CalendarCheck,
} from "lucide-react";
import Heading from "@/components/typography/Heading";
import KpiCard from "@/components/dashboard/crm/KpiCard";
import { Link } from "react-router-dom";

// --- Custom Quick Access Button Component (using composite icons) ---
interface QuickAccessButtonProps {
  icon: LucideIcon; // Using LucideIcon type for flexibility
  label: string;
  href: string;
}

function QuickAccessButton({
  icon: Icon,
  label,
  href,
}: QuickAccessButtonProps) {
  return (
    <Button
      variant="ghost"
      className="flex-1 h-[99px]  flex flex-col items-center justify-center  transition-all p-2 border border-transparent hover:bg-primary-50 hover:shadow-lg"
      asChild
    >
      <Link
        to={href}
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <span className="border border-primary rounded-full p-1">
          <span className="bg-primary rounded-full w-[35px] h-[35px] flex items-center justify-center">
            <Icon className="w-full h-full inline-block text-white" />
          </span>
        </span>
        <span className="text-sm font-bold text-primary">{label}</span>
      </Link>
    </Button>
  );
}

// --- Main Dashboard Page ---
const CrmDashboardPage = () => {
  return (
    <div className=" mx-auto space-y-6">
      <div className="bg-white py-6">
        <Heading
          children={"CRM Dashboard"}
          className="mb-6 border-b px-6 pb-6 border-primary-100"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-12 px-6">
          <KpiCard
            title="Total Leads"
            value={155}
            change="+14% Inc"
            percentage={74}
            isPositive={true}
            color={"#247E27"}
          />
          <KpiCard
            title="Today's Leads"
            value={15}
            change="-14% Inc"
            percentage={44}
            isPositive={false}
            color={"#DC3545"}
          />
          <KpiCard
            title="Today's Meeting"
            value={5}
            change="+74% Inc"
            percentage={74}
            isPositive={true}
            color={"#247E27"}
          />
          <KpiCard
            title="Today's Followup"
            value={25}
            change="+74% Inc"
            percentage={74}
            isPositive={true}
            color={"#247E27"}
          />
        </div>
      </div>

      <div className="bg-white py-6">
        <Heading
          children="Quick Access"
          className="mb-6 border-b px-6 pb-6 border-primary-100"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          <QuickAccessButton
            icon={Phone}
            label="Today's Call"
            href="/todays-call"
          />
          <QuickAccessButton
            icon={Clock}
            label="Pending Call"
            href="/pending-call"
          />
          <QuickAccessButton
            icon={CalendarCheck}
            label="Todays Follow-up"
            href="/todays-follow-up"
          />
          <QuickAccessButton
            icon={FileText}
            label="CRM Reports"
            href="/crm-reporting"
          />
        </div>
      </div>
    </div>
  );
};

export default CrmDashboardPage;
