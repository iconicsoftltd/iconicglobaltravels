import Heading from "@/components/typography/Heading";
import Paragraph from "@/components/typography/Paragraph";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cloneElement } from "react";
import { LuMail, LuPencil, LuPhoneCall, LuTrash } from "react-icons/lu";


interface CrmDetails {
    name: string;
    profession: string;
    project: string;
    date: string;
    leadStatus: string;
    leadOwner: string;
    leadSource: string;
    nextCallDate: string;
    phone: string;
    email: string;
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-primary text-[14px] font-semibold">{label}</span>
        <span className="text-black font-semibold text-[14px]">{value}</span>
    </div>
);

const ContactItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        {/* Icon container: light purple background, rounded corners */}
        <div className="p-3 bg-primary-50 border border-primary-100 rounded-md flex items-center justify-center flex-shrink-0">
            {/* The icon itself, styled with the darker purple/indigo color */}
            {cloneElement(icon as React.ReactElement, { className: 'h-4 w-4 text-indigo-700' })}
        </div>

        {/* Text container for the label and value */}
        <div className="flex flex-col space-y-1">
            <p className="text-[14px] font-semibold text-[#453985]">
                {label}
            </p>

            <p className="text-[12px] font-semibold text-primary">
                {value}
            </p>
        </div>
    </div>
);

const CustomerInfoCard = () => {
    // --- Mock Data ---
    const details: CrmDetails = {
        name: "Md. Rasel",
        profession: "Govt. Service",
        project: "RBL Head Office",
        date: "05-10-2024 | 12:17 PM",
        leadStatus: "Land Owner",
        leadOwner: "Self",
        leadSource: "Self",
        nextCallDate: "05-10-2024",
        phone: "01645845244",
        email: "ruhulamin854@gmail.com",
    };

    return (
        <Card className="shadow-lg border-none rounded-none w-full bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-primary-50">
                <Heading children="CRM Details" />
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-gray-600 hover:text-blue-500">
                        <LuPencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-gray-600 hover:text-red-500">
                        <LuTrash className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex items-center gap-4 py-[30px] px-[24px]">
                    <Avatar className="h-[125px] w-[125px] flex-shrink-0 rounded-md">
                        {/* Placeholder avatar, similar to the image */}
                        <AvatarFallback className="text-[70px] bg-primary rounded-md text-white flex items-center justify-center h-full w-full">
                            {details.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        {/* Name is bold and large, similar to the image's "Md. Rasel" */}
                        <h3 className="text-xl font-extrabold mb-2"></h3>
                        <Heading children={details.name} size="20" className="font-semibold text-[#0A0A0A]" />

                        <Paragraph size={"sm"} weight={"semibold"}>
                            <span className="font-semibold text-[14px] text-primary mr-[14px]">Profession :</span> {details.profession}
                        </Paragraph>
                        <Paragraph size={"sm"} weight={"semibold"}>
                            <span className="font-semibold text-[14px] text-primary mr-[14px]">Project :</span> {details.project}
                        </Paragraph>
                        <Paragraph size={"sm"} weight={"semibold"}>
                            <span className="font-semibold text-[14px] text-primary mr-[14px]">Date :</span> {details.date}
                        </Paragraph>
                    </div>
                </div>

                <div className="">
                    {/* Basic Information Section */}
                    <Heading children="Basic Information" size="14" className="text-[14px] font-semibold text-[#0A0A0A] bg-primary-50 px-6 py-4 border border-primary-100" />
                    <div className="space-y-[30px] py-[30px] px-6">
                        <InfoItem label="Lead Status" value={details.leadStatus} />
                        <InfoItem label="Lead Source" value={details.leadSource} />
                        <InfoItem label="Next Call Date" value={details.nextCallDate} />
                    </div>

                    {/* Primary Contact Info Section */}
                    <Heading children="Primary Contact Info" size="14" className="text-[14px] font-semibold text-[#0A0A0A] bg-primary-50 px-6 py-4 border border-primary-100" />
                    <div className="space-y-6 py-[30px] px-6">
                        <ContactItem icon={<LuPhoneCall className="h-5 w-5 text-[#453985]" />} value={details.phone} label={"Phone Number"} />
                        <ContactItem icon={<LuMail className="h-5 w-5 text-[#453985]" />} value={details.email} label={"Email Address"} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};

export default CustomerInfoCard