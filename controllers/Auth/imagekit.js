const imagekit =require("../../service/imagekit/imagekit.service")
module.exports = {
  async imageKit(req, res) {
    try {
      const authData = await imagekit.auth();
      res.json(authData);
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  },
};
