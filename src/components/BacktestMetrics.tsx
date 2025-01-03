import React from 'react';

interface BacktestMetricsProps {
  metrics: {
    Metric: string;
    Value: string | number;
  }[];
  selectedStrategy: string;
  onStrategyChange: (value: string) => void;
}

const BacktestMetrics: React.FC<BacktestMetricsProps> = ({ metrics, selectedStrategy, onStrategyChange }) => {
  const formatValue = (metric: string, value: string | number) => {
    if (metric === 'Start Date' || metric === 'End Date') {
      return value.toString().split(' ')[0];
    }

    if (typeof value === 'number') {
      const percentageMetrics = [
        'Total Return',
        'Annualized Return',
        'Max Drawdown',
        'Benchmark Return',
        'Average Position Change'
      ];

      if (percentageMetrics.includes(metric)) {
        return `${(value * 100).toFixed(2)}%`;
      }

      if (Number.isInteger(value)) {
        return value.toString();
      }

      return value.toFixed(3);
    }
    return value;
  };

  // Function to render a metric row
  const renderMetric = (metric: string, value: string | number) => (
    <div key={metric} className="flex justify-between items-center">
      <span className="text-[#FF6A00] text-xs">{metric}:</span>
      <span className="text-white text-sm font-bold">{formatValue(metric, value)}</span>
    </div>
  );

  // Group metrics into sections
  const renderMetrics = () => {
    const orderedMetrics = metrics.slice(1).reduce((acc: any[], metric) => {
      if (metric.Metric === 'Average Position Change') {
        return [...acc, metric, { type: 'divider' }];
      } else if (metric.Metric === 'Benchmark Return') {
        return [...acc, { type: 'label', text: ['Benchmark Asset:', 'Bitcoin'] }, metric];
      } else {
        return [...acc, metric];
      }
    }, []);

    return orderedMetrics.map((item, index) => {
      if (item.type === 'divider') {
        return <div key={`divider-${index}`} className="border-b border-gray-700 my-4" />;
      }
      if (item.type === 'label') {
        return (
          <div key={`label-${index}`} className="flex justify-between items-center mt-4 mb-2">
            <span className="text-[#FF6A00] text-xs">{item.text[0]}</span>
            <span className="text-white text-sm font-bold">{item.text[1]}</span>
          </div>
        );
      }
      return renderMetric(item.Metric, item.Value);
    });
  };

  return (
    <div className="bg-[#131722] rounded-lg border border-gray-800 p-4 h-[800px]">
      {/* Strategy Selection Box */}
      <div className="mb-6">
        <h3 className="text-[#FF6A00] text-xs font-medium mb-2">Select Strategy:</h3>
        <select
          value={selectedStrategy}
          onChange={(e) => onStrategyChange(e.target.value)}
          className="w-full bg-[#131722] text-white px-2 py-1 rounded border border-gray-800 text-sm"
        >
          <option value="large_cap">Large Cap Momentum</option>
          <option value="mid_cap">Mid Cap Momentum</option>
        </select>
      </div>
      
      {/* Metrics */}
      <div className="space-y-3">
        {renderMetrics()}
      </div>
    </div>
  );
};

export default BacktestMetrics; 