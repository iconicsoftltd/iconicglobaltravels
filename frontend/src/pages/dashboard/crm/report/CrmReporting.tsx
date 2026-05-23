import CrmReportingCard from "@/components/dashboard/crm/CrmReportingCard";

const CrmReportingPage = () => {
    // Example data for select dropdowns
    const projectOptions = [
        { value: "project1", label: "Project Alpha" },
        { value: "project2", label: "Project Beta" },
    ];
    const leadStatusOptions = [
        { value: "new", label: "New Lead" },
        { value: "contacted", label: "Contacted" },
        { value: "qualified", label: "Qualified" },
    ];
    const leadSourceOptions = [
        { value: "web", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "event", label: "Event" },
    ];
    const userOptions = [
        { value: "user1", label: "Alice Smith" },
        { value: "user2", label: "Bob Johnson" },
    ];


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-screen">
            <CrmReportingCard
                title="Project Wise Report"
                selectLabel="Project Name"
                selectPlaceholder="Select One"
                selectOptions={projectOptions}
                link={"project-wise-report"}
            />

            <CrmReportingCard
                title="Lead Status Wise Report"
                selectLabel="Lead Status"
                selectPlaceholder="Select One"
                selectOptions={leadStatusOptions}
                link={"lead-status-wise-report"}
            />

            <CrmReportingCard
                title="Lead Source Wise Report"
                selectLabel="Lead Source"
                selectPlaceholder="Select One"
                selectOptions={leadSourceOptions}
                link={"lead-source-wise-report"}
            />

            <CrmReportingCard
                title="Assign User Wise Report"
                selectLabel="User Name"
                selectPlaceholder="Select One"
                selectOptions={userOptions}
                link={"assign-user-wise-report"}
            />
        </div>
    );
};

export default CrmReportingPage;