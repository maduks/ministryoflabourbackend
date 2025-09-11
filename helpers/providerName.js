function getProviderName(provideruid) {
    switch (provideruid) {
      case "13B5041B-7143-46B1-9A88-F355AD7EA1EC":
        return "abuja-electric";

      case "8F195A43-78B2-491B-A498-0AAB1088BC3F":
        return "ikeja-electric";

      case "8E7485D9-1A67-4205-A49D-691E5B78C20D":
        return "eko-electric";

      case "51AE44EA-AF4D-401D-ACB5-8CEE818720AA":
        return "kano-electric";

      case "BAB2A62B-F27A-42F3-98C0-8AA1A0ED417B":
        return "jos-electric";

      case "79261A7B-25AA-46A1-8415-B77665BEA67D":
        return "ibadan-electric";

      case "8A821E58-59F0-46B2-97A6-966F3369F3D4":
        return "kaduna-electric";

      case "37D6A210-60DC-4892-B12E-72226E244ABB":
        return "enugu-electric";

      case "93CB6363-B065-483C-B235-EA255436B5E0":
        return "benin-electric";

      case "A5B4DACC-0391-4887-A76E-2B0584A8C985":
        return "portharcourt-electric";

      case "37D6A210-60DC-4892-B12E-72226E244ABB":
        return "enugu-electric";

      case "D7E42A6F-F74F-4917-AF18-4F979B9F3EFD":
        return "yola-electric";

      default:
        return provideruid;
    }
  }
  
  module.exports = getProviderName;