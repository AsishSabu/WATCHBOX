
const expressHandler = require("express-async-handler");
const Order=require("../../models/orderModel")



exports.salesReportpage = expressHandler(async (req, res) => {
    try {
        res.render("admin/pages/sales-report", { title: "Sales Report" });
    } catch (error) {
        throw new Error(error);
    }
});

exports.generateSalesReport = async (req, res, next) => {
  try {
      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);
    const salesData = await Order.find({
      orderedDate: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).select("orderId totalPrice orderedDate payment_method -_id");
    res.status(200).json(salesData);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getSalesData = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          "orderItems.status": "Delivered",
        },
      },
      {
        $project: {
          year: { $year: "$orderedDate" },
          month: { $month: "$orderedDate" },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" },
                },
              },
            ],
          },
          sales: "$totalSales",
        },
      },
    ];

    const monthlySalesArray = await Order.aggregate(pipeline);

    res.json(monthlySalesArray);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get Sales Data yearly
 * Method GET
 */
exports. getSalesDataYearly = async (req, res) => {
  try {
    const yearlyPipeline = [
      {
        $match: {
          "orderItems.status": "Delivered",
        },
      },

      {
        $project: {
          year: { $year: "$orderedDate" },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          year: { $toString: "$_id.year" },
          sales: "$totalSales",
        },
      },
    ];

    const yearlySalesArray = await Order.aggregate(yearlyPipeline);

    res.json(yearlySalesArray);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * get sales data weekly
 * method get
 */
exports.getSalesDataWeekly = async (req, res) => {
  try {
    const weeklySalesPipeline = [
      {
        $match: {
          "orderItems.status": "Delivered",
        },
      },
      {
        $project: {
          week: { $week: "$orderedDate" },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: { week: { $mod: ["$week", 7] } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          week: { $toString: "$_id.week" },
          dayOfWeek: { $add: ["$_id.week", 1] },
          sales: "$totalSales",
        },
      },
      {
        $sort: { dayOfWeek: 1 },
      },
    ];

    const weeklySalesArray = await Order.aggregate(weeklySalesPipeline);

    res.json(weeklySalesArray);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};



