function getProviderId(provider) {
    switch (provider) {
      case "abuja-electric":
        return "13B5041B-7143-46B1-9A88-F355AD7EA1EC";

      case "ikeja-electric":
        return "8F195A43-78B2-491B-A498-0AAB1088BC3F";

      case "eko-electric":
        return "8E7485D9-1A67-4205-A49D-691E5B78C20D";

      case "kano-electric":
        return "51AE44EA-AF4D-401D-ACB5-8CEE818720AA";

      case "jos-electric":
        return "BAB2A62B-F27A-42F3-98C0-8AA1A0ED417B";

      case "ibadan-electric":
        return "79261A7B-25AA-46A1-8415-B77665BEA67D";

      case "kaduna-electric":
        return "8A821E58-59F0-46B2-97A6-966F3369F3D4";

      case "enugu-electric":
        return "37D6A210-60DC-4892-B12E-72226E244ABB";

      case "benin-electric":
        return "93CB6363-B065-483C-B235-EA255436B5E0";

      case "portharcourt-electric":
        return "A5B4DACC-0391-4887-A76E-2B0584A8C985";

      case "aba-electric":
        return "37D6A210-60DC-4892-B12E-72226E244ABB";
      case "yola-electric":
        return "D7E42A6F-F74F-4917-AF18-4F979B9F3EFD";

      default:
        return provider;
    }
  }
  
  module.exports = getProviderId;