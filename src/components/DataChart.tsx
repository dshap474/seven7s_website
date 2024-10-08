import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Crosshair from 'chartjs-plugin-crosshair';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Crosshair);

interface ChartData {
  index: string;
  [key: string]: string | number;
  btc_price: number;
}

interface DataChartProps {
  data: ChartData[];
  title: string;
}

const DataChart: React.FC<DataChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div>No data available for {title}</div>;
  }

  const chartData = {
    labels: data.map(item => item.index),
    datasets: [
      {
        label: title,
        data: data.map(item => {
          const value = Object.values(item).find(val => typeof val === 'number' && val !== item.btc_price);
          return value !== undefined ? value : null;
        }),
        borderColor: 'rgb(0, 255, 0)',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        tension: 0.1,
        yAxisID: 'y',
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'BTC Price',
        data: data.map(item => item.btc_price),
        borderColor: 'rgb(128, 128, 128)',
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      crosshair: {
        line: {
          color: 'rgb(128, 128, 128)',  // Gray color for crosshair
          width: 1
        },
        sync: {
          enabled: true,
          group: 1,
          suppressTooltips: false
        },
        zoom: {
          enabled: false,
        },
        horizontal: {
          enabled: true,
          lineColor: 'rgb(128, 128, 128)',
          lineWidth: 1,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
          color: 'rgb(255, 255, 255)',
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.2)',
        },
        border: {
          color: 'rgb(128, 128, 128)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'rgb(255, 255, 255)',
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.2)',
        },
        border: {
          color: 'rgb(128, 128, 128)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'rgb(255, 255, 255)',
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(128, 128, 128, 0.2)',
        },
        border: {
          color: 'rgb(128, 128, 128)',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default DataChart;