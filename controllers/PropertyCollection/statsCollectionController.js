const statsService = require("../../service/propertycollection/statsCollectionService");

/**
 * @desc    Get visualization statistics
 * @route   GET /api/stats
 * @access  Public
 */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await statsService.getVisualizationStats(req.query.range);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in stats controller:", error);
    next(error); // Pass to error handling middleware
  }
};

/**
 * @desc    Error handling middleware
 */
exports.handleErrors = (err, req, res, next) => {
  console.error("Stats error:", err.stack);

  res.status(500).json({
    success: false,
    error: "Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
};
