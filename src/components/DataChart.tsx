import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface DataChartProps {
  data: DataPoint[];
  title: string;
}

const DataChart: React.FC<DataChartProps> = ({ data, title }) => {
  const seriesName = Object.keys(data[0]).find(key => key !== 'date') || 'Value';

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: seriesName,
        data: data.map(item => Object.values(item).find(val => typeof val === 'number')),
        borderColor: 'rgb(0, 255, 0)', // Changed to green (0, 255, 0)
        tension: 0.1,
        fill: false,
        pointRadius: 0, // Remove points
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'line',
          padding: 20,
          color: 'white', // Changed label color to white
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          color: 'white', // Keep x-axis label color white
        },
        position: 'bottom' as const,
        grid: {
          display: true, // Show x-axis grid lines
          color: 'rgba(128, 128, 128, 0.2)', // Light gray color for grid lines
        },
        border: {
          color: 'white', // Make x-axis line white
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white', // Keep y-axis label color white
        },
        grid: {
          display: true, // Show y-axis grid lines
          color: 'rgba(128, 128, 128, 0.2)', // Light gray color for grid lines
        },
        border: {
          color: 'white', // Make y-axis line white
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,  // Further reduced top padding
        bottom: 30,  // Increased bottom padding to shift the chart upwards
      },
    },
    elements: {
      point: {
        radius: 0, // Remove points
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1, minHeight: 0, marginTop: '-20px' }}>  {/* Added negative margin to shift chart up */}
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DataChart;
