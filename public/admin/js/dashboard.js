// $(function () {


//   // =====================================
//   // Profit
//   // =====================================
//   var chart = {
//     series: [
//       { name: "Earnings this month:", data: [355, 390, 300, 350, 390, 180, 355, 390] },
//       { name: "Expense this month:", data: [280, 250, 325, 215, 250, 310, 280, 250] },
//     ],

//     chart: {
//       type: "bar",
//       height: 345,
//       offsetX: -15,
//       toolbar: { show: true },
//       foreColor: "#adb0bb",
//       fontFamily: 'inherit',
//       sparkline: { enabled: false },
//     },


//     colors: ["#5D87FF", "#49BEFF"],


//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: "35%",
//         borderRadius: [6],
//         borderRadiusApplication: 'end',
//         borderRadiusWhenStacked: 'all'
//       },
//     },
//     markers: { size: 0 },

//     dataLabels: {
//       enabled: false,
//     },


//     legend: {
//       show: false,
//     },


//     grid: {
//       borderColor: "rgba(0,0,0,0.1)",
//       strokeDashArray: 3,
//       xaxis: {
//         lines: {
//           show: false,
//         },
//       },
//     },

//     xaxis: {
//       type: "category",
//       categories: ["16/08", "17/08", "18/08", "19/08", "20/08", "21/08", "22/08", "23/08"],
//       labels: {
//         style: { cssClass: "grey--text lighten-2--text fill-color" },
//       },
//     },


//     yaxis: {
//       show: true,
//       min: 0,
//       max: 400,
//       tickAmount: 4,
//       labels: {
//         style: {
//           cssClass: "grey--text lighten-2--text fill-color",
//         },
//       },
//     },
//     stroke: {
//       show: true,
//       width: 3,
//       lineCap: "butt",
//       colors: ["transparent"],
//     },


//     tooltip: { theme: "light" },

//     responsive: [
//       {
//         breakpoint: 600,
//         options: {
//           plotOptions: {
//             bar: {
//               borderRadius: 3,
//             }
//           },
//         }
//       }
//     ]


//   };

//   var chart = new ApexCharts(document.querySelector("#chart"), chart);
//   chart.render();


//   // =====================================
//   // Breakup
//   // =====================================
//   var breakup = {
//     color: "#adb5bd",
//     series: [38, 40, 25],
//     labels: ["2022", "2021", "2020"],
//     chart: {
//       width: 180,
//       type: "donut",
//       fontFamily: "Plus Jakarta Sans', sans-serif",
//       foreColor: "#adb0bb",
//     },
//     plotOptions: {
//       pie: {
//         startAngle: 0,
//         endAngle: 360,
//         donut: {
//           size: '75%',
//         },
//       },
//     },
//     stroke: {
//       show: false,
//     },

//     dataLabels: {
//       enabled: false,
//     },

//     legend: {
//       show: false,
//     },
//     colors: ["#5D87FF", "#ecf2ff", "#F9F9FD"],

//     responsive: [
//       {
//         breakpoint: 991,
//         options: {
//           chart: {
//             width: 150,
//           },
//         },
//       },
//     ],
//     tooltip: {
//       theme: "dark",
//       fillSeriesColor: false,
//     },
//   };

//   var chart = new ApexCharts(document.querySelector("#breakup"), breakup);
//   chart.render();



//   // =====================================
//   // Earning
//   // =====================================
//   var earning = {
//     chart: {
//       id: "sparkline3",
//       type: "area",
//       height: 60,
//       sparkline: {
//         enabled: true,
//       },
//       group: "sparklines",
//       fontFamily: "Plus Jakarta Sans', sans-serif",
//       foreColor: "#adb0bb",
//     },
//     series: [
//       {
//         name: "Earnings",
//         color: "#49BEFF",
//         data: [25, 66, 20, 40, 12, 58, 20],
//       },
//     ],
//     stroke: {
//       curve: "smooth",
//       width: 2,
//     },
//     fill: {
//       colors: ["#f3feff"],
//       type: "solid",
//       opacity: 0.05,
//     },

//     markers: {
//       size: 0,
//     },
//     tooltip: {
//       theme: "dark",
//       fixed: {
//         enabled: true,
//         position: "right",
//       },
//       x: {
//         show: false,
//       },
//     },
//   };
//   new ApexCharts(document.querySelector("#earning"), earning).render();
// })

(function ($) {
  "use strict";

  function generateChartData(dataset) {
    var months = [];
    var counts = [];
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var currentMonth = currentDate.getMonth() + 1;

    for (var i = 1; i <= 12; i++) {
      var dataPoint = dataset.find(function (item) {
        return item.year === currentYear && item.month === i;
      });
      if (dataPoint) {
        months.push(i);
        counts.push(dataPoint.count);
      } else {
        months.push(i);
        counts.push(0);
      }
    }
    return { months, counts };
  }

  
  const usersData = JSON.parse(document.getElementById("usersData").value);
  const productSold = JSON.parse(document.getElementById("productSold").value);

  /*Sale statistics Chart*/
  if ($("#myChart").length) {
    var ctx = document.getElementById("myChart").getContext("2d");
   
    const chartDataUsers = generateChartData(usersData);
    const chartDataProductsold = generateChartData(productSold);
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "line",

      // The data for our dataset
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
         
          {
            label: "Visitors",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(4, 209, 130, 0.2)",
            borderColor: "rgb(4, 209, 130)",
            data: chartDataUsers.counts,
          },
          // {
          //   label: "Products Sold",
          //   tension: 0.3,
          //   fill: true,
          //   backgroundColor: "rgba(380, 200, 230, 0.2)",
          //   borderColor: "rgb(380, 200, 230)",
          //   data: chartDataProductsold.counts,
          // },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      },
    });
  } //End if
})(jQuery);



  document.addEventListener("DOMContentLoaded", function () {
    if ($("#saleChart").length) {
      var saleCtx = document.getElementById("saleChart").getContext("2d");
      var saleChart;
      var filter = "year";

      function updateChart(salesData) {
        if (saleChart) {
          saleChart.destroy();
        }

        var chartLabels = salesData.map((item) =>
          // isYear ? item.year : item.month
          filter === "year"
            ? item.year
            : filter === "month"
            ? item.month
            : item.week
        );
        var salesValues = salesData.map((item) => item.sales);

        saleChart = new Chart(saleCtx, {
          type: "line",
          data: {
            labels: chartLabels,
            datasets: [
              {
                label: "Sales",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(44, 120, 220, 0.2)",
                borderColor: "rgba(44, 120, 220)",
                data: salesValues,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            },
          },
        });
      }

      function fetchSalesData(endpoint) {
        fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
            updateChart(data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }

      // Initial fetch for monthly sales data
      filter = "month";
      fetchSalesData("/admin/sales-data"); // Assuming this fetches monthly sales data

      // Monthly button click event
      document
        .getElementById("monthlyBtn")
        .addEventListener("click", function () {
          filter = "month";
          fetchSalesData("/admin/sales-data"); // Fetch monthly sales data on button click
        });

      // Yearly button click event
      document
        .getElementById("yearlyBtn")
        .addEventListener("click", function () {
          filter = "year";
          fetchSalesData("/admin/sales-data/yearly"); // Fetch yearly sales data on button click
        });

      // Yearly button click event
      document
        .getElementById("weeklyBtn")
        .addEventListener("click", function () {
          filter = "week";
          fetchSalesData("/admin/sales-data/weekly"); // Fetch yearly sales data on button click
        });
    }
  });
