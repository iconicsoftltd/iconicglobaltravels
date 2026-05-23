import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Heading from "@/components/typography/Heading";
import ManageCallTabContent from "@/components/dashboard/crm/ManageCallTabContent";
import CustomerInfoCard from "@/components/dashboard/crm/CustomerInfoCard";
import ManageMittingTabContent from "@/components/dashboard/crm/ManageMittingTabContent";
import AttachmentTabContent from "@/components/dashboard/crm/AttachmentTabContent";
import ManageTaskTabContent from "@/components/dashboard/crm/ManageTaskTabContent";
import TodaysFollowupTabContent from "@/components/dashboard/crm/TodaysFollowupTabContent";

const PendingCallViewPage = () => {

    return (
        <div className="min-h-[80vh] flex flex-col xl:flex-row gap-6 h-full items-stretch">
            <div className="xl:w-[382px] h-full">
                <CustomerInfoCard />
            </div>

            <div className=" xl:w-[calc(100%-406px)] h-full">
                <Tabs defaultValue="manage-call" className="w-full h-full bg-white  shadow-lg border ">
                    <TabsList className="flex justify-between w-full  overflow-auto h-[58px] xl:h-[66px] 2xl:h-[76px] bg-white rounded-none shadow-md p-0">
                        <TabsTrigger value="manage-call" className="flex-1 rounded-none min-w-max h-full data-[state=active]:shadow-none  border-b-4 border-transparent data-[state=active]:border-primary">
                            <Heading children="Manage Call" size="20" className="text-black lg:text-[14px] xl:text-[16px] 2xl:text-[20px] " />
                        </TabsTrigger>
                        <TabsTrigger value="manage-meeting" className="flex-1 rounded-none min-w-max h-full data-[state=active]:shadow-none  border-b-4 border-transparent data-[state=active]:border-primary">
                            <Heading children="Manage Meeting" size="20" className="text-black lg:text-[14px] xl:text-[16px] 2xl:text-[20px] " />
                        </TabsTrigger>
                        <TabsTrigger value="attachment" className="flex-1 rounded-none min-w-max h-full data-[state=active]:shadow-none  border-b-4 border-transparent data-[state=active]:border-primary">
                            <Heading children="Attachment" size="20" className="text-black lg:text-[14px] xl:text-[16px] 2xl:text-[20px] " />
                        </TabsTrigger>
                        <TabsTrigger value="manage-task" className="flex-1 rounded-none min-w-max h-full data-[state=active]:shadow-none  border-b-4 border-transparent data-[state=active]:border-primary">
                            <Heading children="Manage Task" size="20" className="text-black lg:text-[14px] xl:text-[16px] 2xl:text-[20px] " />
                        </TabsTrigger>
                        <TabsTrigger value="today-follow-up" className="flex-1 rounded-none min-w-max h-full data-[state=active]:shadow-none  border-b-4 border-transparent data-[state=active]:border-primary">
                            <Heading children="Today's Follow-up" size="20" className="text-black lg:text-[14px] xl:text-[16px] 2xl:text-[20px] " />
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manage-call" className="mt-0 flex-grow">
                        <h4 className="text-[14px] text-[#0A0A0A] font-semibold py-[16px] px-4 bg-primary-50 border border-primary-100">Manage Call</h4>
                        <ManageCallTabContent />
                    </TabsContent>

                    {/* Placeholder Tab Contents */}
                    <TabsContent value="manage-meeting" className="mt-0 flex-grow">
                        <h4 className="text-[14px] text-[#0A0A0A] font-semibold py-[16px] px-4 bg-primary-50 border border-primary-100">Manage Metting</h4>
                        <ManageMittingTabContent />
                    </TabsContent>
                    <TabsContent value="attachment" className="mt-0 flex-grow">
                        <h4 className="text-[14px] text-[#0A0A0A] font-semibold py-[16px] px-4 bg-primary-50 border border-primary-100">Attachment</h4>
                        <AttachmentTabContent />
                    </TabsContent>
                    <TabsContent value="manage-task" className="mt-0 flex-grow">
                        <h4 className="text-[14px] text-[#0A0A0A] font-semibold py-[16px] px-4 bg-primary-50 border border-primary-100">Manage Task</h4>
                        <ManageTaskTabContent />
                    </TabsContent>
                    <TabsContent value="today-follow-up" className="mt-0 flex-grow">
                        <h4 className="text-[14px] text-[#0A0A0A] font-semibold py-[16px] px-4 bg-primary-50 border border-primary-100">Today's Follow-up</h4>
                        <TodaysFollowupTabContent />
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
};

export default PendingCallViewPage;