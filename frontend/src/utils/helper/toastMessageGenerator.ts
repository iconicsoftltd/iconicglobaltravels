

type MessageType =
  | "add"
  | "update"
  | "delete"
  | "login"
  | "cancel"
  | "confirm"
  | "return"
  | "approve"
  | "reject"
  | "send"
  | "receive"
  | "archive";

export const toastMessageGenerator = (
  messageType: MessageType,
  title: string
): string => {
  const formattedTitle = title.toLowerCase();

  const baseMessage = `The '${title}' has been successfully`;
  const checkListMessage = `Please check the '${formattedTitle}' list to ensure the`;

  switch (messageType) {
    case "add":
      return `A new '${title}' has been successfully added to the system. ${checkListMessage} addition was successful.`;
    case "update":
      return `${baseMessage} updated. ${checkListMessage} update was successful.`;
    case "delete":
      return `${baseMessage} removed from the system. ${checkListMessage} deletion was successful.`;
    case "login":
      return `Welcome To Techelement IT.`;
    case "cancel":
      return `${baseMessage} canceled. ${checkListMessage} cancelation was successful.`;
    case "confirm":
      return `${baseMessage} confirmed. ${checkListMessage} confirmation was successful.`;
    case "return":
      return `${baseMessage} returned. ${checkListMessage} return was successful.`;
    case "approve":
      return `${baseMessage} approved. ${checkListMessage} approval was successful.`;
    case "reject":
      return `${baseMessage} rejected. ${checkListMessage} rejection was successful.`;
    case "send":
      return `${baseMessage} sent. ${checkListMessage} sending was successful.`;
    case "receive":
      return `${baseMessage} received. ${checkListMessage} reception was successful.`;
    case "archive":
      return `${baseMessage} archived. ${checkListMessage} archiving was successful.`;
    default:
      return `Unknown message type: ${messageType}`;
  }
};
