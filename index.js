// Import necessary modules and packages
const OpenAI = require("openai");
const express = require("express"); // Web framework for handling HTTP requests
const http = require("http");
const {
  startProdFeaturedListingCronJob,
  // Export for potential manual triggering or testing
} = require("./cron-jobs/expiredProductFeaturedListingJobs");

const {
  startBusFeaturedListingCronJob,
  // Export for potential manual triggering or testing.
} = require("./cron-jobs/expiredBusinessFeaturedListingJobs");

const {
  startServFeaturedListingCronJob,
  // Export for potential manual triggering or testing..
} = require("./cron-jobs/expiredServiceFeaturedlistingJobs");

const {
  startPropFeaturedListingCronJob,
  // Export for potential manual triggering or testing
} = require("./cron-jobs/expiredPropertyFeaturedListingJobs");

const cors = require("cors"); // To handle Cross-Origin Resource Sharing
const db = require("./config/db"); // Database configuration and connection setup
const multer = require("multer"); // For handling file uploads
require("dotenv").config(); // To load environment variables from a .env file
const path = require("path"); // For working with file and directory paths
const socket = require("./utils/socketServer");
const propertyRoutes = require("./routes/property/propertyRoute");
const listingRoute = require("./routes/listing/listingRoute");
const reportsRoute = require("./routes/reports/reportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const comprehensiveAnalyticsRoutes = require("./routes/comprehensiveAnalyticsRoutes");
// Import route modules
const usersRegistrationRoute = require("./routes/registration.route");
const ministryRoute = require("./routes/ministry/ministryRoute");
const agentsRoute = require("./routes/agents/agentRoute");
const auditLogRoute = require("./routes/auditlogRoutes");
const authLoginRoute = require("./routes/authRoutes.route");
const kycRoute = require("./routes/kycRoutes.route");
const profileRoute = require("./routes/profileRoute.route");
const rolesRoute = require("./routes/roles/rolesRoute");
const certRoute = require("./routes/certifications/certRoute");
const propertyServiceHubRoute = require("./routes/propertyServiceHub.route");
//products routes
const productsRoute = require("./routes/products/productRoute");
const businessRoute = require("./routes/business/businessRoute");
const serviceProviderRoute = require("./routes/serviceProviders/serviceProvidersRoute");
// Import middleware for authentication
const authToken = require("./middleware/jwtAuthMiddleware.js");
const notificationRoutes = require("./routes/notificationRoutes.route.js");
const { auth } = require("./service/imagekit/imagekit.service.js");

const serviceProviderServiceHubRoute = require("./routes/serviceProviderServiceHubRoute");
const submissionRoutes = require("./routes/submissionRoutes");
const transactionServiceHubRoute = require("./routes/transactionServiceHub/transactionServiceHubRoute");
const transactionRoute = require("./routes/transaction/transactionRoute");
const templatesRoute = require("./routes/templates/templatesRoute");
require("dotenv").config();

//const OpenAI = require("openai");

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey:
//     "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",
// });
// Establish a database connection and start the server
db().then(() => {
  const app = express();
  const server = http.createServer(app);

  startProdFeaturedListingCronJob();
  startBusFeaturedListingCronJob();
  startServFeaturedListingCronJob();
  startPropFeaturedListingCronJob();

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    //baseURL: "https://models.inference.ai.azure.com",
    // apiKey:
    //   "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",
    apiKey:
      "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",
  });

  // Initialize Socket.IOç
  socket.initSocket(server);

  // Middleware to parse JSON requests
  app.use(express.json());

  // Uncomment these lines to enable CORS options if needed
  // app.use(cors(corsOptions));
  app.use(cors());

  // Example route handled by server process
  app.get("/worker", (req, res) => {
    res.send("Hello, World! from server process");
  });
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/listings", listingRoute);
  app.use("/api/v1/roles", rolesRoute);
  //app.use("/api/v1/collection",collectionRoute)

  // Set up API routes with authentication where required
  app.use("/api/v1/users", usersRegistrationRoute);
  app.use("/api/v1/profile", profileRoute);
  app.use("/api/v1/properties", propertyRoutes);
  app.use("/api/v1/products", productsRoute);
  app.use("/api/v1/business", authToken.verifyAccessToken, businessRoute);
  app.use("/api/v1/serviceproviders", serviceProviderRoute);
  app.use("/api/v1/reports", reportsRoute);
  app.use("/api/v1/certifications", certRoute);
  app.use("/api/v1/ministry", ministryRoute);
  app.use("/api/v1/agents", agentsRoute);
  app.use("/api/v1/auditlogs", auditLogRoute);

  app.use("/api/v1/propertyservicehub", propertyServiceHubRoute);
  app.use("/api/v1/serviceproviderservicehub", serviceProviderServiceHubRoute);
  app.use("/api/v1/transactionservicehub", transactionServiceHubRoute);
  app.use("/api/v1/transactions", transactionRoute);
  app.use("/api/v1/templates", templatesRoute);
  app.use("/api/v1/submissions", submissionRoutes);
  app.use("/api/v1/analytics", analyticsRoutes);
  app.use("/api/v1/comprehensive-analytics", comprehensiveAnalyticsRoutes);

  // app.use(
  //   "/api/v1/serviceproviders",
  //   authToken.verifyAccessToken,
  //   serviceProviderRoute
  // );
  app.use("/api/v1/auth", authLoginRoute);
  app.use("/api/v1/kyc", kycRoute);

  // Heavy computation example to simulate load on the server
  app.get("/api/users/heavy", (req, res) => {
    let total = 0;
    for (let i = 0; i < 50_000_000; i++) {
      total++;
    }
    res.send("Total: " + total);
  });

  // Start the server on port 8000
  server.listen(8000, async () => {
    //     const completion = openai.chat.completions.create({
    //       model: "deepseek/deepseek-chat:free",
    //       //model: "DeepSeek-V3-0324",
    //       store: true,
    //       messages: [
    //         {
    //           role: "system",
    //           content:
    //             "You're a government asset reporting assistant. Generate a readable summary report from MongoDB documents.",
    //         },
    //         {
    //           role: "user",
    //           content: `generate me a comprehensive report , trend on this data. analyse every scenerio
    // : ${data}`,
    //         },
    //       ],
    //       //max_tokens: 1000,
    //     });

    // completion.then((result) => console.log(result.choices[0].message));
    console.log("Server is listening on port 8000");
  });
});
