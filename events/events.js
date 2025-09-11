const EventEmitter = require("events");

class TranNotificationEmitter extends EventEmitter {}

const trannotificationEmitter = new TranNotificationEmitter();

// Export only the emitter
module.exports = trannotificationEmitter;