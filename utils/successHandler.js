class SuccessResponse {
  constructor(message, data = null, statusCode = 200) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.success = true;
  }

  send(res) {
    res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

module.exports = { SuccessResponse };
