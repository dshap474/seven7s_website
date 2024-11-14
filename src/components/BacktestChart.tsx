import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

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

type Position = {
  date: string;
  asset: string;
};

const BacktestChart: React.FC<BacktestChartProps> = ({ data, selectedAssets }) => {
  const performanceChartRef = useRef<SVGSVGElement>(null);
  const returnsChartRef = useRef<SVGSVGElement>(null);
  const positionChartRef = useRef<SVGSVGElement>(null);

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
    // Debug DOGE data specifically
    console.log('Debugging DOGE positions:');
    const firstFewRows = data.slice(0, 5);
    firstFewRows.forEach((row, index) => {
      console.log(`Row ${index}:`, {
        date: row.date,
        doge_position: row['DOGE_position'],
        doge_position_type: typeof row['DOGE_position'],
        doge_position_parsed: parseFloat(row['DOGE_position']),
        raw_row: row
      });
    });

    // Try different ways to access DOGE position data
    const dogePositions = data.filter(item => {
      const dogeValue = item['DOGE_position'];
      const parsedValue = parseFloat(dogeValue);
      console.log('DOGE value check:', {
        original: dogeValue,
        type: typeof dogeValue,
        parsed: parsedValue,
        isOne: parsedValue === 1,
        stringMatch: dogeValue === '1',
        stringMatchWithZero: dogeValue === '1.0'
      });
      return parsedValue === 1;
    });
    console.log('DOGE positions found:', dogePositions.length);
    console.log('Sample DOGE positions:', dogePositions.slice(0, 5));

    // Try a more direct approach with detailed logging
    const positions: Position[] = [];
    for (const item of data) {
      for (const asset of selectedAssets) {
        const positionValue = item[`${asset}_position`];
        const numericValue = parseFloat(positionValue);
        
        // Debug log for DOGE
        if (asset === 'DOGE' && numericValue === 1) {
          console.log('Found DOGE position:', {
            date: item.date,
            originalValue: positionValue,
            parsedValue: numericValue
          });
        }

        if (numericValue === 1) {
          positions.push({
            date: item.date,
            asset: asset
          });
        }
      }
    }

    // Log final counts for each asset
    const assetCounts = selectedAssets.reduce((acc, asset) => {
      acc[asset] = positions.filter(p => p.asset === asset).length;
      return acc;
    }, {} as Record<string, number>);
    console.log('Position counts by asset:', assetCounts);

    // Additional DOGE validation
    const finalDogePositions = positions.filter(p => p.asset === 'DOGE');
    console.log('Final DOGE positions:', {
      count: finalDogePositions.length,
      samples: finalDogePositions.slice(0, 5)
    });

    return positions;
  }, [data, selectedAssets]);

  useEffect(() => {
    if (!formattedData.length) return;

    // Performance Chart
    const drawPerformanceChart = () => {
      const margin = { top: 20, right: 30, bottom: 30, left: 60 };
      const width = performanceChartRef.current!.clientWidth - margin.left - margin.right;
      const height = 360 - margin.top - margin.bottom;

      // Clear previous chart
      d3.select(performanceChartRef.current).selectAll("*").remove();

      const svg = d3.select(performanceChartRef.current)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => new Date(d.date)) as [Date, Date])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([
          d3.min(formattedData, d => Math.min(d.portfolioValue, d.benchmarkReturn)) as number * 0.9,
          d3.max(formattedData, d => Math.max(d.portfolioValue, d.benchmarkReturn)) as number * 1.1
        ])
        .range([height, 0]);

      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "text-white")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("fill", "white");

      // Add Y axis
      svg.append("g")
        .attr("class", "text-white")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "white");

      // Add lines
      const line = d3.line<FormattedDataItem>()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.portfolioValue));

      const benchmarkLine = d3.line<FormattedDataItem>()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.benchmarkReturn));

      // Portfolio line
      svg.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "#00ffff")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Benchmark line
      svg.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "#FF6A00")
        .attr("stroke-width", 1.5)
        .attr("d", benchmarkLine);

      // Add grid
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
        )
        .style("stroke", "rgba(255,255,255,0.1)")
        .style("stroke-dasharray", "3,3");
    };

    // Asset Returns Chart
    const drawReturnsChart = () => {
      const margin = { top: 20, right: 30, bottom: 30, left: 60 };
      const width = returnsChartRef.current!.clientWidth - margin.left - margin.right;
      const height = 360 - margin.top - margin.bottom;

      // Clear previous chart
      d3.select(returnsChartRef.current).selectAll("*").remove();

      const svg = d3.select(returnsChartRef.current)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => new Date(d.date)) as [Date, Date])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([
          d3.min(formattedData, d => 
            Math.min(...selectedAssets.map(asset => d[`${asset}Return`]))
          ) as number * 0.9,
          d3.max(formattedData, d => 
            Math.max(...selectedAssets.map(asset => d[`${asset}Return`]))
          ) as number * 1.1
        ])
        .range([height, 0]);

      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "text-white")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("fill", "white");

      // Add Y axis
      svg.append("g")
        .attr("class", "text-white")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "white");

      // Add lines for each asset
      selectedAssets.forEach(asset => {
        const line = d3.line<FormattedDataItem>()
          .x(d => x(new Date(d.date)))
          .y(d => y(d[`${asset}Return`]));

        svg.append("path")
          .datum(formattedData)
          .attr("fill", "none")
          .attr("stroke", colors[asset as keyof typeof colors])
          .attr("stroke-width", 1.5)
          .attr("d", line);
      });

      // Add grid
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
        )
        .style("stroke", "rgba(255,255,255,0.1)")
        .style("stroke-dasharray", "3,3");
    };

    // Position Timeline Chart
    const drawPositionChart = () => {
      const margin = { top: 20, right: 30, bottom: 30, left: 60 };
      const width = positionChartRef.current!.clientWidth - margin.left - margin.right;
      const height = 360 - margin.top - margin.bottom;

      // Clear previous chart
      d3.select(positionChartRef.current).selectAll("*").remove();

      const svg = d3.select(positionChartRef.current)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Error checking and debug info display
      if (!data || data.length === 0) {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("fill", "white")
          .text("Error: No data available");
        return;
      }

      if (!positionData || positionData.length === 0) {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("fill", "white")
          .text("No position data found - Check console for debug info");
        
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2 + 20)
          .attr("text-anchor", "middle")
          .style("fill", "gray")
          .style("font-size", "12px")
          .text(`Assets: ${selectedAssets.join(", ")}`);
        
        return;
      }

      // Debug info
      console.log('Drawing position chart with:', {
        dataLength: data.length,
        positionDataLength: positionData.length,
        selectedAssets,
        samplePosition: positionData[0]
      });

      // Scales
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
        .range([0, width]);

      const y = d3.scaleBand()
        .domain(selectedAssets)
        .range([height, 0])
        .padding(0.3);

      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "text-white")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("fill", "white");

      // Add Y axis
      svg.append("g")
        .attr("class", "text-white")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "white");

      // Add grid
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
        )
        .style("stroke", "rgba(255,255,255,0.1)")
        .style("stroke-dasharray", "3,3");

      try {
        // Add position markers as circles
        svg.selectAll(".position-marker")
          .data(positionData)
          .enter()
          .append("circle")
          .attr("class", "position-marker")
          .attr("cx", d => {
            const xPos = x(new Date(d.date));
            if (isNaN(xPos)) {
              console.error('Invalid x position for:', d);
              return 0;
            }
            return xPos;
          })
          .attr("cy", d => {
            const yPos = (y(d.asset) || 0) + y.bandwidth() / 2;
            if (isNaN(yPos)) {
              console.error('Invalid y position for:', d);
              return 0;
            }
            return yPos;
          })
          .attr("r", 4)
          .attr("fill", d => colors[d.asset as keyof typeof colors]);

        // Add count of positions for each asset
        selectedAssets.forEach(asset => {
          const count = positionData.filter(d => d.asset === asset).length;
          svg.append("text")
            .attr("x", width + 5)
            .attr("y", (y(asset) || 0) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .style("fill", "white")
            .style("font-size", "10px")
            .text(`(${count})`);
        });

      } catch (error) {
        console.error('Error drawing position markers:', error);
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("fill", "red")
          .text(`Error drawing markers: ${(error as Error).message}`);
      }
    };

    // Draw all charts
    drawPerformanceChart();
    drawReturnsChart();
    drawPositionChart();

    // Add resize listener
    const handleResize = () => {
      drawPerformanceChart();
      drawReturnsChart();
      drawPositionChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [formattedData, selectedAssets, colors]);

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Portfolio Performance vs Benchmark</h3>
        <svg ref={performanceChartRef} width="100%" height="360" />
      </div>

      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Asset Cumulative Returns</h3>
        <svg ref={returnsChartRef} width="100%" height="360" />
      </div>

      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Position Timeline</h3>
        <svg ref={positionChartRef} width="100%" height="360" />
      </div>
    </div>
  );
};

export default BacktestChart; 