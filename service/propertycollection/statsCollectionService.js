const PropertyCollection = require("../../models/Propertycollection");
const {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} = require("date-fns");
exports.getVisualizationStats = async (timeRange = "this-month") => {
  try {
    const dateFilter = getDateRangeFilter(timeRange);

    // Get all data in parallel for better performance
    const [
      propertyByType,
      propertyByState,
      institutionData,
      totalValue,
      topRegion,
      mostCommonType,
    ] = await Promise.all([
      getPropertyByType(dateFilter),
      getPropertyByState(dateFilter),
      getInstitutionBreakdown(dateFilter),
      getTotalValue(dateFilter),
      getTopRegion(dateFilter),
      getMostCommonType(dateFilter),
    ]);

    return {
      stateDistribution: formatStateDistribution(propertyByState),
      propertyDistribution: formatPropertyDistribution(propertyByType),
      institutionDistribution: formatInstitutionDistribution(institutionData),
      totalValue: totalValue,
      topRegion,
      mostCommonType,
      timeRange,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

// Data fetching functions
async function getPropertyByType() {
  return PropertyCollection.aggregate([
    {
      $group: {
        _id: { $toLower: "$propertyType" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        type: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
}

async function getPropertyByState(dateFilter) {
  return PropertyCollection.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { $toLower: "$state" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        state: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
}
async function getTotalValue(dateFilter) {
  const result = await PropertyCollection.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$estimatedValue" },
      },
    },
  ]);

  return result[0]?.totalValue || 0;
}
// Date range calculator
function getDateRangeFilter(timeRange) {
  const now = new Date();
  let filter = {};

  switch (timeRange) {
    case "last-month":
      filter = {
        createdAt: {
          $gte: startOfMonth(subMonths(now, 1)),
          $lte: endOfMonth(subMonths(now, 1)),
        },
      };
      break;
    case "this-month":
      filter = {
        createdAt: {
          $gte: startOfMonth(now),
          $lte: endOfMonth(now),
        },
      };
      break;
    case "past-quarter":
      filter = {
        createdAt: {
          $gte: startOfQuarter(subMonths(now, 3)),
          $lte: endOfQuarter(subMonths(now, 3)),
        },
      };
      break;
    case "this-quarter":
      filter = {
        createdAt: {
          $gte: startOfQuarter(now),
          $lte: endOfQuarter(now),
        },
      };
      break;
    case "this-year":
      filter = {
        createdAt: {
          $gte: startOfYear(now),
          $lte: endOfYear(now),
        },
      };
      break;
    case "all-time":

    default: // Default to this month
      filter = {};
    //   filter = {
    //     createdAt: {
    //       $gte: startOfMonth(now),
    //       $lte: endOfMonth(now),
    //     },
    //   };
  }

  return filter;
}

// Updated aggregation functions with date filter
async function getTopRegion(dateFilter) {
  const result = await PropertyCollection.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$state",
        total: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 1 },
    {
      $project: {
        state: "$_id",
        total: 1,
        _id: 0,
      },
    },
  ]);

  return result[0] || { state: "N/A", total: 0 };
}

async function getMostCommonType(dateFilter) {
  const result = await PropertyCollection.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$propertyType",
        total: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 1 },
    {
      $project: {
        type: "$_id",
        total: 1,
        _id: 0,
      },
    },
  ]);

  return result[0] || { type: "N/A", total: 0 };
}
async function getInstitutionBreakdown(dateFilter) {
  return PropertyCollection.aggregate([
    { $match: dateFilter },
    { $match: { propertyType: "institutions" } },
    {
      $group: {
        _id: "$institutionType", // Assuming you have this field
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        type: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
}

// Data formatting functions
function formatStateDistribution(data) {
  const stateMap = {
    abia: "Abia",
    edo: "Edo",
    ekiti: "Ekiti",
    lagos: "Lagos",
    abuja: "Abuja",
    kano: "Kano",
    maiduguri: "Maiduguri",
    rivers: "Rivers",
    crossriver: "Cross River",
    benue: "Benue",
    kogi: "Kogi",
    oyo: "Oyo",
    ogun: "Ogun",
    kwara: "Kwara",
    katsina: "Katsina",
    nasarawa: "Nasarawa",
    jos: "Jos",
    kaduna: "Kaduna",
    enugu: "Enugu",
    imo: "Imo",
    akwaibom: "Akwa Ibom",
    anambra: "Anambra",
    delta: "Delta",
    ekiti: "Ekiti",
    ebonyi: "Ebonyi",
    edo: "Edo",
    gombe: "Gombe",
    other: "Others",
  };

  const stateCounts = {
    Lagos: 0,
    Abuja: 0,
    Kano: 0,
    "Port Harcourt": 0,
    Benue: 0,
    Others: 0,
  };

  data.forEach((item) => {
    const displayName = stateMap[item.state] || "Others";
    stateCounts[displayName] = item.count;
  });

  return {
    labels: Object.keys(stateCounts),
    datasets: [
      {
        label: "Properties by State",
        data: Object.values(stateCounts),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
    ],
  };
}

function formatPropertyDistribution(data) {
  const typeMap = {
    house: "Houses",
    land: "Land",
    vehicle: "Vehicles",
    institution: "Institutions",
  };

  const typeCounts = {
    Houses: 0,
    Land: 0,
    Vehicles: 0,
    Institutions: 0,
  };

  data.forEach((item) => {
    const displayName = typeMap[item.type] || item.type;
    typeCounts[displayName] = item.count;
  });

  return {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        data: Object.values(typeCounts),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Houses
          "rgba(16, 185, 129, 0.8)", // Land
          "rgba(245, 158, 11, 0.8)", // Vehicles
          "rgba(239, 68, 68, 0.8)", // Institutions
        ],
      },
    ],
  };
}

function formatInstitutionDistribution(data) {
  // Initialize with all possible institution types
  const institutionCounts = {
    Universities: 0,
    Polytechnics: 0,
    CollegeOfEducation: 0,
    SecondarySchool: 0,
    NurseryPrimarySecondary: 0,
  };

  // Map database values to our standard categories
  data.forEach((item) => {
    const lowerType = item.type?.toLowerCase() || "";
    if (lowerType.includes("university"))
      institutionCounts.Universities += item.count;
    else if (lowerType.includes("polytechnic"))
      institutionCounts.Polytechnics += item.count;
    else if (lowerType.includes("collegeofeducation"))
      institutionCounts.CollegeOfEducation += item.count;
    else if (lowerType.includes("secondary"))
      institutionCounts.SecondarySchool += item.count;
    else if (lowerType.includes("nurseryprimarysecondary"))
      institutionCounts.NurseryPrimarySecondary += item.count;
    //else institutionCounts.Schools += item.count; // Default fallback
  });

  return {
    labels: Object.keys(institutionCounts),
    datasets: [
      {
        label: "Properties by Institutions",
        data: Object.values(institutionCounts),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderAlign: "inner",
      },
    ],
  };
}
