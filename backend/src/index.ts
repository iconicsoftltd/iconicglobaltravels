import serverApp from "./app";
import config from "./config";

const server = async () => {
  serverApp.listen(config.port, () => {
    console.log("Accounts Server is Running on", config.port);
  });
};

server();
