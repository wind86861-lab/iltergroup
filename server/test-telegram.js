require("dotenv").config();
console.log("TOKEN:", process.env.TELEGRAM_BOT_TOKEN ? "SET" : "MISSING");
console.log("CHAT:", process.env.TELEGRAM_CHAT_ID ? "SET" : "MISSING");
const { notifyOrder } = require("./dist/lib/telegram");
notifyOrder({id:99,customer:"Debug",phone:"+999",total:1000,createdAt:new Date()})
  .then(() => console.log("OK"))
  .catch(e => console.log("ERR:", e.message));
