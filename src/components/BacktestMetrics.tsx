import React from 'react';

interface BacktestMetricsProps {
  metrics: {
    Metric: string;
    Value: string | number;
  }[];
}

const BacktestMetrics: React.FC<BacktestMetricsProps> = ({ metrics }) => {
  const formatValue = (metric: string, value: string | number) => {
    if (typeof value === 'number') {
      // List of metrics that should be formatted as percentages
      const percentageMetrics = [
        'Total Return',
        'Annualized Return',
        'Max Drawdown',
        'Benchmark Return',
        'Average Position Change'
      ];

      // Format percentages
      if (percentageMetrics.includes(metric)) {
        return `${(value * 100).toFixed(2)}%`;
      }

      // Format whole numbers
      if (Number.isInteger(value)) {
        return value.toString();
      }

      // Format other numbers with 3 decimal places
      return value.toFixed(3);
    }
    return value;
  };

  return (
    <div className="bg-[#131722] rounded-lg border border-gray-800 p-3 space-y-2 h-[800px]">
      {/* Strategy Title Box */}
      <div className="p-2 bg-black/30 rounded-lg">
        <h3 className="text-[#FF6A00] text-xs font-medium mb-0.5">Strategy</h3>
        <p className="text-white text-sm font-bold">Equal Weighted Large Cap Momentum</p>
      </div>
      
      {/* Remaining Metrics */}
      {metrics.slice(1).map(({ Metric, Value }) => (
        <div key={Metric} className="p-2 bg-black/30 rounded-lg">
          <h3 className="text-[#FF6A00] text-xs font-medium mb-0.5">{Metric}</h3>
          <p className="text-white text-sm font-bold">{formatValue(Metric, Value)}</p>
        </div>
      ))}
    </div>
  );
};

export default BacktestMetrics; 