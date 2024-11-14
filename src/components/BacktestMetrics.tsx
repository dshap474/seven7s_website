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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#131722] rounded-lg border border-gray-800">
      {metrics.map(({ Metric, Value }) => (
        <div key={Metric} className="p-4 bg-black/30 rounded-lg">
          <h3 className="text-[#FF6A00] text-sm font-medium mb-1">{Metric}</h3>
          <p className="text-white text-lg font-bold">{formatValue(Metric, Value)}</p>
        </div>
      ))}
    </div>
  );
};

export default BacktestMetrics; 