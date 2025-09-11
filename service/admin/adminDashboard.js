// Define a generic dashboard model class
class DashboardService {
  constructor(model) {
    this.model = model; // Mongoose model for the collection
  }

  // Get the count of documents in a collection
  getUserCount = async () => {
    return await this.model.countDocuments({});
  };

  // Get the count of active users based on a field
  getActiveUsersCount = async (field, value) => {
    return await this.model.countDocuments({ [field]: value });
  };

  // Get the count of transactions
  getTransactionsCount = async () => {
    return await this.model.countDocuments({});
  };

  // Get the count of pending transactions based on a field
  getPendingTransactionsCount = async (field, value) => {
    return await this.model.countDocuments({ [field]: value });
  };

  // Get the count of access points based on a field
  getAccessPointCount = async (field, value) => {
    return await this.model.countDocuments({ [field]: value });
  };

  // Get the count of wallets
  getWalletsCount = async () => {
    return await this.model.countDocuments({});
  };

  // Get the sum of wallet fundings based on a field
  getSumOfWalletFundings = async (field, value) => {
    return await this.model.aggregate([
      { $match: { [field]: value } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  };

  // Get the sum of transactions based on two fields
  getSumOfTransactions = async (field1, value1, field2, value2) => {
    return await this.model.aggregate([
      { $match: { [field1]: { $ne: value1 }, [field2]: value2 } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  };

  // Get chart data for different airtime categories
  getAirtimeChartData = async (field, value) => {
    return await this.model.aggregate([
      { $match: { [field]: value } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  };

  // Get chart data for different data categories
  getDataChartData = async (field, value) => {
    return await this.model.aggregate([
      { $match: { [field]: value } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  };
 // Get chart data for different cable categories
 getCableChartData = async (field, value) => {
    return await this.model.aggregate([
      { $match: { [field]: value } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  };

   // Get transactions
   getTransactions = async (page, limit, filter = {}) => {
    // Calculate the number of documents to skip based on the page number and limit
    const skip = (page - 1) * limit;
  
    // Fetch transactions with pagination and optional filter
    return await this.model.find(filter)
                            .skip(skip)
                            .limit(limit)
                            .exec();
  };

  // Get users 
  getUsers = async (page, limit, filter = {}) => {
    // Calculate the number of documents to skip based on the page number and limit
    const skip = (page - 1) * limit;
  
    // Fetch transactions with pagination and optional filter
    return await this.model.find(filter)
                            .skip(skip)
                            .limit(limit)
                            .exec();
  };


  getElectricChartData = async (field, value) => {
    return await this.model.aggregate([
      { $match: { [field]: value } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  };




  // Monthly funding and transaction bar chart data
  getMonthlyFundingBarChartData = async (field1, value1, field2, value2) => {
    return await this.model.aggregate([
      {
        $match: {
          [field1]: value1,
          [field2]: {
            $gte: new Date(new Date().getFullYear(), value2 - 1, 1),
            $lt: new Date(new Date().getFullYear(), value2, 1),
          },
        },
      },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
    ]);
  };

  getMonthlyTransactionBarChartData = async (
    field1,
    value1,
    field2,
    value2
  ) => {
    return await this.model.aggregate([
      {
        $match: {
          [field1]: { $ne: value1 },
          [field2]: {
            $gte: new Date(new Date().getFullYear(), value2 - 1, 1),
            $lt: new Date(new Date().getFullYear(), value2, 1),
          },
        },
      },
      {
        $group: { _id: { $month: "$created_at" }, total: { $sum: "$amount" } },
      },
    ]);
  };
}

module.exports = DashboardService;
