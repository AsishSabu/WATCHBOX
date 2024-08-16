

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
