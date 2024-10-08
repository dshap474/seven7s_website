import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
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
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: title,
        data: data.map(item => Object.values(item).find(val => typeof val === 'number')),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default DataChart;
