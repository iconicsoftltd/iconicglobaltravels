import DashboardCard from "@/components/dashboard/adminHome/DashboardCard";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetdashboardStaticsQuery } from "@/components/store/api/home/dashboardStaticsApi";
import { useState } from "react";

const AdminHome = () => {
  const today = new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const { data, isFetching, isLoading } = useGetdashboardStaticsQuery({
    fromDate,
    toDate,
  });

  const {
    totalSales = 0,
    totalCOGS = 0,
    totalPurchase = 0,
    totalExpense = 0,
    totalCredit = 0,
    totalDebit = 0,
  } = data?.data || {};

  if (isLoading || isFetching) {
    return <HomeLoader />;
  }

  const availableBalance = totalDebit - totalCredit;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* 🔥 Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500">
            Track your business performance
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-white border rounded-xl px-3 py-2 shadow-sm">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm outline-none"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-sm outline-none"
          />
        </div>
      </div>

      {/* 🔥 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Total Sales */}
        <DashboardCard
          title="Total Sales"
          value={totalSales}
          icon={
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8H9.5a2.5 2.5 0 000 5H14a2.5 2.5 0 010 5H6"
              />
            </>
          }
        />

        {/* COGS */}
        <DashboardCard
          title="Cost of Goods Sold"
          value={totalCOGS}
          icon={
            <>
              <path d="M3 7l9-4 9 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 10h16v10H4z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 14h6" strokeLinecap="round" strokeLinejoin="round" />
            </>
          }
        />

        {/* Purchase */}
        <DashboardCard
          title="Total Purchase"
          value={totalPurchase}
          icon={
            <>
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
              <path d="M3 3h2l2.5 12h11L21 7H7" strokeLinecap="round" strokeLinejoin="round" />
            </>
          }
        />

        {/* Expense */}
        <DashboardCard
          title="Total Expense"
          value={totalExpense}
          icon={
            <>
              <path d="M3 7l6 6 4-4 8 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 17h7v-7" strokeLinecap="round" strokeLinejoin="round" />
            </>
          }
        />

        {/* Credit */}
        <DashboardCard
          title="Total Credit"
          value={totalCredit}
          icon={
            <>
              <path d="M12 19V5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </>
          }
        />

        {/* Debit */}
        <DashboardCard
          title="Total Debit"
          value={totalDebit}
          icon={
            <>
              <path d="M12 5v14" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </>
          }
        />

        {/* ⭐ Available Balance (Highlighted) */}
        <DashboardCard
          title="Available Balance"
          value={availableBalance}
          className="xl:col-span-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          icon={
            <>
              <path d="M4 7h16a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12h3" strokeLinecap="round" strokeLinejoin="round" />
            </>
          }
        />

      </div>
    </div>
  );
};

export default AdminHome;