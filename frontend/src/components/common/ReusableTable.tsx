import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react"; // Assuming lucide-react is available
import { useEffect, useMemo, useState } from "react";
import ReusablePagination from "./ReusablePagination";

/** * Custom hook for responsive breakpoints
 */
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query, matches]);

    return matches;
}

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    currentPage?: number;
    itemsPerPage?: number;
    totalItems?: number;
    setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
    columnPriority?: Record<string, number>;
    visibleColumnsCount?: {
        smMobile?: number;
        mobile?: number;
        tablet?: number;
    };
    isLoading?: boolean;
}

export function ReusableTable<TData>({
    columns,
    data,
    columnPriority = {},
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    visibleColumnsCount = { smMobile: 2, mobile: 3, tablet: 5 },
    isLoading = false,
}: DataTableProps<TData>) {
    const isTablet = useMediaQuery("(max-width: 1024px)");
    const isMobile = useMediaQuery("(max-width: 640px)");
    const isSmMobile = useMediaQuery("(max-width: 425px)");

    // Optimize: Memoize visible columns logic
    const visibleColumns = useMemo(() => {
        return columns.filter((col, index) => {
            const key = "accessorKey" in col 
                ? (col.accessorKey as string) 
                : (col.id as string) ?? "";

            const priority = columnPriority[key] ?? index + 1;

            if (isSmMobile) return priority <= (visibleColumnsCount.smMobile ?? 2);
            if (isMobile) return priority <= (visibleColumnsCount.mobile ?? 3);
            if (isTablet) return priority <= (visibleColumnsCount.tablet ?? 5);
            return true;
        });
    }, [columns, columnPriority, isTablet, isMobile, isSmMobile, visibleColumnsCount]);

    const table = useReactTable({
        data,
        columns: visibleColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="relative overflow-x-auto">
                <Table className="w-full border-collapse">
                    <TableHeader className="bg-primary-500 dark:bg-zinc-900/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-zinc-200 dark:border-zinc-800">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-12 px-4 text-center align-middle text-white dark:text-zinc-400 text-[13px] font-bold uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            // Optimized: Modern loading skeleton rows
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={visibleColumns.length} className="p-4">
                                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="p-4 align-middle text-center text-sm text-zinc-700 dark:text-zinc-300 font-medium"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            // Beautiful Empty State
                            <TableRow>
                                <TableCell colSpan={visibleColumns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-400">
                                        <Inbox className="w-10 h-10 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No records found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    {/* Footer Logic preserved exactly */}
                    {(() => {
                        const footerGroups = table.getFooterGroups();
                        const hasFooterContent = footerGroups.some(group =>
                            group.headers.some(header => !!header.column.columnDef.footer)
                        );

                        return hasFooterContent ? (
                            <TableFooter className="bg-zinc-100 dark:bg-zinc-900/50 font-bold border-t border-zinc-200 dark:border-zinc-800">
                                {footerGroups.map((footerGroup) => (
                                    <TableRow key={footerGroup.id}>
                                        {footerGroup.headers.map((footer) => (
                                            <TableCell className="p-2 text-center" key={footer.id}>
                                                {flexRender(footer.column.columnDef.footer, footer.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableFooter>
                        ) : null;
                    })()}
                </Table>
            </div>

            {/* Pagination: Modernized spacing and typography */}
            {totalItems && itemsPerPage && (currentPage ?? -1) > 0 && setCurrentPage ? (
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        Showing <span className="text-zinc-900 dark:text-white">{(currentPage! - 1) * itemsPerPage + 1}</span> to{" "}
                        <span className="text-zinc-900 dark:text-white">{Math.min(currentPage! * itemsPerPage, totalItems)}</span> of{" "}
                        <span className="text-zinc-900 dark:text-white">{totalItems}</span> results
                    </p>
                    <div className="shrink-0">
                        <ReusablePagination
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={Number(currentPage)}
                            onPageChange={setCurrentPage}
                            maxVisiblePages={3}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}