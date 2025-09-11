const Property = require("../../models/Propertycollection");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// Helper function for currency formatting
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Analysis functions for each property type
const analyzeLands = (lands) => {
  const landUseDistribution = lands.reduce((acc, land) => {
    const use = land.landUse || "Unknown";
    acc[use] = (acc[use] || 0) + 1;
    return acc;
  }, {});

  const landTypeDistribution = lands.reduce((acc, land) => {
    const type = land.landType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const totalSize = lands.reduce((sum, land) => sum + (land.landSize || 0), 0);
  const totalValue = lands.reduce(
    (sum, land) => sum + (land.estimatedValue || 0),
    0
  );

  return {
    total: lands.length,
    totalSize,
    averageSize: totalSize / (lands.length || 1),
    totalValue: formatCurrency(totalValue),
    averageValue: formatCurrency(totalValue / (lands.length || 1)),
    landUseDistribution,
    landTypeDistribution,
    newestAcquisitions: lands
      .sort((a, b) => new Date(b.acquisitionDate) - new Date(a.acquisitionDate))
      .slice(0, 5)
      .map((land) => ({
        name: land.propertyName,
        size: `${land.landSize} ${land.landSizeUnit}`,
        value: formatCurrency(land.estimatedValue),
        acquired: land.acquisitionDate.toISOString().split("T")[0],
      })),
    mostValuableLands: lands
      .sort((a, b) => b.estimatedValue - a.estimatedValue)
      .slice(0, 5)
      .map((land) => ({
        name: land.propertyName,
        value: formatCurrency(land.estimatedValue),
        location: land.address,
      })),
  };
};

const analyzeVehicles = (vehicles) => {
  const vehicleTypeDistribution = vehicles.reduce((acc, vehicle) => {
    const type = vehicle.vehicleType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const maintenanceStatus = vehicles.reduce(
    (acc, vehicle) => {
      if (!vehicle.nextServiceDue) return acc;
      const status =
        new Date(vehicle.nextServiceDue) < new Date()
          ? "Overdue"
          : "Up-to-date";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { Overdue: 0, "Up-to-date": 0 }
  );

  const totalValue = vehicles.reduce(
    (sum, vehicle) => sum + (vehicle.estimatedValue || 0),
    0
  );
  const averageMileage =
    vehicles.reduce((sum, vehicle) => {
      const mileage = parseInt(vehicle.mileage) || 0;
      return sum + mileage;
    }, 0) / (vehicles.length || 1);

  return {
    total: vehicles.length,
    totalValue: formatCurrency(totalValue),
    averageValue: formatCurrency(totalValue / (vehicles.length || 1)),
    vehicleTypeDistribution,
    maintenanceStatus,
    averageMileage: Math.round(averageMileage),
    newestVehicles: vehicles
      .filter((v) => v.year)
      .sort((a, b) => b.year - a.year)
      .slice(0, 5)
      .map((v) => ({
        makeModel: v.makeModel,
        year: v.year,
        value: formatCurrency(v.estimatedValue),
        mileage: v.mileage,
      })),
    mostExpensiveVehicles: vehicles
      .sort((a, b) => b.estimatedValue - a.estimatedValue)
      .slice(0, 5)
      .map((v) => ({
        makeModel: v.makeModel,
        value: formatCurrency(v.estimatedValue),
        assignedTo: v.assignedDriver,
      })),
  };
};

const analyzeHouses = (houses) => {
  const buildingTypeDistribution = houses.reduce((acc, house) => {
    const type = house.buildingType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const buildingUseDistribution = houses.reduce((acc, house) => {
    const use = house.currentBuildingUse || "Unknown";
    acc[use] = (acc[use] || 0) + 1;
    return acc;
  }, {});

  const totalValue = houses.reduce(
    (sum, house) => sum + (house.estimatedValue || 0),
    0
  );
  const averageArea =
    houses.reduce((sum, house) => sum + (house.totalArea || 0), 0) /
    (houses.length || 1);

  return {
    total: houses.length,
    totalValue: formatCurrency(totalValue),
    averageValue: formatCurrency(totalValue / (houses.length || 1)),
    buildingTypeDistribution,
    buildingUseDistribution,
    averageArea: Math.round(averageArea),
    newestHouses: houses
      .sort((a, b) => new Date(b.acquisitionDate) - new Date(a.acquisitionDate))
      .slice(0, 5)
      .map((h) => ({
        name: h.propertyName,
        type: h.buildingType,
        value: formatCurrency(h.estimatedValue),
        acquired: h.acquisitionDate.toISOString().split("T")[0],
      })),
    largestHouses: houses
      .sort((a, b) => (b.totalArea || 0) - (a.totalArea || 0))
      .slice(0, 5)
      .map((h) => ({
        name: h.propertyName,
        area: `${h.totalArea} sq.ft`,
        floors: h.floorCount,
      })),
  };
};

const analyzeInstitutions = (institutions) => {
  const institutionTypeDistribution = institutions.reduce((acc, inst) => {
    const type = inst.institutionType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const totalValue = institutions.reduce(
    (sum, inst) => sum + (inst.estimatedValue || 0),
    0
  );

  return {
    total: institutions.length,
    totalValue: formatCurrency(totalValue),
    averageValue: formatCurrency(totalValue / (institutions.length || 1)),
    institutionTypeDistribution,
    newestInstitutions: institutions
      .sort((a, b) => new Date(b.acquisitionDate) - new Date(a.acquisitionDate))
      .slice(0, 5)
      .map((inst) => ({
        name: inst.propertyName,
        type: inst.institutionType,
        value: formatCurrency(inst.estimatedValue),
        acquired: inst.acquisitionDate.toISOString().split("T")[0],
      })),
    mostValuableInstitutions: institutions
      .sort((a, b) => b.estimatedValue - a.estimatedValue)
      .slice(0, 5)
      .map((inst) => ({
        name: inst.propertyName,
        value: formatCurrency(inst.estimatedValue),
        location: inst.address,
      })),
  };
};

const analyzeOthers = (others) => {
  const totalValue = others.reduce(
    (sum, item) => sum + (item.estimatedValue || 0),
    0
  );

  return {
    total: others.length,
    totalValue: formatCurrency(totalValue),
    averageValue: formatCurrency(totalValue / (others.length || 1)),
    newestAdditions: others
      .sort((a, b) => new Date(b.acquisitionDate) - new Date(a.acquisitionDate))
      .slice(0, 5)
      .map((item) => ({
        name: item.propertyName,
        value: formatCurrency(item.estimatedValue),
        acquired: item.acquisitionDate.toISOString().split("T")[0],
      })),
  };
};

// Main report generation function
exports.generatePropertyReport = async (req, res) => {
  try {
    const { startDate, endDate, format = "json", state } = req.query;

    // Build the date filter
    const dateFilter = {};
    if (startDate) dateFilter.acquisitionDate = { $gte: new Date(startDate) };
    if (endDate) {
      dateFilter.acquisitionDate = dateFilter.acquisitionDate || {};
      dateFilter.acquisitionDate.$lte = new Date(endDate);
    }

    // Add state filter if provided
    if (state) {
      dateFilter.state = state;
    }

    // Get all properties by type
    const [lands, vehicles, houses, institutions, others] = await Promise.all([
      Property.find({ ...dateFilter, propertyType: "land" }),
      Property.find({ ...dateFilter, propertyType: "vehicle" }),
      Property.find({ ...dateFilter, propertyType: "house" }),
      Property.find({ ...dateFilter, propertyType: "institutions" }),
      Property.find({ ...dateFilter, propertyType: "others" }),
    ]);

    // Generate report data
    const reportData = {
      metadata: {
        generatedAt: new Date(),
        period: `${startDate || "Earliest record"} to ${endDate || "Now"}`,
        stateFilter: state || "All states",
      },
      summary: {
        totalProperties:
          lands.length +
          vehicles.length +
          houses.length +
          institutions.length +
          others.length,
        byType: {
          lands: lands.length,
          vehicles: vehicles.length,
          houses: houses.length,
          institutions: institutions.length,
          others: others.length,
        },
      },
      details: {
        lands: analyzeLands(lands),
        vehicles: analyzeVehicles(vehicles),
        houses: analyzeHouses(houses),
        institutions: analyzeInstitutions(institutions),
        others: analyzeOthers(others),
      },
    };

    // Generate in requested format
    switch (format.toLowerCase()) {
      case "pdf":
        return generatePDFReport(res, reportData);
      case "excel":
        return generateExcelReport(res, reportData);
      case "json":
      default:
        res.status(200).json({
          success: true,
          report: reportData,
        });
    }
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating property report",
      error: error.message,
    });
  }
};

// PDF Report Generation
const generatePDFReport = (res, data) => {
  const doc = new PDFDocument();
  const filename = `property-report-${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text("Benue State Government Property Report", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Report Period: ${data.metadata.period}`, { align: "center" });
  doc
    .fontSize(12)
    .text(`State: ${data.metadata.stateFilter}`, { align: "center" });
  doc
    .fontSize(12)
    .text(`Generated on: ${data.metadata.generatedAt.toLocaleString()}`, {
      align: "center",
    });
  doc.moveDown(2);

  // Summary Section
  doc.fontSize(16).text("Summary", { underline: true });
  doc.fontSize(12).text(`Total Properties: ${data.summary.totalProperties}`);
  doc.moveDown();

  // Summary Table
  const summaryTable = {
    headers: ["Property Type", "Count", "Percentage"],
    rows: Object.entries(data.summary.byType).map(([type, count]) => [
      type.charAt(0).toUpperCase() + type.slice(1),
      count,
      `${Math.round((count / data.summary.totalProperties) * 100)}%`,
    ]),
  };

  drawTable(doc, summaryTable);
  doc.moveDown();

  // Add page break if needed
  //addPageBreakIfNeeded(doc);

  // Detailed Sections
  doc.fontSize(16).text("Detailed Analysis", { underline: true });
  doc.moveDown();

  // Land Details
  doc.fontSize(14).text("Land Properties", { underline: true });
  doc.fontSize(12).text(`Total Land: ${data.details.lands.total}`);
  doc.fontSize(12).text(`Total Area: ${data.details.lands.totalSize} hectares`);
  doc.fontSize(12).text(`Total Value: ${data.details.lands.totalValue}`);
  doc.moveDown();

  // Add more sections for other property types...

  doc.end();
};

// Helper function to draw tables in PDF
const drawTable = (doc, table) => {
  const startX = 50;
  let startY = doc.y;
  const cellPadding = 5;
  const colWidths = [150, 80, 80];

  // Draw headers
  doc.font("Helvetica-Bold");
  table.headers.forEach((header, i) => {
    doc.text(
      header,
      startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
      startY,
      {
        width: colWidths[i],
        align: "left",
      }
    );
  });

  // Draw rows
  doc.font("Helvetica");
  table.rows.forEach((row, rowIndex) => {
    startY += 20;
    row.forEach((cell, i) => {
      doc.text(
        cell.toString(),
        startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        startY,
        {
          width: colWidths[i],
          align: "left",
        }
      );
    });
  });
};

// Excel Report Generation
const generateExcelReport = async (res, data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Property Summary");
  const filename = `property-report-${
    new Date().toISOString().split("T")[0]
  }.xlsx`;

  // Set headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // Add summary sheet
  worksheet.columns = [
    { header: "Property Type", key: "type", width: 20 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
    { header: "Total Value", key: "value", width: 20 },
  ];

  // Add summary data
  Object.entries(data.summary.byType).forEach(([type, count]) => {
    const detail = data.details[type];
    worksheet.addRow({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: `${Math.round(
        (count / data.summary.totalProperties) * 100
      )}%`,
      value: detail ? detail.totalValue : "N/A",
    });
  });

  // Add detailed sheets for each property type
  addDetailedSheet(workbook, "Lands", data.details.lands);
  addDetailedSheet(workbook, "Vehicles", data.details.vehicles);
  addDetailedSheet(workbook, "Houses", data.details.houses);
  addDetailedSheet(workbook, "Institutions", data.details.institutions);
  addDetailedSheet(workbook, "Others", data.details.others);

  await workbook.xlsx.write(res);
  res.end();
};

const addDetailedSheet = (workbook, name, data) => {
  const worksheet = workbook.addWorksheet(name);

  // Add summary info
  worksheet.addRow([`${name} Summary`]).font = { bold: true };
  worksheet.addRow(["Total", data.total]);
  if (data.totalValue) worksheet.addRow(["Total Value", data.totalValue]);
  if (data.averageValue) worksheet.addRow(["Average Value", data.averageValue]);
  worksheet.addRow([]);

  // Add distributions
  if (
    data.landUseDistribution ||
    data.vehicleTypeDistribution ||
    data.buildingTypeDistribution
  ) {
    worksheet.addRow(["Distribution"]).font = { bold: true };
    const distribution =
      data.landUseDistribution ||
      data.vehicleTypeDistribution ||
      data.buildingTypeDistribution ||
      {};
    Object.entries(distribution).forEach(([key, value]) => {
      worksheet.addRow([key, value]);
    });
    worksheet.addRow([]);
  }

  // Add top items
  if (data.newestAcquisitions || data.newestVehicles || data.newestHouses) {
    const items =
      data.newestAcquisitions || data.newestVehicles || data.newestHouses || [];
    if (items.length > 0) {
      worksheet.addRow(["Newest Additions"]).font = { bold: true };
      const headers = Object.keys(items[0]);
      worksheet.addRow(headers);
      items.forEach((item) => {
        worksheet.addRow(headers.map((h) => item[h]));
      });
    }
  }
};
