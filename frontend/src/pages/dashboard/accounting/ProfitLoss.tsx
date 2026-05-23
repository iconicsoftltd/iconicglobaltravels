/* eslint-disable @typescript-eslint/no-unused-vars */
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useState } from "react";
import { FaPrint } from "react-icons/fa6";

const ProfitLoss = () => {
  const [, setReportType] = useState<string>("");


  return (
    <div className="p-6 min-h-screen bg-white space-y-6">
      {/* Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Heading className="text-[#5e48d8] font-semibold">
            Profit Loss A/C
          </Heading>

          <div className="flex items-center gap-4 mt-3 md:mt-0 font-semibold text-[16px]">
            <label className="flex items-center gap-2 cursor-pointer text-[#674cff]">
              <Checkbox onCheckedChange={() => setReportType("daily")} /> Daily
              Report
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#674cff]">
              <Checkbox onCheckedChange={() => setReportType("monthly")} />{" "}
              Monthly Report
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month */}
          <div>
            <label className="text-sm font-bold mb-1 block">
              Select Month {requiredStar}
            </label>
            <Select>
              <SelectTrigger className="w-full text-[#674cff]">
                <SelectValue placeholder="Select One" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan">January</SelectItem>
                <SelectItem value="feb">February</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div>
            <label className="text-sm font-bold mb-1 block">
              Select Year {requiredStar}
            </label>
            <Select>
              <SelectTrigger className="w-full text-[#674cff]">
                <SelectValue placeholder="Select One" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Search Button */}
          <div className="flex items-end">
            <Button className="hover:bg-[#6E56CF] bg-[#5c47b5] text-white rounded-none px-6">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Profit / Loss Section */}
      <div className="bg-white   space-y-4">
        <Heading className="text-[#5e48d8] font-semibold">
          Accounts Reports in :{" "}
          <span className="">January 2020</span>
        </Heading>
        <div className="py-3">
          <hr className="border-[2px] border-gray-200" />
        </div>

        {/* Profit/Loss Title */}
        <div className="mt-4 text-center">
          <Heading className="text-[#5e48d8] font-semibold text-center">
            Profit/Loss
          </Heading>
        </div>

        {/* Table */}
        <div className="mt-4  rounded-md overflow-hidden text-sm">
          {/* Header */}
          <div className="grid grid-cols-2 py-3 bg-[#f3f0ff] border-b border-[#e4e0ff] font-semibold text-[#3b3b3b]">
            <div className="px-3 py-2 ">Particulars</div>
            <div className="px-3 py-2 text-left">January 2020</div>
          </div>

          {/* Rows */}
          <div className="grid grid-cols-2 gap-1 py-1">
            <div className="px-3 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
              Revenue
            </div>
            <div className="px-3 py-2 col-span-1 bg-[#efedf7] text-gray-800">
              0.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 py-1">
            <div className="px-3 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
              Less: Cost Of Goods Sold
            </div>
            <div className="px-3 py-2 col-span-1 bg-[#efedf7] text-gray-800">
              0.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 py-1">
            <div className="px-3 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
              Gross Profit/ (Loss)
            </div>
            <div className="px-3 py-2 col-span-1 bg-[#efedf7] text-gray-800">
              0.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 py-1">
            <div className="px-3 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
              Operating Profit
            </div>
            <div className="px-3 py-2 col-span-1 bg-[#efedf7] text-gray-800">
              0.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 py-1">
            <div className="px-3 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
              Earning Before TAX (EBT)
            </div>
            <div className="px-3 py-2 col-span-1 bg-[#efedf7] text-gray-800">
              0.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 py-1">
            <div className="px-3 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
              Earning After TAX (EAT)
            </div>
            <div className="px-3 py-2 col-span-1 bg-[#efedf7] text-gray-800">
              0.00
            </div>
          </div>

          {/* Final single cell row */}
          <div className="grid grid-cols-2">
            <div className="border-r border-[#e4e0ff] bg-white"></div>
            <div className="px-3 py-2 bg-[#efedf7] text-gray-800 border-t border-[#e4e0ff]">
              0.00
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          className="hover:bg-[#6E56CF] bg-primary hover:text-white text-white  px-6 rounded-none"
        >
          <span>Print</span>
          <FaPrint />
        </Button>
        <Button
          variant="outline"
          className="border border-red-300 text-red-500 hover:bg-red-50 px-6 rounded-none"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfitLoss;
