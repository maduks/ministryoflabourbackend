const express = require("express");
const router = express.Router();
const agentsController = require("../../controllers/Agents/agentsController");
router.post("/update/:agentId", agentsController.updateAgent);
router.get("/userid/:userId", agentsController.getAgentByUserId);
router.post("/create", agentsController.createAgent);
router.get("/ministry/:minId", agentsController.getMinistryAgents);
router.delete("/delete/:agentId/:userId", agentsController.deleteAgent);
module.exports = router;
