import { jwtDecode } from "jwt-decode";
import { appConfiguration } from "../constant/appConfiguration";
import formatter from "./formatter";
import { shareWithCookies } from "./shareWithCookies";

interface IBranchInformationProps {
  id: number;
  branchName: string;
  branchLocation: string;
  due: number;
  address: string;
  phone: string;
  hotline: string;
  email: string;
  type: string;
}

export interface IAuthenticationProps {
  branchId: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  branchInfo: IBranchInformationProps;
}
export const shareAuthentication = (): IAuthenticationProps => {
  const token =
    shareWithCookies("get", `${appConfiguration.appCode}token`)?.toString() ||
    "";
  let authData;

  if (token) {
    authData = jwtDecode(token) as any;
  }

  return {
    branchId: authData?.branch || "",
    name: formatter({ type: "words", words: authData?.name }) || "",
    email: authData?.email || "",
    avatar: authData?.avatar || "",
    role: authData?.role?.toLowerCase() || "",
    branchInfo: authData?.branchInfo,
  };
};
