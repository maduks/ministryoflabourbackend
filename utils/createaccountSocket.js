const socketIO = require("socket.io");

let io; // This will hold the socket instance

const initSocket = (server) => {
  io = socketIO(server, { // Remove 'const' here to assign to the outer 'io'
    cors: {
      origin: "*", // Allow all origins or specify your frontend's origin
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'], // Allow both WebSocket and polling transports
    },
    allowEIO3: true, // Allow compatibility with older clients if needed
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Listen for any custom events here if needed
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};

const sendCreateAccount = (userId) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  console.log("called: socketIO.createAccount", userId);
  // Emit the balance update to the specified wallet's connected client(s)
  io.emit("createAccount", { userId });
};


module.exports = { initSocket, sendCreateAccount };
