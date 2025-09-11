const { User } = require("../../models/User.js");
const agentService = require("../../service/agents/agentsService");
const auditLog = require("../../utils/AuditLog.js");
const passwordHash = require("../../utils/passwordHash.js");
class AgentsController {
  async createAgent(req, res) {
    try {
      const { agentData, userData } = req.body;
      const user = req.headers["user-id"];
      const role = await User.findById(user);

      userData.password = await passwordHash.hashPassword(userData.password);

      const agent = await agentService.createAgent(agentData, userData);
      console.log("role", role);
      console.log("agent", agent);

      if (!agent) {
        return res.status(422).json({ message: "Coundn't register an agent" });
      }
      if (user) {
        await auditLog.log(
          "CREATE",
          user,
          { name: role.role, id: user },
          "SUCCESS",
          `Created new agent id: ${agent[0].user} `,
          req.ip
        );
      } else {
        await auditLog.log(
          "CREATE",
          agent[0].user,
          { name: "USER", id: agent[0].user },
          "SUCCESS",
          `Created new agent id: ${agent[0].user} `,
          req.ip
        );
      }

      res.status(200).json({ message: "Agent regitered successfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async getAgentByUserId(req, res) {
    try {
      const { userId } = req.params;
      const agent = await agentService.getAgentByUserId(userId);
      if (!agent) {
        return res.status(400).json({ message: "Coundn't find an agent" });
      }
      console.log("agent", agent);
      res
        .status(200)
        .json({ message: "Agent retrieved successfully", data: agent });
    } catch (error) {
      console.log(error);
    }
  }
  async updateAgent(req, res) {
    try {
      const { agentId } = req.params;
      const { userId } = req.params;
      const user = req.headers["user-id"];
      const role = await User.findById(user);
      const agent = await agentService.updateAgent(agentId, req.body);
      console.log(agent);
      if (!agent || agent == "Agent not found") {
        return res.status(400).json({ message: "Coundn't update an agent" });
      }
      console.log("agent", agent);
      await auditLog.log(
        "UPDATE",
        user,
        { name: role.role, id: user },
        "Success",
        `Updated agent, id: ${agent.user} `,
        req.ip
      );
      res.status(200).json({ message: "Agent updated successfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async getMinistryAgents(req, res) {
    try {
      const { minId } = req.params;

      const agents = await agentService.getMinistryAgents(minId);
      if (agents == "Agents not found") {
        return res
          .status(422)
          .json({ message: "Could not fetch agents for ministry" });
      }
      console.log("AGGREGATION RESULT:", agents);
      res.status(200).json({ message: "Agents retrieved", data: agents });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAgent(req, res) {
    try {
      const { agentId } = req.params;
      const { userId } = req.params;
      const user = req.headers["user-id"];
      const role = await User.findById(user);
      const agent = await agentService.deleteAgent(agentId, userId);
      if (!agent) {
        return res.status(400).json({ message: "Coundn't delete an agent" });
      }
      await auditLog.log(
        "DELETE",
        user,
        { name: role.role, id: user },
        "SUCCESS",
        `Deleted agent, id: ${agent[0].user} `,
        req.ip
      );
      res.status(200).json({ message: "Agent deleted successfully" });
    } catch (error) {}
  }
}
module.exports = new AgentsController();
