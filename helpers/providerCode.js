function getProviderCode(provider) {
  switch (provider) {
    case "abuja-electric":
      return "MY003";

    case "ikeja-electric":
      return "PR";

    case "eko-electric":
      return "MY003";

    case "kano-electric":
      return "PREPAID";

    case "jos-electric":
      return "PRP";

    case "ibadan-electric":
      return "PRP";

    case "kaduna-electric":
      return "KAEDCO_PREPAID";

    case "enugu-electric":
      return "Prepaid";

    case "benin-electric":
      return "PT";

    case "portharcourt-electric":
      return "prepaid";

    case "aba-electric":
      return "Prepaid";
    case "yola-electric":
      return "YEDC_PREPAID";

    default:
      return provider;
  }
}

module.exports = getProviderCode;
