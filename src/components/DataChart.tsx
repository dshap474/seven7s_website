import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const [showZScore, setShowZScore] = useState(false);
  const [zScoreWindow, setZScoreWindow] = useState(90);
  const [zScoreData, setZScoreData] = useState<(number | null)[]>([]);
  const [lookbackDays, setLookbackDays] = useState(365);
  const [useLookback, setUseLookback] = useState(true);

  if (!data || data.length === 0) {
    return <div>No data available for {title}</div>;
  }

  useEffect(() => {
    const calculateZScore = (values: (number | null)[], window: number) => {
      return values.map((_, index, array) => {
        const windowSlice = array.slice(Math.max(0, index - window + 1), index + 1).filter((v): v is number => v !== null);
        if (windowSlice.length < 2) return null;
        const mean = windowSlice.reduce((sum, val) => sum + val, 0) / windowSlice.length;
        const stdDev = Math.sqrt(windowSlice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowSlice.length);
        return stdDev === 0 ? null : ((array[index] as number) - mean) / stdDev;
      });
    };

    if (showZScore) {
      const mainData = data.map(item => {
        const value = Object.values(item).find(val => typeof val === 'number' && val !== item.btc_price);
        return value !== undefined ? value : null;
      });

      const fullZScoreData = calculateZScore(mainData as (number | null)[], zScoreWindow);
      setZScoreData(fullZScoreData);
    }
  }, [showZScore, zScoreWindow, data]);

  const filteredData = useLookback ? data.slice(-lookbackDays) : data;
  const filteredZScoreData = useLookback ? zScoreData.slice(-lookbackDays) : zScoreData;

  const chartData = {
    labels: filteredData.map(item => item.index),
    datasets: [
      ...(showZScore ? [] : [{
        label: title,
        data: filteredData.map(item => {
          const value = Object.values(item).find(val => typeof val === 'number' && val !== item.btc_price);
          return value !== undefined ? value : null;
        }),
        borderColor: 'rgb(0, 255, 255)',
        backgroundColor: 'rgb(0, 255, 255)',
        tension: 0.1,
        yAxisID: 'y',
        pointRadius: 0,
        borderWidth: 1,
      }]),
      {
        label: 'BTC Price',
        data: filteredData.map(item => item.btc_price),
        borderColor: 'rgb(128, 128, 128)',
        backgroundColor: 'rgb(128, 128, 128)',
        tension: 0.1,
        yAxisID: 'y1',
        pointRadius: 0,
        borderWidth: 1,
      },
      ...(showZScore ? [{
        label: `${title} Z-Score (${zScoreWindow} periods)`,
        data: filteredZScoreData,
        borderColor: 'rgb(0, 255, 255)',
        backgroundColor: 'rgb(0, 255, 255)',
        tension: 0.1,
        yAxisID: 'y2',
        pointRadius: 0,
        borderWidth: 1,
      }] : [])
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: title,
        position: 'top' as const,
        align: 'start' as const,
        color: 'rgb(255, 255, 255)',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          boxHeight: 6,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: '#131722',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(31, 41, 55)',
        borderWidth: 1,
        padding: 15,
        titleFont: {
          size: 11,
        },
        bodyFont: {
          size: 11,
        },
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 6,
        boxHeight: 6,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let value = '';
            if (context.parsed.y !== null) {
              value = context.parsed.y.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }
            return `${label}  |  ${value}`;
          }
        },
        bodyAlign: 'left',
        titleAlign: 'left',
        position: 'nearest',
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
          color: 'rgb(255, 255, 255)',
        },
        grid: {
          display: false,
        },
        border: {
          color: 'rgb(128, 128, 128)',
        },
        position: 'bottom' as const,
      },
      y: {
        type: 'linear' as const,
        display: !showZScore,
        position: 'left' as const,
        ticks: {
          color: 'rgb(255, 255, 255)',
        },
        grid: {
          display: false,
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
          display: false,
        },
        border: {
          color: 'rgb(128, 128, 128)',
        },
      },
      ...(showZScore ? {
        y2: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          ticks: {
            color: 'rgb(0, 255, 255)',
          },
          grid: {
            display: false,
          },
          border: {
            color: 'rgb(0, 255, 255)',
          },
        },
      } : {})
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <div style={{ height: 'calc(100% - 20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Removed the Use Lookback checkbox and input from here */}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '10px' }}>
                <input
                  type="checkbox"
                  checked={useLookback}
                  onChange={(e) => setUseLookback(e.target.checked)}
                />
                Use Lookback
              </label>
              {useLookback && (
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                  <input
                    type="number"
                    value={lookbackDays}
                    onChange={(e) => setLookbackDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    style={{
                      width: '60px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgb(255, 255, 255)',
                      border: '1px solid rgb(255, 255, 255)',
                      borderRadius: '4px',
                      padding: '2px 5px'
                    }}
                  />
                  <span style={{ marginLeft: '5px', color: 'rgb(255, 255, 255)' }}>days</span>
                </div>
              )}
              <label style={{ marginRight: '10px' }}>
                <input
                  type="checkbox"
                  checked={showZScore}
                  onChange={(e) => setShowZScore(e.target.checked)}
                />
                Show Z-Score
              </label>
              {showZScore && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={zScoreWindow}
                    onChange={(e) => setZScoreWindow(Math.max(2, parseInt(e.target.value) || 2))}
                    min="2"
                    style={{
                      width: '60px',
                      backgroundColor: 'rgba(0, 255, 255, 0.1)',
                      color: 'rgb(255, 255, 255)',
                      border: '1px solid rgb(0, 255, 255)',
                      borderRadius: '4px',
                      padding: '2px 5px'
                    }}
                  />
                  <span style={{ marginLeft: '5px', color: 'rgb(255, 255, 255)' }}>periods</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ height: 'calc(100% - 30px)' }}>
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataChart;
