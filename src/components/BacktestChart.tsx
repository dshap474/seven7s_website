import React, { useEffect, useRef, useMemo, useState } from 'react';
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

type ReferenceDate = string | null;

const BacktestChart: React.FC<BacktestChartProps> = ({ data, selectedAssets }) => {
  const performanceChartRef = useRef<SVGSVGElement>(null);
  const returnsChartRef = useRef<SVGSVGElement>(null);
  const positionChartRef = useRef<SVGSVGElement>(null);

  const [referenceDate, setReferenceDate] = useState<ReferenceDate>(null);

  const colors = useMemo(() => ({
    ETH: '#627EEA',
    SOL: '#00FFA3',
    LINK: '#2A5ADA',
    OP: '#FF0420',
    IMX: '#00BFFF',
    MKR: '#1AAB9B',
    UNI: '#FF007A',
    FET: '#9B4DCA',
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
    const positions: Position[] = [];
    
    if (!data || !selectedAssets) {
        console.warn('Missing data or selectedAssets:', { data, selectedAssets });
        return positions;
    }

    data.forEach((item, index) => {
        selectedAssets.forEach(asset => {
            const positionKey = Object.keys(item).find(key => 
                key.replace('\r', '').toLowerCase() === `${asset.toLowerCase()}_position`
            );

            if (!positionKey && index === 0) {
                console.warn(`No position key found for ${asset}. Available keys:`, 
                    Object.keys(item).map(k => `"${k}"`)
                );
                return;
            }

            let positionValue = positionKey ? item[positionKey] : null;

            if (asset === 'DOGE' && index < 5) {
                console.log(`DOGE position check for ${item.date}:`, {
                    foundKey: positionKey,
                    rawValue: positionValue,
                    cleanedKey: positionKey?.replace('\r', '')
                });
            }

            const cleanValue = String(positionValue || '').trim();
            
            const isPosition = (
                cleanValue === '1' || 
                cleanValue === '1.0' || 
                cleanValue === '1.00' ||
                parseFloat(cleanValue) === 1
            );

            if (isPosition) {
                positions.push({
                    date: item.date,
                    asset: asset
                });
            }
        });
    });

    selectedAssets.forEach(asset => {
        const assetPositions = positions.filter(p => p.asset === asset);
        console.log(`${asset} positions:`, {
            count: assetPositions.length,
            firstFew: assetPositions.slice(0, 3)
        });
    });
    
    return positions;
  }, [data, selectedAssets]);

  useEffect(() => {
    if (!formattedData.length) return;

    // Performance Chart
    const drawPerformanceChart = () => {
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
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

      // Add tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

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

      // Add hover overlay
      const bisect = d3.bisector((d: FormattedDataItem) => new Date(d.date)).left;
      
      const focus = svg.append("g")
        .style("display", "none");

      focus.append("circle")
        .attr("r", 5)
        .attr("class", "portfolio-point")
        .style("fill", "#00ffff");

      focus.append("circle")
        .attr("r", 5)
        .attr("class", "benchmark-point")
        .style("fill", "#FF6A00");

      // Add vertical reference line
      const verticalLine = svg.append("line")
        .attr("class", "hover-line")
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0);

      // Portfolio line with hover
      svg.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "#00ffff")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Benchmark line with hover
      svg.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "#FF6A00")
        .attr("stroke-width", 1.5)
        .attr("d", benchmarkLine);

      // Add hover functionality
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => {
          focus.style("display", null);
          tooltip.style("opacity", 1);
          verticalLine.style("opacity", 1);
        })
        .on("mouseout", () => {
          focus.style("display", "none");
          tooltip.style("opacity", 0);
          verticalLine.style("opacity", 0);
        })
        .on("mousemove", (event) => {
          const mouseX = d3.pointer(event)[0];
          const x0 = x.invert(mouseX);
          const i = bisect(formattedData, x0, 1);
          const d0 = formattedData[i - 1];
          const d1 = formattedData[i];
          const d = x0.getTime() - new Date(d0.date).getTime() > new Date(d1.date).getTime() - x0.getTime() ? d1 : d0;

          verticalLine
            .attr("x1", x(new Date(d.date)))
            .attr("x2", x(new Date(d.date)))
            .attr("y1", 0)
            .attr("y2", height);

          focus.select(".portfolio-point")
            .attr("transform", `translate(${x(new Date(d.date))},${y(d.portfolioValue)})`);

          focus.select(".benchmark-point")
            .attr("transform", `translate(${x(new Date(d.date))},${y(d.benchmarkReturn)})`);

          tooltip
            .html(`
              <div>Date: ${d.date}</div>
              <div>Portfolio: ${d.portfolioValue.toFixed(2)}</div>
              <div>Benchmark: ${d.benchmarkReturn.toFixed(2)}</div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        });
    };

    // Asset Returns Chart
    const drawReturnsChart = () => {
      const margin = { top: 20, right: 80, bottom: 50, left: 60 };
      const width = returnsChartRef.current!.clientWidth - margin.left - margin.right;
      const height = 360 - margin.top - margin.bottom;

      // Clear previous chart
      d3.select(returnsChartRef.current).selectAll("*").remove();

      const svg = d3.select(returnsChartRef.current)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Get initial values and calculate max/min multipliers
      const initialValues = selectedAssets.reduce((acc, asset) => ({
        ...acc,
        [asset]: formattedData[0][`${asset}Return`]
      }), {} as Record<string, number>);

      const maxMultiplier = Math.ceil(d3.max(formattedData, d => 
        Math.max(...selectedAssets.map(asset => 
          d[`${asset}Return`] / initialValues[asset]
        ))
      ) || 1);

      const minMultiplier = Math.floor(d3.min(formattedData, d => 
        Math.min(...selectedAssets.map(asset => 
          d[`${asset}Return`] / initialValues[asset]
        ))
      ) || 1);

      // Create scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => new Date(d.date)) as [Date, Date])
        .range([0, width]);

      // Create logarithmic scale
      const y = d3.scaleLog()
        .domain([
          Math.max(0.1, minMultiplier * 0.9), // Prevent going below 0.1x
          maxMultiplier * 1.1
        ])
        .range([height, 0]);

      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "text-white")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("fill", "white");

      // Generate even multiplier values dynamically
      const generateEvenMultipliers = (min: number, max: number) => {
        const multipliers = [];
        // Handle values below 1
        let value = 0.2;
        while (value < 1 && value >= min) {
          if (value >= y.domain()[0]) multipliers.push(value);
          value += 0.2;
        }
        
        // Handle values 1 and above
        value = 1;
        while (value <= max) {
          if (value <= y.domain()[1]) multipliers.push(value);
          // Use smaller steps for values under 10, larger steps after
          value += (value < 10 ? 2 : 5);
        }
        return multipliers;
      };

      const yGridValues = generateEvenMultipliers(
        Math.max(0.1, minMultiplier * 0.9),
        maxMultiplier * 1.1
      );

      // Add Y axis with multiplier labels
      svg.append("g")
        .attr("class", "text-white")
        .call(d3.axisLeft(y)
          .tickValues(yGridValues)
          .tickFormat((d: d3.NumberValue) => `${Number(d).toFixed(1)}×`))
        .call(g => g.selectAll(".tick line").remove())
        .selectAll("text")
        .style("fill", "white");

      // Add grid lines with slightly increased visibility
      yGridValues.forEach(value => {
        if (value >= y.domain()[0] && value <= y.domain()[1]) {
          svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(value))
            .attr("y2", y(value))
            .attr("stroke", "white")
            .attr("stroke-opacity", value === 1 ? 0.4 : 0.15) // Increased from 0.3/0.1
            .attr("stroke-width", value === 1 ? 1 : 0.5);
        }
      });

      // Add vertical reference line
      const rule = svg.append("line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0);

      // Function to get normalized values relative to reference date
      const getNormalizedValue = (d: FormattedDataItem, asset: string) => {
        if (!referenceDate) return d[`${asset}Return`] / initialValues[asset];
        
        const refValue = formattedData.find(item => item.date === referenceDate)![`${asset}Return`];
        return d[`${asset}Return`] / refValue;
      };

      // Add lines for each asset
      selectedAssets.forEach(asset => {
        const line = d3.line<FormattedDataItem>()
          .x(d => x(new Date(d.date)))
          .y(d => y(getNormalizedValue(d, asset)));

        svg.append("path")
          .datum(formattedData)
          .attr("fill", "none")
          .attr("stroke", colors[asset as keyof typeof colors])
          .attr("stroke-width", 1.5)
          .attr("d", line);

        // Add labels at the end of lines
        const lastPoint = formattedData[formattedData.length - 1];
        svg.append("text")
          .attr("x", width + 5)
          .attr("y", y(getNormalizedValue(lastPoint, asset)))
          .attr("dy", "0.35em")
          .attr("fill", colors[asset as keyof typeof colors])
          .style("font-size", "12px")
          .text(asset);
      });

      // Add hover interaction
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", (event) => {
          const [mouseX] = d3.pointer(event);
          const date = x.invert(mouseX);
          const bisect = d3.bisector((d: FormattedDataItem) => new Date(d.date)).left;
          const index = bisect(formattedData, date);
          const d = formattedData[index];

          rule
            .style("opacity", 1)
            .attr("transform", `translate(${x(new Date(d.date))},0)`);

          setReferenceDate(d.date);
        })
        .on("mouseout", () => {
          rule.style("opacity", 0);
          setReferenceDate(null);
        });
    };

    // Position Timeline Chart
    const drawPositionChart = () => {
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const width = positionChartRef.current!.clientWidth - margin.left - margin.right;
      const height = 360 - margin.top - margin.bottom;

      // Clear previous chart
      d3.select(positionChartRef.current).selectAll("*").remove();

      const svg = d3.select(positionChartRef.current)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      if (!data || data.length === 0 || !positionData || positionData.length === 0) {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("fill", "white")
          .text(data ? "No positions found" : "No data available");
        return;
      }

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

      // Add tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

      // Add vertical reference line
      const verticalLine = svg.append("line")
        .attr("class", "hover-line")
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0);

      // When drawing markers, add error handling and hover effects
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
        .attr("fill", d => {
            const color = colors[d.asset as keyof typeof colors];
            if (!color) {
                console.error('No color found for asset:', d.asset);
                return '#ffffff';
            }
            return color;
        })
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1)
            .html(`
              <div>Asset: ${d.asset}</div>
              <div>Date: ${d.date}</div>
              <div>Position: Active</div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      // Add position counts
      selectedAssets.forEach(asset => {
        try {
            const count = positionData.filter(d => d.asset === asset).length;
            
            svg.append("text")
                .attr("x", width + 5)
                .attr("y", (y(asset) || 0) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .style("fill", "white")
                .style("font-size", "10px")
                .text(`(${count})`);
        } catch (error) {
            console.error(`Error drawing count for ${asset}:`, error);
        }
      });

      // Add hover interaction overlay
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => {
          verticalLine.style("opacity", 1);
          tooltip.style("opacity", 1);
        })
        .on("mouseout", () => {
          verticalLine.style("opacity", 0);
          tooltip.style("opacity", 0);
        })
        .on("mousemove", (event) => {
          const [mouseX] = d3.pointer(event);
          const date = x.invert(mouseX);
          const bisect = d3.bisector((d: FormattedDataItem) => new Date(d.date)).left;
          const index = bisect(formattedData, date);
          const d = formattedData[index];

          verticalLine
            .attr("x1", x(new Date(d.date)))
            .attr("x2", x(new Date(d.date)))
            .attr("y1", 0)
            .attr("y2", height);

          // Find active positions for this date
          const activePositions = positionData.filter(p => p.date === d.date);
          
          tooltip.style("opacity", 1)
            .html(`
              <div>Date: ${d.date}</div>
              <div>Active Positions: ${activePositions.length}</div>
              ${activePositions.map(p => `<div>${p.asset}</div>`).join('')}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        });
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
  }, [formattedData, selectedAssets, colors, referenceDate]);

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Portfolio Performance vs Benchmark</h3>
        <svg ref={performanceChartRef} width="100%" height="360" />
      </div>

      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Position Timeline</h3>
        <svg ref={positionChartRef} width="100%" height="360" />
      </div>

      <div className="h-[400px] bg-[#131722] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white mb-4">Asset Cumulative Returns</h3>
        <svg ref={returnsChartRef} width="100%" height="360" />
      </div>
    </div>
  );
};

export default BacktestChart;