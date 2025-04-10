"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ApplicationStats {
  pending: number
  reviewed: number
  interviewed: number
  offered: number
  rejected: number
}

export function RecruiterApplicationsChart({ data }: { data: ApplicationStats }) {
  const chartData = {
    labels: ["Pending", "Reviewed", "Interviewed", "Offered", "Rejected"],
    datasets: [
      {
        label: "Applications",
        data: [data.pending, data.reviewed, data.interviewed, data.offered, data.rejected],
        backgroundColor: [
          "rgba(234, 179, 8, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(0, 180, 216, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgb(234, 179, 8)",
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(0, 180, 216)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  )
}
