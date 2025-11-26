const { Question } = require("../../models/Question");
const { TradeTest } = require("../../models/TradeTest");

class QuestionService {
  /**
   * Validate question data based on question type
   */
  validateQuestion(questionData) {
    const { questionText, questionType, options, correctAnswer, points } =
      questionData;

    // Validate questionText
    if (!questionText || questionText.trim() === "") {
      throw new Error("questionText is required and cannot be empty");
    }

    // Validate points
    if (!points || points < 1) {
      throw new Error("points must be at least 1");
    }

    // Type-specific validation
    if (questionType === "multiple_choice") {
      if (!options || !Array.isArray(options) || options.length < 2) {
        throw new Error("multiple_choice questions require at least 2 options");
      }

      // Validate correctAnswer matches one of the options
      if (Array.isArray(correctAnswer)) {
        // Multiple correct answers
        const invalidAnswers = correctAnswer.filter(
          (answer) => !options.includes(answer)
        );
        if (invalidAnswers.length > 0) {
          throw new Error(
            `correctAnswer contains values not in options: ${invalidAnswers.join(
              ", "
            )}`
          );
        }
      } else {
        // Single correct answer
        if (!options.includes(correctAnswer)) {
          throw new Error(
            "correctAnswer must match one of the options for multiple_choice questions"
          );
        }
      }
    } else if (questionType === "true_false") {
      if (correctAnswer !== "true" && correctAnswer !== "false") {
        throw new Error(
          "correctAnswer for true_false questions must be 'true' or 'false'"
        );
      }
    } else if (questionType === "short_answer") {
      // Short answer can have optional correctAnswer for grading reference
      // No strict validation needed
    } else if (questionType === "practical") {
      // Practical questions require manual grading
      // correctAnswer can be empty
    }

    return true;
  }

  /**
   * Create a new question
   */
  async createQuestion(testId, questionData) {
    try {
      // Verify test exists
      const test = await TradeTest.findById(testId);
      if (!test) {
        throw new Error("Trade test not found");
      }

      // Validate question data
      this.validateQuestion(questionData);

      // Prepare question data
      const questionToCreate = {
        ...questionData,
        testId,
      };

      // For non-multiple_choice questions, clear options if provided
      if (questionData.questionType !== "multiple_choice") {
        questionToCreate.options = [];
      }

      const newQuestion = new Question(questionToCreate);
      return await newQuestion.save();
    } catch (error) {
      console.error("Error in createQuestion:", error);
      throw error;
    }
  }

  /**
   * Get all questions for a test with pagination
   */
  async getQuestionsByTestId(testId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        questionType,
        difficulty,
        category,
        isActive,
        sortBy = "order",
        sortOrder = "asc",
      } = filters;

      // Verify test exists
      const test = await TradeTest.findById(testId);
      if (!test) {
        throw new Error("Trade test not found");
      }

      // Build query
      const query = { testId };

      if (questionType) {
        query.questionType = questionType;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (category) {
        query.category = category;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === "true" || isActive === true;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Get total count before pagination
      const total = await Question.countDocuments(query);

      // Execute query with pagination
      const questions = await Question.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        data: questions,
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
      console.error("Error in getQuestionsByTestId:", error);
      throw error;
    }
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(questionId) {
    try {
      const question = await Question.findById(questionId).lean();

      if (!question) {
        return null;
      }

      return question;
    } catch (error) {
      console.error("Error in getQuestionById:", error);
      throw error;
    }
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId, updateData) {
    try {
      // Get existing question
      const existingQuestion = await Question.findById(questionId);
      if (!existingQuestion) {
        throw new Error("Question not found");
      }

      // Merge with existing data for validation
      const mergedData = {
        ...existingQuestion.toObject(),
        ...updateData,
      };

      // Validate updated question data
      this.validateQuestion(mergedData);

      // For non-multiple_choice questions, clear options if provided
      if (
        updateData.questionType &&
        updateData.questionType !== "multiple_choice"
      ) {
        updateData.options = [];
      } else if (
        !updateData.questionType &&
        existingQuestion.questionType !== "multiple_choice"
      ) {
        updateData.options = [];
      }

      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();

      return updatedQuestion;
    } catch (error) {
      console.error("Error in updateQuestion:", error);
      throw error;
    }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId) {
    try {
      const deletedQuestion = await Question.findByIdAndDelete(questionId);

      if (!deletedQuestion) {
        throw new Error("Question not found");
      }

      return deletedQuestion;
    } catch (error) {
      console.error("Error in deleteQuestion:", error);
      throw error;
    }
  }

  /**
   * Bulk import questions
   */
  async bulkImportQuestions(testId, questions) {
    try {
      // Verify test exists
      const test = await TradeTest.findById(testId);
      if (!test) {
        throw new Error("Trade test not found");
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("questions must be a non-empty array");
      }

      // Validate all questions
      questions.forEach((question, index) => {
        try {
          this.validateQuestion(question);
        } catch (error) {
          throw new Error(
            `Question at index ${index} is invalid: ${error.message}`
          );
        }
      });

      // Prepare questions for bulk insert
      const questionsToInsert = questions.map((question) => {
        const questionData = {
          ...question,
          testId,
        };

        // For non-multiple_choice questions, clear options
        if (question.questionType !== "multiple_choice") {
          questionData.options = [];
        }

        return questionData;
      });

      // Bulk insert
      const insertedQuestions = await Question.insertMany(questionsToInsert);

      return {
        success: true,
        count: insertedQuestions.length,
        questions: insertedQuestions,
      };
    } catch (error) {
      console.error("Error in bulkImportQuestions:", error);
      throw error;
    }
  }
}

module.exports = new QuestionService();
