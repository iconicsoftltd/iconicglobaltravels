import { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGetChartOfAccountsQuery } from "@/components/store/api/chartOfAccounts/chartOfAccountsApi";
;

interface ChartOfAccountsReportProps {
  branchId?: number;
}

const ChartOfAccountsReport: FC<ChartOfAccountsReportProps> = () => {
  const { data, isLoading, isError, refetch } = useGetChartOfAccountsQuery({});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Loading Chart of Accounts...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Failed to load chart of accounts.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.data?.length) {
    return <p className="text-center text-gray-500 mt-6">No data found.</p>;
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">Chart of Accounts</h2>

      {data.data.map((typeItem: any, typeIdx: number) => (
        <Card key={typeIdx} className="border shadow-sm">
          <CardHeader className="bg-gray-100 py-2.5 px-4">
            <CardTitle className="text-lg font-semibold text-primary">
              {typeItem.type}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            {typeItem.group?.length ? (
              <div className="space-y-4">
                {typeItem.group.map((group: any, groupIdx: number) => (
                  <div key={groupIdx} className="ml-4">
                    <h3 className="text-base font-medium text-gray-700 mb-1">
                      {group.name}
                    </h3>

                    {group.ledger?.length ? (
                      <div className="ml-6 space-y-2">
                        {group.ledger.map((ledger: any, ledgerIdx: number) => (
                          <Accordion
                            key={ledgerIdx}
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem
                              value={`ledger-${typeIdx}-${groupIdx}-${ledgerIdx}`}
                              className="border-none"
                            >
                              {/* Hide default arrow via CSS */}
                              <AccordionTrigger
                                className="relative text-sm font-semibold pt-1 text-gray-800 hover:text-primary hover:underline underline-offset-2 transition-colors duration-150 no-underline pb-0.5 pl-0
                                [&>svg]:hidden after:!hidden"
                                style={{
                                  justifyContent: "flex-start",
                                }}
                              >
                                {ledger.name}
                              </AccordionTrigger>

                              <AccordionContent className="pb-0 pl-4 pt-1.5">
                                {ledger.particular?.length ? (
                                  <ul className="list-decimal list-inside text-gray-600 text-sm space-y-0.5">
                                    {ledger.particular.map((p: any, pIdx: number) => (
                                      <li key={pIdx}>{p.name}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    No particular found
                                  </p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        No ledger found
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No group found</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChartOfAccountsReport;

