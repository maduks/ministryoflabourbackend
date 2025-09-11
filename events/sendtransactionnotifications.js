const trannotificationEmitter = require("./events");
const { Notification } = require("../models/Notifications");

// Subscribe to the event
trannotificationEmitter.on("sendTransactionNotification", async (data) => {
  try {
    // Create a notification in the database
    await Notification.create(data);

    console.log("Notification Event Triggered!");
    console.log(`Title: ${data.title}`);
    console.log(`Message: ${data.message}`);
    console.log(`User ID: ${data.userId}`);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
});

// Export a service function to emit the event
const emitTransactionNotification = (data) => {
  trannotificationEmitter.emit("sendTransactionNotification", data);
};

module.exports = { emitTransactionNotification };
