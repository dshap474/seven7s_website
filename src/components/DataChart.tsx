import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Crosshair from 'chartjs-plugin-crosshair';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Crosshair
);

// Define color variables
const CHART_COLORS = {
  btcPrice: 'rgb(100, 100, 100)',
  firstSeries: 'rgb(0, 255, 255)',
  secondSeries: 'rgb(255, 0, 255)',
  background: '#131722',
  text: 'rgb(255, 255, 255)',
  border: 'rgb(31, 41, 55)',
  gridLines: 'rgb(128, 128, 128)',
  highlight: '#00ffff',
  accent: '#FF6A00',
};

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
  const [isPopout, setIsPopout] = useState(false);
  const [movingAveragePeriod, setMovingAveragePeriod] = useState<number | null>(null);

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

  const calculateMovingAverage = (values: (number | null)[], window: number): (number | null)[] => {
    const result: (number | null)[] = [];
    let sum = 0;
    let count = 0;

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value !== null) {
        sum += value;
        count++;

        if (count > window) {
          const oldValue = values[i - window];
          if (oldValue !== null) {
            sum -= oldValue;
            count--;
          }
        }

        if (count === window) {
          result.push(sum / count);
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

  const movingAverages = useMemo(() => {
    const result: { [key: string]: { [key: number]: (number | null)[] } } = {};
    seriesNames.forEach(seriesName => {
      if (seriesName !== 'btc_price') {
        const seriesData = data.map(item => typeof item[seriesName] === 'number' ? item[seriesName] as number : null);
        const zScores = showZScore ? zScoreData[seriesName] : seriesData;
        result[seriesName] = {
          30: calculateMovingAverage(zScores || seriesData, 30),
          90: calculateMovingAverage(zScores || seriesData, 90),
          180: calculateMovingAverage(zScores || seriesData, 180),
          365: calculateMovingAverage(zScores || seriesData, 365),
        };
      }
    });
    return result;
  }, [data, seriesNames, showZScore, zScoreData]);

  const chartData = useMemo(() => ({
    labels: filteredData.map(item => item.index),
    datasets: seriesNames.flatMap((seriesName, index) => {
      const seriesData = filteredData.map(item => typeof item[seriesName] === 'number' ? item[seriesName] as number : null);
      const datasets = [];

      const getSeriesColor = (seriesIndex: number) => {
        if (seriesName === 'btc_price') return CHART_COLORS.btcPrice;
        if (seriesIndex === 0) return CHART_COLORS.firstSeries;
        if (seriesIndex === 1) return CHART_COLORS.secondSeries;
        return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      };

      const seriesColor = getSeriesColor(index);

      let dataToUse = seriesData;
      let label = seriesName;

      if (showZScore && seriesName !== 'btc_price') {
        dataToUse = zScoreData[seriesName]?.slice(-filteredData.length) || [];
        label = `${seriesName} Z-Score (${zScoreWindow} periods)`;
      }

      if (movingAveragePeriod && seriesName !== 'btc_price') {
        dataToUse = movingAverages[seriesName][movingAveragePeriod]?.slice(-filteredData.length) || dataToUse;
        label = `${label} (${movingAveragePeriod}-day MA)`;
      }

      datasets.push({
        label,
        data: dataToUse,
        borderColor: seriesColor,
        backgroundColor: seriesColor,
        tension: 0.1,
        yAxisID: seriesName === 'btc_price' ? 'y1' : 'y',
        pointRadius: 0,
        borderWidth: seriesName === 'btc_price' ? 1 : 1,
        hidden: visibleDatasets[label] === false,
      });

      return datasets;
    })
  }), [filteredData, seriesNames, showZScore, zScoreWindow, zScoreData, visibleDatasets, movingAveragePeriod, movingAverages]);

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
        backgroundColor: CHART_COLORS.background,
        titleColor: CHART_COLORS.text,
        bodyColor: CHART_COLORS.text,
        borderColor: CHART_COLORS.border,
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
      crosshair: {
        line: {
          color: CHART_COLORS.gridLines,
          width: 1,
          dashPattern: [5, 5]
        },
        sync: {
          enabled: true,
        },
        zoom: {
          enabled: false,
        },
        snap: {
          enabled: false,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
          color: CHART_COLORS.text,
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: true,
          color: CHART_COLORS.gridLines,
        },
        border: {
          display: true,
          color: CHART_COLORS.gridLines,
        },
        position: 'bottom' as const,
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: CHART_COLORS.text,
        },
        grid: {
          display: true,
          color: CHART_COLORS.gridLines,
        },
        border: {
          display: true,
          color: CHART_COLORS.gridLines,
        },
      },
      y1: {
        type: 'logarithmic' as const,
        display: seriesNames.includes('btc_price'),
        position: 'right' as const,
        ticks: {
          color: CHART_COLORS.text,
        },
        grid: {
          display: false,
        },
        border: {
          display: true,
          color: CHART_COLORS.gridLines,
        },
        afterDataLimits: (scale: any) => {
          scale.max = Math.max(...filteredData.map(item => item.btc_price as number));
          scale.min = Math.min(...filteredData.map(item => item.btc_price as number));
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

  const togglePopout = () => {
    setIsPopout(!isPopout);
  };

  const PopoutButton = () => (
    <button
      onClick={togglePopout}
      className="bg-opacity-70 bg-[#131722] border border-[#404040] rounded cursor-pointer p-2 flex items-center"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 3H21V9" stroke={CHART_COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21H3V15" stroke={CHART_COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 3L14 10" stroke={CHART_COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 21L10 14" stroke={CHART_COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  const MovingAverageSelector = () => {
    return (
      <div className="flex items-center mr-5 border border-[#404040] rounded overflow-hidden">
        <span className="text-[#FF6A00] px-2 py-1 border-r border-[#404040]">MA</span>
        <div className="flex items-center">
          {[30, 90, 180, 365].map((period) => (
            <button
              key={period}
              onClick={() => setMovingAveragePeriod(movingAveragePeriod === period ? null : period)}
              className={`${movingAveragePeriod === period ? 'bg-[#00ffff] text-black' : 'bg-transparent text-white'} border-none px-2 py-1 cursor-pointer`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const chartContent = (
    <div className="h-full flex flex-col relative">
      <div className="flex-grow overflow-hidden">
        <div className="h-[calc(100%-20px)]">
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-white text-2xl font-bold m-0">
              {title.split(' ').map(word => word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h2>
            <div className="flex items-center">
              <div className="flex items-center mr-5 border border-[#404040] rounded overflow-hidden">
                <span className="text-[#FF6A00] px-2 py-1 border-r border-[#404040]">Lookback</span>
                <div className="flex items-center">
                  {['M', 'Q', 'YTD', 'Y', 'AT'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setLookbackPeriod(period)}
                      className={`${lookbackPeriod === period ? 'bg-[#00ffff] text-black' : 'bg-transparent text-white'} border-none px-2 py-1 cursor-pointer`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center mr-5 border border-[#404040] rounded overflow-hidden">
                <span className="text-[#FF6A00] px-2 py-1 border-r border-[#404040]">Z-Score</span>
                <div className="flex items-center">
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
                      className={`${showZScore && zScoreWindow === parseInt(period) ? 'bg-[#00ffff] text-black' : 'bg-transparent text-white'} border-none px-2 py-1 cursor-pointer`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <MovingAverageSelector />
              <PopoutButton />
            </div>
          </div>
          <div className="border-t border-[#404040] mb-2.5"></div>
          <div className="flex justify-end mb-2.5">
            {chartData.datasets.map((dataset, index) => (
              <div 
                key={index} 
                className={`flex items-center ml-3.5 cursor-pointer ${dataset.hidden ? 'opacity-50' : 'opacity-100'}`}
                onClick={() => toggleDatasetVisibility(dataset.label)}
              >
                <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: dataset.borderColor }}></div>
                <span className="text-white text-xs">{dataset.label}</span>
              </div>
            ))}
          </div>
          <div className="h-[calc(100%-60px)]">
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPopout(false);
      }
    };

    if (isPopout) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isPopout]);

  if (isPopout) {
    return (
      <div className="fixed top-[5.5%] left-[.65%] w-[98%] h-[93.2%] bg-[#131722] z-[1000] border border-[#404040] rounded-lg shadow-lg p-5">
        {chartContent}
      </div>
    );
  }

  return chartContent;
};

export default DataChart;
