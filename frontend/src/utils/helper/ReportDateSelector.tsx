import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ParticularAccountType } from "@/pages/dashboard/accounting/PerticularAccountList";
import { useGetAllParticularQuery } from "@/components/store/api/particularAccount/particularAccountApi";
import ReusableDatePicker from "@/components/common/ReusableDatePicker";

interface ReportDateSelectorProps {
  reportType: string;
  setReportType: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  particular?: ParticularAccountType; // NEW
  setParticular?: (value: ParticularAccountType) => void; // NEW
  showParticular?: boolean; // NEW (optional)
  onSearch?: (payload: {
    reportType: string;
    fromDate: string;
    toDate: string;
    month: string;
    year: string;
    particular?: ParticularAccountType; // NEW
  }) => void;
}

export default function ReportDateSelector({
  reportType,
  setReportType,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  particular, // NEW
  setParticular, // NEW
  showParticular = false, // NEW (optional)
  onSearch,
}: ReportDateSelectorProps) {
  // 🔥 handle search click
  const handleSearch = () => {
    const payload = {
      reportType,
      fromDate,
      toDate,
      month: selectedMonth,
      year: selectedYear,
      ...(showParticular && { particular }), // ADD ONLY IF enabled
    };

    if (onSearch) onSearch(payload);
  };

  const { data: particularData } = useGetAllParticularQuery({
    size: 3000,
  });
console.log("particulars",particularData?.data);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Report Type Dropdown */}
      <Select value={reportType} onValueChange={setReportType}>
        <SelectTrigger className="w-[150px] h-[42px]">
          <SelectValue placeholder="Report Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      {/* ===== Daily Range ===== */}
      {reportType === "daily" && (
        <div className="flex items-center gap-2">
          <ReusableDatePicker showLabel={false} date={fromDate} setDate={setFromDate} />
          <ReusableDatePicker showLabel={false} date={toDate} setDate={setToDate} />
        </div>
      )}

      {/* ===== Monthly Picker ===== */}
      {reportType === "monthly" && (
        <>
          {/* Month Select */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px] h-[42px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const m = (i + 1).toString().padStart(2, "0");
                const monthName = dayjs(`${m}`, "MM").format("MMMM");
                return (
                  <SelectItem key={m} value={m}>
                    {monthName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Year Select */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px] h-[42px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 8 }, (_, i) => {
                const y = 2022 + i;
                return (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </>
      )}

      {/* ===== Yearly Picker ===== */}
      {reportType === "yearly" && (
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[150px] h-[42px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 8 }, (_, i) => {
              const y = 2022 + i;
              return (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {/* ===== Particular Picker (Optional) ===== */}
      {showParticular && (
        <Select
          value={particular?.id ? String(particular.id) : ""}
          onValueChange={(value) => {
           if (setParticular && particularData?.data) {
    const found = particularData.data.find(
      (item) => String(item.id) === value
    );
    if (found) setParticular(found); // ✅ পুরো object
  }
          }}
        >
          <SelectTrigger className="w-[180px] h-[42px]">
            <SelectValue placeholder="Select Particular" />
          </SelectTrigger>

          <SelectContent>
            {particularData?.data.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.accountType} ({item?.ledger?.ledgerType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* ===== Search Button ===== */}
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
