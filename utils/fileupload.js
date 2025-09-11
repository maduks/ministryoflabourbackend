const multer = require("multer");

//SET Storage
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/Images/members");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(" ", "-");
    // console.log(req.body);
    cb(null,  Date.now()+fileName  );
  },
});
const uploadOptions = multer({ storage });

module.exports = { uploadOptions };
