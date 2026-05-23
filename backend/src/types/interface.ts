export interface IUploadFile {
    allowedFileTypes?: string[];
    maxFileSize?: number;
    uploadPath?: string;
    errorMessage?: string;
  }
   export interface ISendMail {
    email: string;
    subject: string;
    message: string;
    messageType?: "text" | "html";
    attachment?: any;
    returnPdf?: any;
   }