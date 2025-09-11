var ImageKit = require("imagekit");
var fs = require("fs");
module.exports = {
  async auth() {
    let imagekit = new ImageKit({
      publicKey: "public_k/7VGHSYTH1q/STxZGOGFWUrsdE=",
      privateKey: "private_SXhinF5ODmtU7HRonnZ3ipezKJc=",
      urlEndpoint: "https://ik.imagekit.io/bdic",
    });
    var authenticationParameters = imagekit.getAuthenticationParameters();
    return authenticationParameters;
  },
};
