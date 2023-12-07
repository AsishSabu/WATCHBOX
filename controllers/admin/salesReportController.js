
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
      console.log(fromDate);
      const toDate = new Date(req.query.toDate);
      console.log(toDate);
    const salesData = await Order.find({
      orderedDate: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).select("orderId totalPrice orderedDate payment_method -_id");
      
      // console.log(salesData);

    res.status(200).json(salesData);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// exports.getSalesData = async (req, res) => {
//   try {
//     const pipeline = [
//       {
//         $project: {
//           week: { $isoWeek: "$orderedDate" },
//           year: { $isoWeekYear: "$orderedDate" },
//           totalPrice: 1,
//         },
//       },
//       {
//         $group: {
//           _id: { year: "$year", week: "$week" },
//           totalSales: { $sum: "$totalPrice" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           week: {
//             $concat: [
//               { $toString: "$_id.year" },
//               "-W",
//               {
//                 $cond: {
//                   if: { $lt: ["$_id.week", 10] },
//                   then: { $concat: ["0", { $toString: "$_id.week" }] },
//                   else: { $toString: "$_id.week" },
//                 },
//               },
//             ],
//           },
//           sales: "$totalSales",
//         },
//       },
//     ];

//     const weeklySalesArray = await Order.aggregate(pipeline);

//     res.json(weeklySalesArray);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };