'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface RevenueData {
  month: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: '월별 수익',
        data: data.map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '월별 수익 현황',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
            }).format(value)
          },
        },
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />
    </div>
  )
}
