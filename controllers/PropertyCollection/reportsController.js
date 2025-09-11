const { OpenAI } = require("openai");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const PropertyCollection = require("../../models/Propertycollection");

const openai = new OpenAI({
  apiKey:
    "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",
  baseURL: "https://openrouter.ai/api/v1",
});
const generateAssetAnalysisPrompt = (
  lands,
  buildings,
  vehicles,
  institutions,
  petroleum,
  userPrompt = ""
) => {
  // Helper function to format currency
  const formatValue = (num) => {
    if (!num) return "₦0";
    if (num >= 1e9) return `₦${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `₦${(num / 1e6).toFixed(1)}M`;
    return `₦${num.toLocaleString()}`;
  };

  // Calculate value ranges
  const getValueRange = (assets) => {
    if (!assets.length || !assets[0]?.estimatedValue) return "N/A";
    const values = assets.map((a) => a.estimatedValue).filter(Boolean);
    return `${formatValue(Math.min(...values))} - ${formatValue(
      Math.max(...values)
    )}`;
  };

  // Data Processing
  const landStates = [...new Set(lands.map((l) => l.state))];
  const buildingTypes = [...new Set(buildings.map((b) => b.buildingType))];
  const vehicleTypes = [...new Set(vehicles.map((v) => v.vehicleType))];
  const institutionTypes = [
    ...new Set(institutions.map((i) => i.institutionType)),
  ];
  const petroleumTypes = [...new Set(petroleum.map((p) => p.facilityType))];

  const allAssets = [
    ...lands,
    ...buildings,
    ...vehicles,
    ...institutions,
    ...petroleum,
  ];
  const totalAssets = allAssets.length;
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Financial Summaries
  const totalPortfolioValue = allAssets.reduce(
    (sum, a) => sum + (a.estimatedValue || 0),
    0
  );
  const avgAssetValue = totalPortfolioValue / totalAssets;

  return `
# GOVERNMENT ASSET MANAGEMENT ANALYTICAL REPORT  
## ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}

## Dataset Overview  
| Asset Category  | Count | % of Total | Value Range          |  
|-----------------|-------|------------|----------------------|  
| Lands           | ${lands.length} | ${(
    (lands.length / totalAssets) *
    100
  ).toFixed(1)}% | ${getValueRange(lands)} |  
| Buildings       | ${buildings.length} | ${(
    (buildings.length / totalAssets) *
    100
  ).toFixed(1)}% | ${getValueRange(buildings)} |  
| Vehicles        | ${vehicles.length} | ${(
    (vehicles.length / totalAssets) *
    100
  ).toFixed(1)}% | ${getValueRange(vehicles)} |  
| Institutions    | ${institutions.length} | ${(
    (institutions.length / totalAssets) *
    100
  ).toFixed(1)}% | ${getValueRange(institutions)} |  
| Petroleum       | ${petroleum.length} | ${(
    (petroleum.length / totalAssets) *
    100
  ).toFixed(1)}% | ${getValueRange(petroleum)} |  

## Key Financial Metrics  
- **Total Portfolio Value**: ${formatValue(totalPortfolioValue)}  
- **Average Asset Value**: ${formatValue(avgAssetValue)}  
- **Highest Value Asset**: ${formatValue(
    Math.max(...allAssets.map((a) => a.estimatedValue || 0))
  )} (${
    allAssets.find(
      (a) =>
        a.estimatedValue ===
        Math.max(...allAssets.map((a) => a.estimatedValue || 0))
    )?.propertyName || "Unknown"
  })  
- **Lowest Value Asset**: ${formatValue(
    Math.min(...allAssets.map((a) => a.estimatedValue || 0))
  )}  

## Geographic Distribution  
${
  landStates.length > 1
    ? `
- **Top States**:  
${landStates
  .map(
    (state) =>
      `  - ${state}: ${
        lands.filter((l) => l.state === state).length
      } assets (${formatValue(
        lands
          .filter((l) => l.state === state)
          .reduce((sum, a) => sum + (a.estimatedValue || 0), 0)
      )})`
  )
  .join("\n")}
`
    : `- All assets in ${landStates[0] || "single location"}`
}

## Condition Analysis  
${
  buildings[0]?.buildingCondition
    ? `
- **Building Conditions**:  
  - Excellent: ${
    buildings.filter((b) => b.buildingCondition === "excellent").length
  }  
  - Good: ${buildings.filter((b) => b.buildingCondition === "good").length}  
  - Poor: ${buildings.filter((b) => b.buildingCondition === "poor").length}  
`
    : "No condition data available"
}

## Strategic Recommendations  
1. **Priority Maintenance**:  
   - ${
     buildings.filter((b) => b.buildingCondition === "poor").length
   } buildings need urgent repairs  
   - Estimated cost: ${formatValue(
     buildings.filter((b) => b.buildingCondition === "poor").length * 5000000
   )}  

2. **Underutilized Assets**:  
   ${
     allAssets
       .filter((a) => a.status === "abandoned")
       .map((a) => `- ${a.propertyName} (${a.propertyType})`)
       .join("\n") || "None identified"
   }

3. **Acquisition Priorities**:  
   - Missing categories: ${["Healthcare", "Public Transport"]
     .filter((t) => ![...buildingTypes, ...institutionTypes].includes(t))
     .join(", ")}  

${userPrompt ? `\n## Custom Analysis: ${userPrompt}\n...` : ""}
`;
};

// const generateAssetAnalysisPrompt = (
//   lands,
//   buildings,
//   vehicles,
//   institutions,
//   petroleum,
//   userPrompt = ""
// ) => {
//   const landStates = [...new Set(lands.map((l) => l.state))];
//   const buildingTypes = [...new Set(buildings.map((b) => b.propertyType))];
//   const vehicleTypes = [...new Set(vehicles.map((v) => v.propertyType))];
//   const institutionTypes = [
//     ...new Set(institutions.map((i) => i.propertyType)),
//   ];
//   const petroleumTypes = [...new Set(petroleum.map((p) => p.propertyType))];

//   const hasDates =
//     lands.some((l) => l.acquisitionDate) ||
//     buildings.some((b) => b.acquisitionDate) ||
//     vehicles.some((v) => v.acquisitionDate) ||
//     institutions.some((i) => i.acquisitionDate) ||
//     petroleum.some((p) => p.acquisitionDate);

//   const allAssets = [
//     ...lands,
//     ...buildings,
//     ...vehicles,
//     ...institutions,
//     ...petroleum,
//   ];
//   const totalAssets = allAssets.length;
//   const currentMonth = new Date().toLocaleString("default", { month: "long" });

//   const oldestAssetDate = hasDates
//     ? new Date(
//         Math.min(
//           ...allAssets
//             .filter((a) => a.acquisitionDate)
//             .map((a) => new Date(a.acquisitionDate))
//         )
//       )
//     : null;

//   const newestAssetDate = hasDates
//     ? new Date(
//         Math.max(
//           ...allAssets
//             .filter((a) => a.acquisitionDate)
//             .map((a) => new Date(a.acquisitionDate))
//         )
//       )
//     : null;

//   const averageAgeYears = hasDates
//     ? (
//         (Date.now() - oldestAssetDate.getTime()) /
//         (1000 * 60 * 60 * 24 * 365)
//       ).toFixed(1)
//     : null;

//   return `
// # GOVERNMENT ASSET MANAGEMENT ANALYTICAL REPORT
// ## User Request Focus: ${userPrompt || "Comprehensive analysis"}

// ## Dataset Overview
// | Asset Category  | Count | % of Total | Value Range (if available) |
// |-----------------|-------|------------|----------------------------|
// | Lands           | ${lands.length} | ${(
//     (lands.length / totalAssets) *
//     100
//   ).toFixed(1)}% | ${
//     lands[0]?.value
//       ? `${Math.min(...lands.map((l) => l.value))} - ${Math.max(
//           ...lands.map((l) => l.value)
//         )}`
//       : "N/A"
//   } |
// | Buildings       | ${buildings.length} | ${(
//     (buildings.length / totalAssets) *
//     100
//   ).toFixed(1)}% | ${
//     buildings[0]?.value
//       ? `${Math.min(...buildings.map((b) => b.value))} - ${Math.max(
//           ...buildings.map((b) => b.value)
//         )}`
//       : "N/A"
//   } |
// | Vehicles        | ${vehicles.length} | ${(
//     (vehicles.length / totalAssets) *
//     100
//   ).toFixed(1)}% | ${
//     vehicles[0]?.value
//       ? `${Math.min(...vehicles.map((v) => v.value))} - ${Math.max(
//           ...vehicles.map((v) => v.value)
//         )}`
//       : "N/A"
//   } |
// | Institutions    | ${institutions.length} | ${(
//     (institutions.length / totalAssets) *
//     100
//   ).toFixed(1)}% | ${
//     institutions[0]?.value
//       ? `${Math.min(...institutions.map((i) => i.value))} - ${Math.max(
//           ...institutions.map((i) => i.value)
//         )}`
//       : "N/A"
//   } |
// | Petroleum       | ${petroleum.length} | ${(
//     (petroleum.length / totalAssets) *
//     100
//   ).toFixed(1)}% | ${
//     petroleum[0]?.value
//       ? `${Math.min(...petroleum.map((p) => p.value))} - ${Math.max(
//           ...petroleum.map((p) => p.value)
//         )}`
//       : "N/A"
//   } |

// ## 1. Geographic Distribution Analysis
// ${
//   landStates.length > 1
//     ? `
// - **Regional Concentration**:
//   - Top state: ${landStates[0]} (${(
//         (lands.filter((l) => l.state === landStates[0]).length / lands.length) *
//         100
//       ).toFixed(1)}% of lands)
//   - Full distribution: ${landStates
//     .map(
//       (state) =>
//         `${state}: ${lands.filter((l) => l.state === state).length} assets`
//     )
//     .join(", ")}
// `
//     : `- All assets concentrated in a single location: ${
//         landStates[0] || "Unknown"
//       }`
// }

// - **Underserved Areas**:
//   ${
//     landStates.length > 1
//       ? `States with no assets: [List neighboring states or major population centers missing from distribution]`
//       : `100% concentration in ${
//           landStates[0] || "one location"
//         } - consider expansion to [suggest 2-3 high-priority regions based on economic/population data]`
//   }

// ## 2. Temporal Analysis ${hasDates ? "(Available)" : "(Limited)"}
// ${
//   hasDates
//     ? `
// - **Acquisition Timeline**:
//   - Oldest asset: ${oldestAssetDate.toDateString()}
//   - Newest asset: ${newestAssetDate.toDateString()}
//   - Average age: ${averageAgeYears} years
// `
//     : "- No acquisition dates provided - recommend adding this metadata for lifecycle analysis"
// }

// ${
//   userPrompt.toLowerCase().includes("month")
//     ? `
// ## Monthly Focus: ${currentMonth}
// - **Assets acquired this month**: ${
//         allAssets.filter(
//           (a) =>
//             a.acquisitionDate &&
//             new Date(a.acquisitionDate).getMonth() === new Date().getMonth()
//         ).length
//       }
// - **Maintenance activities**: [Insert maintenance records if available]
// - **Utilization trends**: [Insert monthly usage data if available]
// `
//     : ""
// }

// ## 3. Financial Valuation
// ${
//   lands[0]?.value
//     ? `
// - **Land Values**:
//   - Average: ${(
//     lands.reduce((sum, l) => sum + l.value, 0) / lands.length
//   ).toFixed(2)}
//   - Value per hectare: ${(
//     lands.reduce((sum, l) => sum + l.value, 0) /
//     lands.reduce((sum, l) => sum + (l.size || 1), 0)
//   ).toFixed(2)}
// `
//     : "- No land valuation data - recommend property appraisal"
// }

// ${
//   buildings[0]?.value
//     ? `
// - **Building Values**:
//   - Depreciation estimate: $${buildings
//     .reduce((sum, b) => sum + b.value * 0.05, 0)
//     .toFixed(2)} (assuming 5% annual depreciation)
// `
//     : "- No building valuation data"
// }

// ## 4. Condition & Utilization
// ${
//   buildings[0]?.condition
//     ? `
// - **Condition Distribution**:
//   - Excellent: ${
//     buildings.filter((b) => b.condition === "excellent").length
//   } (${(
//         (buildings.filter((b) => b.condition === "excellent").length /
//           buildings.length) *
//         100
//       ).toFixed(1)}%)
//   - Good: ${buildings.filter((b) => b.condition === "good").length}
//   - Poor: ${buildings.filter((b) => b.condition === "poor").length}
// `
//     : "- No condition data - recommend implementing asset condition surveys"
// }

// ## 5. Strategic Recommendations
// 1. **Geographic Expansion**:
//    - Priority targets: [List 3 regions based on economic indicators]
//    - Estimated cost: [Provide range based on similar assets]

// 2. **Asset Diversification**:
//    - Missing categories: ${["Healthcare", "Education", "Public Transport"]
//      .filter((t) => ![...buildingTypes, ...institutionTypes].includes(t))
//      .join(", ")}
//    - ROI projection: Healthcare facilities (8-12%), Schools (5-7%)

// 3. **Maintenance Program**:
//    - Critical: ${
//      buildings.filter((b) => b.condition === "poor").length
//    } buildings requiring immediate attention
//    - Budget estimate: $${(
//      buildings.filter((b) => b.condition === "poor").length * 5000
//    ).toLocaleString()} (assuming $5,000 per repair)

// ## Executive Dashboard
// [VISUALIZATION] Geographic Distribution Heatmap
// [VISUALIZATION] Asset Age Pyramid
// [VISUALIZATION] Condition Status Pie Chart

// ## Actionable Metrics
// - Immediate reallocation candidates: [Identify 3-5 underutilized assets]
// - Acquisition priority score: [Calculate based on location, type, condition]
// - Risk exposure: ${
//     buildings.filter((b) => b.condition === "poor").length
//   } high-risk assets

// ## Next Steps
// 1. Conduct detailed valuation of all unappraised assets
// 2. Implement GPS tracking for mobile assets (vehicles)
// 3. Develop 3-year acquisition plan focusing on:
//    - ${
//      landStates.length > 1
//        ? "Balancing regional distribution"
//        : "Diversifying geographic coverage"
//    }
//    - Filling gaps in ${["Healthcare", "Education", "Public Transport"]
//      .filter((t) => ![...buildingTypes, ...institutionTypes].includes(t))
//      .join(", ")}

// ${
//   userPrompt
//     ? `\n## Special Analysis: Custom Request Fulfillment\n${generateCustomAnalysis(
//         userPrompt,
//         lands,
//         buildings,
//         vehicles,
//         institutions,
//         petroleum
//       )}`
//     : ""
// }
// `;
// };

// Custom user prompt helper
function generateCustomAnalysis(
  prompt,
  lands,
  buildings,
  vehicles,
  institutions,
  petroleum
) {
  const allAssets = [
    ...lands,
    ...buildings,
    ...vehicles,
    ...institutions,
    ...petroleum,
  ];
  if (prompt.toLowerCase().includes("month")) {
    return `Monthly focus analysis shows ${
      allAssets.filter(
        (a) =>
          a.acquisitionDate &&
          new Date(a.acquisitionDate).getMonth() === new Date().getMonth()
      ).length
    } assets acquired this month.`;
  }

  if (prompt.toLowerCase().includes("budget")) {
    return `Budget projection based on current assets: 
- Maintenance: $${buildings.length * 2000}/year
- Depreciation: $${buildings
      .reduce((sum, b) => sum + b.value * 0.05, 0)
      .toFixed(2)}/year`;
  }

  return `Custom analysis of "${prompt}" not yet implemented. Please specify: 
- Time period (month/quarter/year) 
- Asset category focus 
- Specific metrics (financial/geographic/condition)`;
}

// Helper for custom user prompt analysis
function generateCustomAnalysis(
  prompt,
  lands,
  buildings,
  vehicles,
  institutions,
  petroleum
) {
  if (prompt.toLowerCase().includes("month")) {
    return `Monthly focus analysis shows ${
      [
        ...lands,
        ...buildings,
        ...vehicles,
        ...institutions,
        ...petroleum,
      ].filter(
        (a) =>
          a.acquisitionDate &&
          new Date(a.acquisitionDate).getMonth() === new Date().getMonth()
      ).length
    } assets acquired this month.`;
  }

  if (prompt.toLowerCase().includes("budget")) {
    return `Budget projection based on current assets: \n- Maintenance: $${
      buildings.length * 2000
    }/year\n- Depreciation: $${buildings.reduce(
      (sum, b) => sum + b.value * 0.05,
      0
    )}/year`;
  }

  return `Custom analysis of "${prompt}" not yet implemented. Please specify: 
- Time period (month/quarter/year) 
- Asset category focus 
- Specific metrics (financial/geographic/condition)`;
}

exports.generateAiReport = async (req, res) => {
  try {
    const [lands, buildings, vehicles, institutions, petroleum] =
      await Promise.all([
        PropertyCollection.find({ propertyType: "land" }),
        PropertyCollection.find({ propertyType: "house" }),
        PropertyCollection.find({ propertyType: "vehicle" }),
        PropertyCollection.find({ propertyType: "institutions" }),
        PropertyCollection.find({ propertyType: "petroleum" }),
      ]);

    console.log(lands);

    // const summary = summarizeDataForPrompt(
    //   lands,
    //   buildings,
    //   vehicles,
    //   institutions,
    //   petroleum
    // );

    // const response = await openai.chat.completions.create({
    //   model: "deepseek/deepseek-chat:free",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are a government asset report generator.",
    //     },
    //     { role: "user", content: req.body.summary + summary },
    //   ],
    //   // max_tokens: 1000,
    // });

    const summary = generateAssetAnalysisPrompt(
      lands,
      buildings,
      vehicles,
      institutions,
      petroleum,
      req.body.userPrompt // Pass the user's original request
    );

    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat:free",
      messages: [
        {
          role: "system",
          content: `You are an advanced government asset analysis AI ALL reports and symbol must be in naira . Your tasks:
          1. Generate comprehensive reports with data visualization descriptions
          2. Provide actionable recommendations with cost estimates
          3. Highlight statistical anomalies and opportunities
          4. Format output with Markdown tables and headers
          
          Response Guidelines:
          - Always include numeric calculations when possible
          - Suggest 3-5 concrete next steps
          - Compare against industry benchmarks
          - Use emojis for visual categorization (🏢 🚗 ⛽️)`,
        },
        {
          role: "user",
          content: `ANALYSIS REQUEST: ${
            req.body.userPrompt || "Comprehensive report"
          }
          
          ${summary}
          
          Special Instructions:
          - ${
            req.body.specialInstructions ||
            "Focus on geographic distribution and financial valuation"
          }
          - Current Month: ${new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
          `,
        },
      ],
      temperature: 0.3, // Lower for more factual responses
      max_tokens: 2000, // Increased for detailed analysis
    });

    const report = response.choices[0].message.content;
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const lands = await PropertyCollection.find({
      propertyType: "land",
    }).lean();
    const parser = new Parser();
    const csv = parser.parse(lands);

    res.header("Content-Type", "text/csv");
    res.attachment("lands-report.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate CSV" });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const [lands, buildings, vehicles, institutions, petroleum] =
      await Promise.all([
        PropertyCollection.find({ propertyType: "land" }).lean(),
        PropertyCollection.find({ propertyType: "house" }).lean(),
        PropertyCollection.find({ propertyType: "vehicle" }).lean(),
        PropertyCollection.find({ propertyType: "institutions" }).lean(),
        PropertyCollection.find({ propertyType: "petroleum" }).lean(),
      ]);

    const summary = summarizeDataForPrompt(
      lands,
      buildings,
      vehicles,
      institutions,
      petroleum
    );

    const gptResponse = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat:free",
      messages: [
        {
          role: "system",
          content: "You are a government asset report generator.",
        },
        { role: "user", content: summary },
      ],
    });

    const reportText = gptResponse.choices[0].message.content;

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    doc.pipe(res);

    doc
      .fontSize(14)
      .text("Benue State Asset Report", { align: "center" })
      .moveDown();
    doc.fontSize(12).text(reportText, { align: "left" });
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
