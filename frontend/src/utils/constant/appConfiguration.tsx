interface IConfigurationProps {
  appName: string;
  appCode: string;
  baseUrl: string;
  baseUrl2: string;
  databaseResetAPI: string;
  favicon: string;
  logo: string;
  URL: string;
  progressMessage: string;
  version: string;
  invoiceBanner: string;
  userIcon: string;
  loginBg:string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

const version = "V1.0.0";

export const appConfiguration: IConfigurationProps = {
  appName: "Accounts",
  appCode: "__accounts_beta__",
  baseUrl: import.meta.env.VITE_API_URL,
  baseUrl2: import.meta.env.VITE_API_URL,

  // baseUrl: "https://api.iconichishab.com/api/v1",
  // baseUrl2: "https://api.iconichishab.com/api/v1",

  databaseResetAPI: "null",
  URL: "https://iconicunitygroup.com/",
  favicon: "/tech.png",
  invoiceBanner: "/invoice-bg.jpg",
  logo: "/tech.png",
  userIcon: "/userIcon.png",
  loginBg:"/login-bg.webp",
  address: "Level, J-16, Lily Pond Center, 3 RK Mission Road, Ittefeq mor, Motijheel, Dhaka-1203",
  email: "iconicunityltd@gmail.com",
  phone: "+880 1824800900",
  website: "https://iconicunitygroup.com/",
  version,
  progressMessage:
    "Thank you for your interest! 🚀 We're currently working on implementing this feature. Stay tuned, as we'll be activating it very soon!",
};
