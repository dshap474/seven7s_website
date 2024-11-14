import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface BacktestChartProps {
  data: any[];
  selectedAssets: string[];
}

type FormattedDataItem = {
  date: string;
  portfolioValue: number;
  benchmarkReturn: number;
  [key: `${string}Return`]: number;
  [key: `${string}Position`]: boolean;
}

const BacktestChart: React.FC<BacktestChartProps> = ({ data, selectedAssets }) => {
  const colors = useMemo(() => ({
    ETH: '#627EEA',
    SOL: '#00FFA3',
    LINK: '#2A5ADA',
    OP: '#FF0420',
    IMX: '#00BFFF',
    MKR: '#1AAB9B',
    UNI: '#FF007A',
    FET: '#4B0082',
    DOGE: '#BA9F33',
  }), []);

  const formattedData = useMemo(() => 
    data.map(item => ({
      date: item.date,
      portfolioValue: parseFloat(item.portfolio_value),
      benchmarkReturn: (1 + parseFloat(item.benchmark_cum_return)) * 100,
      ...selectedAssets.reduce((acc, asset) => ({
        ...acc,
        [`${asset}Return`]: (1 + parseFloat(item[`${asset}_cum_return`])) * 100,
        [`${asset}Position`]: item[`${asset}_position`] === '1',
      }), {}),
    })) as FormattedDataItem[]
  , [data, selectedAssets]);

  const positionData = useMemo(() => {
    const positions = selectedAssets.flatMap(asset =>
      data
        .filter(item => item[`${asset}_position`] === '1') // Filter based on asset position
        .map(item => ({
          date: item.date,
          asset: asset,
        }))
    );
    console.log("Position Data:", positions); // Debugging: Log position data
    return positions;
  }, [data, selectedAssets]);

  if (positionData.length === 0) {
    console.warn("No position data available for selected assets.");
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-[#131722] border border-gray-800 p-3 rounded shadow-lg">
        <p className="text-white text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Portfolio Performance Chart */}
      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Portfolio Performance vs Benchmark</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="white"
              tick={{ fill: 'white' }}
            />
            <YAxis 
              stroke="white"
              tick={{ fill: 'white' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="portfolioValue" 
              stroke="#00ffff" 
              name="Portfolio Value"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="benchmarkReturn" 
              stroke="#FF6A00" 
              name="Benchmark"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Returns Chart */}
      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Asset Cumulative Returns</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="white"
              tick={{ fill: 'white' }}
            />
            <YAxis 
              stroke="white"
              tick={{ fill: 'white' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedAssets.map(asset => (
              <Line
                key={asset}
                type="monotone"
                dataKey={`${asset}Return`}
                stroke={colors[asset as keyof typeof colors]}
                name={asset}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Position Timeline Chart */}
      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Position Timeline</h3>
        <ResponsiveContainer width="100%" height="90%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 50 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)" 
              horizontal={false} // Only vertical gridlines
            />
            <XAxis
              dataKey="date" // Ensure x-axis is the date
              type="category"
              stroke="white"
              tick={{ fill: 'white', fontSize: 12 }}
              interval={30}
            />
            <YAxis
              dataKey="asset"
              type="category"
              stroke="white"
              tick={{ fill: 'white', fontSize: 12 }}
              width={80}
              domain={selectedAssets}
            />
            <Scatter
              data={positionData} // Use positionData to plot the assets
              fill="#8884d8"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-[#131722] border border-gray-800 p-2 rounded">
                    <p className="text-white text-sm">
                      {`${data.asset}: ${data.date}`} // Tooltip shows asset and date
                    </p>
                  </div>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BacktestChart; 