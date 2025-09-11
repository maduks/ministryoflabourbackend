const { Agent } = require("../../models/Agent");
const { Ministries } = require("../../models/Ministry");
const { User } = require("../../models/User");
const mongoose = require("mongoose");
class AgentsService {
  async createAgent(agentData, userData) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const user = await User.create([userData], { session });
      agentData.user = user[0]._id;
      const agent = await Agent.create([agentData], { session });

      await Ministries.findByIdAndUpdate(
        agentData.ministry,
        { $inc: { agentCount: 1 } },
        { new: true, session } // returns the updated document
      );
      await session.commitTransaction();
      return agent;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        console.log("Transaction aborted." + error);
      }
    } finally {
      if (session) {
        session.endSession();
        console.log("Session ended.");
      }
    }
  }

  async getAgentByUserId(userid) {
    try {
      const agent = await Agent.findOne({ user: userid });
      if (!agent) {
        return "Agent not found";
      }
      return agent;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAgent(agentId, userId) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const deleteAgent = await Agent.findByIdAndDelete(agentId, { session });
      const deleteUser = await User.findByIdAndDelete(userId, { session });
      await Ministries.findByIdAndUpdate(
        deleteAgent.ministry,
        [
          {
            $set: {
              agentCount: { $max: [{ $subtract: ["$agentCount", 1] }, 0] },
            },
          },
        ],
        { new: true, session }
      );
      await session.commitTransaction();
      return deleteAgent;
    } catch (error) {
      console.log("error: ", error);
      if (session) {
        await session.abortTransaction();
        console.log("Transaction aborted." + error);
      }
    } finally {
      if (session) {
        session.endSession();
        console.log("Session ended.");
      }
    }
  }

  async getMinistryAgents(minId) {
    try {
      const agents = await Agent.aggregate([
        { $match: { ministry: new mongoose.Types.ObjectId(minId) } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "submissions",
            localField: "user",
            foreignField: "agentId",
            as: "submissions",
          },
        },
        {
          $addFields: {
            totalSubmissions: { $size: "$submissions" },
            totalApprovedSubmissions: {
              $size: {
                $filter: {
                  input: "$submissions",
                  as: "sub",
                  cond: { $eq: ["$$sub.status", "approved"] },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            ministry: 1,
            user: 1,
            userInfo: { fullName: 1, email: 1, phoneNumber: 1 },
            totalSubmissions: 1,
            assignedLga: 1,
            assignedwards: 1,
            isActive: 1,
            state: 1,
            totalApprovedSubmissions: 1,
            createdAt: 1,
          },
        },
      ]);

      if (agents) return agents;
      return "Agents not found";
    } catch (error) {
      console.log("error: ", error);
      return error;
    }
  }
  async updateAgent(agentId, agentData) {
    try {
      const updatedAgent = await Agent.findByIdAndUpdate(agentId, agentData, {
        new: true,
      });
      console.log("agentData", agentData);
      console.log("updatedAgent", updatedAgent);
      if (!updatedAgent) return "Agent not found";
      return updatedAgent;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AgentsService();
