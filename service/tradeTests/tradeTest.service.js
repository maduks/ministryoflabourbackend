const { TradeTest } = require("../../models/TradeTest");
const { Question } = require("../../models/Question");

class TradeTestService {
  /**
   * Create a new trade test
   */
  async createTradeTest(testData) {
    try {
      // Handle empty string for ministryId (convert to null for all ministries)
      if (testData.ministryId === "" || testData.ministryId === null) {
        testData.ministryId = null;
      }

      // If testCode is provided, check for uniqueness
      if (testData.testCode) {
        const existingTest = await TradeTest.findOne({
          testCode: testData.testCode,
        });
        if (existingTest) {
          throw new Error("Test code already exists");
        }
      }

      const newTest = new TradeTest(testData);
      return await newTest.save();
    } catch (error) {
      console.error("Error in createTradeTest:", error);
      throw error;
    }
  }

  /**
   * Get all trade tests with filtering and pagination
   */
  async getAllTradeTests(filters = {}) {
    try {
      const {
        ministryId,
        status,
        category,
        exclusive, // If true, only show tests for the specified ministry (exclude general tests)
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build query
      const query = {};

      if (ministryId) {
        // Check if exclusive filtering is requested (only this ministry, exclude general tests)
        const exclusive =
          filters.exclusive === "true" || filters.exclusive === true;

        if (exclusive) {
          // Only show tests for this specific ministry
          query.ministryId = ministryId;
        } else {
          // Default: Show tests for this ministry OR tests available to all ministries (null)
          query.$or = [{ ministryId: ministryId }, { ministryId: null }];
        }
      }

      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      }

      if (category) {
        query.category = category;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Get total count before pagination
      const total = await TradeTest.countDocuments(query);

      // Execute query with population and pagination
      const tests = await TradeTest.find(query)
        .populate("ministryId", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Count questions for each test
      const testsWithQuestionCount = await Promise.all(
        tests.map(async (test) => {
          const questionCount = await Question.countDocuments({
            testId: test._id,
            isActive: true,
          });

          return {
            ...test,
            totalQuestions: questionCount,
            ministryName: test.ministryId ? test.ministryId.name : null,
          };
        })
      );

      return {
        data: testsWithQuestionCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllTradeTests:", error);
      throw error;
    }
  }

  /**
   * Get a single trade test by ID
   */
  async getTradeTestById(testId) {
    try {
      const test = await TradeTest.findById(testId)
        .populate("ministryId", "name")
        .lean();

      if (!test) {
        return null;
      }

      // Count questions
      const questionCount = await Question.countDocuments({
        testId: test._id,
        isActive: true,
      });

      return {
        ...test,
        totalQuestions: questionCount,
        ministryName: test.ministryId ? test.ministryId.name : null,
      };
    } catch (error) {
      console.error("Error in getTradeTestById:", error);
      throw error;
    }
  }

  /**
   * Update a trade test
   */
  async updateTradeTest(testId, updateData) {
    try {
      // Prevent testCode from being changed
      if (updateData.testCode !== undefined) {
        delete updateData.testCode;
      }

      // Handle empty string for ministryId (convert to null)
      if (updateData.ministryId === "" || updateData.ministryId === null) {
        updateData.ministryId = null;
      }

      const updatedTest = await TradeTest.findByIdAndUpdate(
        testId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("ministryId", "name")
        .lean();

      if (!updatedTest) {
        throw new Error("Trade test not found");
      }

      // Count questions
      const questionCount = await Question.countDocuments({
        testId: updatedTest._id,
        isActive: true,
      });

      return {
        ...updatedTest,
        totalQuestions: questionCount,
        ministryName: updatedTest.ministryId
          ? updatedTest.ministryId.name
          : null,
      };
    } catch (error) {
      console.error("Error in updateTradeTest:", error);
      throw error;
    }
  }

  /**
   * Delete a trade test
   */
  async deleteTradeTest(testId) {
    try {
      const deletedTest = await TradeTest.findByIdAndDelete(testId);

      if (!deletedTest) {
        throw new Error("Trade test not found");
      }

      // Optionally, you might want to deactivate questions instead of deleting
      // await Question.updateMany(
      //   { testId: testId },
      //   { isActive: false }
      // );

      return deletedTest;
    } catch (error) {
      console.error("Error in deleteTradeTest:", error);
      throw error;
    }
  }
}

module.exports = new TradeTestService();
