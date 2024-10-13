import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartData {
  index: string;
  [key: string]: string | number;
}

interface DataChartProps {
  data: ChartData[];
  title: string;
}

const DataChart: React.FC<DataChartProps> = ({ data, title }) => {
  const [showZScore, setShowZScore] = useState(false);
  const [zScoreWindow, setZScoreWindow] = useState(90);
  const [lookbackPeriod, setLookbackPeriod] = useState('Y');
  const [visibleDatasets, setVisibleDatasets] = useState<{ [key: string]: boolean }>({});

  if (!data || data.length === 0) {
    return <div>No data available for {title}</div>;
  }

  // Get all series names (excluding 'index')
  const seriesNames = Object.keys(data[0]).filter(key => key !== 'index');

  const calculateZScore = (values: (number | null)[], window: number) => {
    const result: (number | null)[] = [];
    let sum = 0;
    let sumSquared = 0;
    let count = 0;

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value !== null) {
        sum += value;
        sumSquared += value * value;
        count++;

        if (count > window) {
          const oldValue = values[i - window];
          if (oldValue !== null) {
            sum -= oldValue;
            sumSquared -= oldValue * oldValue;
            count--;
          }
        }

        if (count >= 2) {
          const mean = sum / count;
          const variance = (sumSquared / count) - (mean * mean);
          const stdDev = Math.sqrt(variance);
          result.push(stdDev === 0 ? null : (value - mean) / stdDev);
        } else {
          result.push(null);
        }
      } else {
        result.push(null);
      }
    }

    return result;
  };

  const zScoreData = useMemo(() => {
    if (!showZScore) return {};

    const result: { [key: string]: (number | null)[] } = {};
    seriesNames.forEach(seriesName => {
      if (seriesName !== 'btc_price') {
        const seriesData = data.map(item => typeof item[seriesName] === 'number' ? item[seriesName] as number : null);
        result[seriesName] = calculateZScore(seriesData, zScoreWindow);
      }
    });
    return result;
  }, [showZScore, zScoreWindow, data, seriesNames]);

  const getFilteredData = () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate);

    switch (lookbackPeriod) {
      case 'M':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'Q':
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      case 'YTD':
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case 'Y':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'AT':
      default:
        return data;
    }

    return data.filter(item => new Date(item.index) >= startDate);
  };

  const filteredData = useMemo(() => getFilteredData(), [data, lookbackPeriod]);

  const chartData = useMemo(() => ({
    labels: filteredData.map(item => item.index),
    datasets: seriesNames.flatMap((seriesName, index) => {
      const seriesData = filteredData.map(item => typeof item[seriesName] === 'number' ? item[seriesName] as number : null);
      const datasets = [];

      const getSeriesColor = (seriesIndex: number) => {
        if (seriesName === 'btc_price') return 'rgb(100, 100, 100)';
        if (seriesIndex === 0) return 'rgb(0, 255, 255)';  // First series is now cyan
        if (seriesIndex === 1) return 'rgb(255, 0, 255)';  // Second non-btc_price series
        return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      };

      const seriesColor = getSeriesColor(index);

      if (!showZScore || seriesName === 'btc_price') {
        datasets.push({
          label: seriesName,
          data: seriesData,
          borderColor: seriesColor,
          backgroundColor: seriesColor,
          tension: 0.1,
          yAxisID: seriesName === 'btc_price' ? 'y1' : 'y',
          pointRadius: 0,
          borderWidth: seriesName === 'btc_price' ? 1 : 1,
          hidden: visibleDatasets[seriesName] === false,
        });
      } else {
        const filteredZScoreData = zScoreData[seriesName]?.slice(-filteredData.length) || [];
        datasets.push({
          label: `${seriesName} Z-Score (${zScoreWindow} periods)`,
          data: filteredZScoreData,
          borderColor: seriesColor,
          backgroundColor: seriesColor,
          tension: 0.1,
          yAxisID: 'y',
          pointRadius: 0,
          borderWidth: 1,
          hidden: visibleDatasets[`${seriesName} Z-Score (${zScoreWindow} periods)`] === false,
        });
      }

      return datasets;
    })
  }), [filteredData, seriesNames, showZScore, zScoreWindow, zScoreData, visibleDatasets]);

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
        display: false,
      },
      legend: {
        display: false,
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
        display: true,
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
        display: seriesNames.includes('btc_price'),
        position: 'right' as const,
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const toggleDatasetVisibility = (datasetLabel: string) => {
    setVisibleDatasets(prev => ({
      ...prev,
      [datasetLabel]: !prev[datasetLabel]
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <div style={{ height: 'calc(100% - 20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ color: 'rgb(255, 255, 255)', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
              {title.split(' ').map(word => word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', border: '1px solid rgb(128, 128, 128)', borderRadius: '4px', overflow: 'hidden' }}>
                <span style={{ color: 'rgb(255, 255, 255)', padding: '3px 8px', borderRight: '1px solid rgb(128, 128, 128)' }}>Lookback</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {['M', 'Q', 'YTD', 'Y', 'AT'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setLookbackPeriod(period)}
                      style={{
                        backgroundColor: lookbackPeriod === period ? 'rgb(0, 255, 255)' : 'transparent',
                        color: lookbackPeriod === period ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
                        border: 'none',
                        padding: '3px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', border: '1px solid rgb(128, 128, 128)', borderRadius: '4px', overflow: 'hidden' }}>
                <span style={{ color: 'rgb(255, 255, 255)', padding: '3px 8px', borderRight: '1px solid rgb(128, 128, 128)' }}>Z-Score</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {['30', '90', '180', '365'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        if (showZScore && zScoreWindow === parseInt(period)) {
                          setShowZScore(false);
                        } else {
                          setShowZScore(true);
                          setZScoreWindow(parseInt(period));
                        }
                      }}
                      style={{
                        backgroundColor: showZScore && zScoreWindow === parseInt(period) ? 'rgb(0, 255, 255)' : 'transparent',
                        color: showZScore && zScoreWindow === parseInt(period) ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
                        border: 'none',
                        padding: '3px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgb(128, 128, 128)', marginBottom: '10px' }}></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            {chartData.datasets.map((dataset, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginLeft: '15px', 
                  cursor: 'pointer',
                  opacity: dataset.hidden ? 0.5 : 1
                }}
                onClick={() => toggleDatasetVisibility(dataset.label)}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dataset.borderColor, marginRight: '5px' }}></div>
                <span style={{ color: 'rgb(255, 255, 255)', fontSize: '11px' }}>{dataset.label}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataChart;
