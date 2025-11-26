const questionService = require("../../service/tradeTests/question.service");

class QuestionController {
  /**
   * Create a new question
   * POST /api/trade-tests/:testId/questions
   */
  async createQuestion(req, res) {
    try {
      const { testId } = req.params;
      const questionData = req.body;

      const newQuestion = await questionService.createQuestion(
        testId,
        questionData
      );

      res.status(201).json({
        success: true,
        data: newQuestion,
      });
    } catch (error) {
      console.error("Error in createQuestion controller:", error);

      if (
        error.message === "Trade test not found" ||
        error.message.includes("questionText is required") ||
        error.message.includes("points must be at least") ||
        error.message.includes("multiple_choice questions require") ||
        error.message.includes("correctAnswer")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to create question",
        message: error.message,
      });
    }
  }

  /**
   * Get all questions for a test
   * GET /api/trade-tests/:testId/questions
   */
  async getQuestionsByTestId(req, res) {
    try {
      const { testId } = req.params;
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        questionType: req.query.questionType,
        difficulty: req.query.difficulty,
        category: req.query.category,
        isActive: req.query.isActive,
        sortBy: req.query.sortBy || "order",
        sortOrder: req.query.sortOrder || "asc",
      };

      // Remove undefined filters (except page and limit which have defaults)
      Object.keys(filters).forEach((key) => {
        if (filters[key] === undefined && key !== "page" && key !== "limit") {
          delete filters[key];
        }
      });

      const result = await questionService.getQuestionsByTestId(
        testId,
        filters
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error in getQuestionsByTestId controller:", error);

      if (error.message === "Trade test not found") {
        return res.status(404).json({
          success: false,
          message: "Trade test not found",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to get questions",
        message: error.message,
      });
    }
  }

  /**
   * Get a single question by ID
   * GET /api/trade-tests/questions/:questionId
   */
  async getQuestionById(req, res) {
    try {
      const { questionId } = req.params;
      const question = await questionService.getQuestionById(questionId);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      console.error("Error in getQuestionById controller:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get question",
        message: error.message,
      });
    }
  }

  /**
   * Update a question
   * PUT /api/trade-tests/questions/:questionId
   */
  async updateQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const updateData = req.body;

      const updatedQuestion = await questionService.updateQuestion(
        questionId,
        updateData
      );

      res.status(200).json({
        success: true,
        data: updatedQuestion,
      });
    } catch (error) {
      console.error("Error in updateQuestion controller:", error);

      if (
        error.message === "Question not found" ||
        error.message.includes("questionText is required") ||
        error.message.includes("points must be at least") ||
        error.message.includes("multiple_choice questions require") ||
        error.message.includes("correctAnswer")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to update question",
        message: error.message,
      });
    }
  }

  /**
   * Delete a question
   * DELETE /api/trade-tests/questions/:questionId
   */
  async deleteQuestion(req, res) {
    try {
      const { questionId } = req.params;
      await questionService.deleteQuestion(questionId);

      res.status(200).json({
        success: true,
        message: "Question deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteQuestion controller:", error);

      if (error.message === "Question not found") {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to delete question",
        message: error.message,
      });
    }
  }

  /**
   * Bulk import questions
   * POST /api/trade-tests/:testId/questions/bulk
   */
  async bulkImportQuestions(req, res) {
    try {
      const { testId } = req.params;
      const { questions } = req.body;

      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: "questions must be a non-empty array",
        });
      }

      const result = await questionService.bulkImportQuestions(
        testId,
        questions
      );

      res.status(201).json({
        success: true,
        message: `Successfully imported ${result.count} questions`,
        data: result,
      });
    } catch (error) {
      console.error("Error in bulkImportQuestions controller:", error);

      if (
        error.message === "Trade test not found" ||
        error.message.includes("questions must be") ||
        error.message.includes("Question at index")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to import questions",
        message: error.message,
      });
    }
  }
}

module.exports = new QuestionController();
