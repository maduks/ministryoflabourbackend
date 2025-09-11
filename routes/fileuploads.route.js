const express = require("express");
const router = express.Router();
const {uploadOptions} = require("../controllers/uploads/fileuploads");
//const fileuploadController = new FileUploadController();
router.post("/uploadfile", uploadOptions.single('file'));
module.exports = router;
