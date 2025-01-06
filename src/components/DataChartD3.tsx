// import React, { useEffect, useRef, useMemo, useState } from 'react';
// import * as d3 from 'd3';

// // Reuse the same color scheme from DataChart
// export const CHART_COLORS = {
//   btcPrice: 'rgb(100, 100, 100)',
//   firstSeries: 'rgb(0, 255, 255)',
//   secondSeries: 'rgb(255, 0, 255)',
//   background: '#131722',
//   tooltipBackground: '#1e2330',
//   text: 'rgb(255, 255, 255)',
//   border: 'rgb(31, 41, 55)',
//   gridLines: 'rgb(128, 128, 128)',
//   highlight: '#00ffff',
//   accent: '#FF6A00',
// };

// // Reuse the same interfaces
// interface ChartData {
//   index: string;
//   [key: string]: string | number;
// }

// interface SeriesConfig {
//   label: string;
//   color: string;
//   visible: boolean;
// }

// interface DataChartD3Props {
//   data: ChartData[];
//   title: string;
//   series: { [key: string]: SeriesConfig };
//   availableIndicators: string[];
//   onIndicatorSelect: (indicator: string) => void;
// }

// // Add z-score calculation function
// const calculateZScore = (values: (number | null)[], window: number) => {
//   const result: (number | null)[] = [];
//   let sum = 0;
//   let sumSquared = 0;
//   let count = 0;

//   for (let i = 0; i < values.length; i++) {
//     const value = values[i];
//     if (value !== null) {
//       sum += value;
//       sumSquared += value * value;
//       count++;

//       if (count > window) {
//         const oldValue = values[i - window];
//         if (oldValue !== null) {
//           sum -= oldValue;
//           sumSquared -= oldValue * oldValue;
//           count--;
//         }
//       }

//       if (count >= 2) {
//         const mean = sum / count;
//         const variance = (sumSquared / count) - (mean * mean);
//         const stdDev = Math.sqrt(variance);
//         result.push(stdDev === 0 ? null : (value - mean) / stdDev);
//       } else {
//         result.push(null);
//       }
//     } else {
//       result.push(null);
//     }
//   }

//   return result;
// };

// // Add moving average calculation function
// const calculateMA = (values: number[], window: number) => {
//   const result = new Array(values.length).fill(null);
//   for (let i = window - 1; i < values.length; i++) {
//     const slice = values.slice(i - window + 1, i + 1);
//     const sum = slice.reduce((a, b) => a + b, 0);
//     result[i] = sum / window;
//   }
//   return result;
// };

// const DataChartD3: React.FC<DataChartD3Props> = ({ data, series, availableIndicators, onIndicatorSelect }) => {
//   const svgRef = useRef<SVGSVGElement>(null);
//   const tooltipRef = useRef<HTMLDivElement>(null);
//   const [lookbackPeriod, setLookbackPeriod] = useState('Y');
//   const [showZScore, setShowZScore] = useState(false);
//   const [zScoreWindow, setZScoreWindow] = useState(90);
//   const [movingAveragePeriod, setMovingAveragePeriod] = useState<number | null>(null);
//   const [visibleDatasets, setVisibleDatasets] = useState<{ [key: string]: boolean }>({});

//   // Add legend state
//   const [visibleSeries, setVisibleSeries] = useState(
//     Object.fromEntries(
//       Object.entries(series).map(([key, config]) => [key, config.visible])
//     )
//   );

//   // Filter data based on lookback period
//   const getFilteredData = () => {
//     const currentDate = new Date();
//     const startDate = new Date(currentDate);

//     switch (lookbackPeriod) {
//       case 'M':
//         startDate.setMonth(currentDate.getMonth() - 1);
//         break;
//       case 'Q':
//         startDate.setMonth(currentDate.getMonth() - 3);
//         break;
//       case 'YTD':
//         startDate.setMonth(0);
//         startDate.setDate(1);
//         break;
//       case 'Y':
//         startDate.setFullYear(currentDate.getFullYear() - 1);
//         break;
//       case '2Y':
//         startDate.setFullYear(currentDate.getFullYear() - 2);
//         break;
//       case 'AT':
//       default:
//         return data;
//     }

//     return data.filter(item => new Date(item.index) >= startDate);
//   };

//   const filteredData = useMemo(() => getFilteredData(), [data, lookbackPeriod]);

//   useEffect(() => {
//     if (!svgRef.current || !data || data.length === 0) return;

//     // Clear previous chart
//     d3.select(svgRef.current).selectAll('*').remove();

//     // Setup dimensions
//     const margin = { top: 20, right: 60, bottom: 30, left: 60 };
//     const width = svgRef.current.clientWidth - margin.left - margin.right;
//     const height = svgRef.current.clientHeight - margin.top - margin.bottom;

//     // Create SVG
//     const svg = d3.select(svgRef.current)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//       .append('g')
//       .attr('transform', `translate(${margin.left},${margin.top})`);

//     // Get series names (excluding 'index')
//     const seriesNames = Object.keys(data[0]).filter(key => key !== 'index');

//     // Create scales
//     const xScale = d3.scaleTime()
//       .domain(d3.extent(filteredData, d => new Date(d.index)) as [Date, Date])
//       .range([0, width]);

//     // Modify the line generators to use z-score when enabled
//     const getSeriesData = (seriesName: string) => {
//       const values = filteredData.map(d => Number(d[seriesName]));

//       if (showZScore) {
//         return calculateZScore(values, zScoreWindow);
//       }

//       if (movingAveragePeriod) {
//         return calculateMA(values, movingAveragePeriod);
//       }

//       return values;
//     };

//     // Update scales to use z-score data when enabled
//     const yScaleMain = d3.scaleLinear()
//       .domain([
//         d3.min(filteredData, (_, i) => 
//           Math.min(...Object.keys(series)
//             .filter(key => visibleSeries[key])
//             .map(key => {
//               const value = getSeriesData(key)[i];
//               return value !== null && !isNaN(value) ? value : Infinity;
//             }))
//         ) || 0,
//         d3.max(filteredData, (_, i) => 
//           Math.max(...Object.keys(series)
//             .filter(key => visibleSeries[key])
//             .map(key => {
//               const value = getSeriesData(key)[i];
//               return value !== null && !isNaN(value) ? value : -Infinity;
//             }))
//         ) || 0
//       ])
//       .range([height, 0]);

//     const yScaleBtc = d3.scaleLinear()
//       .domain(d3.extent(filteredData, d => Number(d.btc_price)) as [number, number])
//       .range([height, 0]);

//     // Create axes
//     const xAxis = d3.axisBottom(xScale)
//       .ticks(10)
//       .tickFormat(d => d3.timeFormat('%b %Y')(d as Date));

//     const yAxisMain = d3.axisLeft(yScaleMain);

//     // Add axes
//     svg.append('g')
//       .attr('transform', `translate(0,${height})`)
//       .call(xAxis)
//       .style('color', CHART_COLORS.text);

//     svg.append('g')
//       .call(yAxisMain)
//       .style('color', CHART_COLORS.text);

//     // Add horizontal gridlines
//     svg.append('g')
//       .attr('class', 'grid')
//       .call(d3.axisLeft(yScaleMain)
//         .tickSize(-width)
//         .tickFormat(() => '')
//       )
//       .style('stroke-opacity', 0.1)
//       .style('stroke', CHART_COLORS.gridLines)
//       .call(g => g.select('.domain').remove());

//     // Create line generators
//     const lineMain = d3.line<any>()
//       .x(d => xScale(new Date(d.index)))
//       .y((d, i) => {
//         const value = getSeriesData(seriesNames[0])[i];
//         return value !== null && !isNaN(value) ? yScaleMain(value) : null;
//       })
//       .defined((d, i) => {
//         const value = getSeriesData(seriesNames[0])[i];
//         return value !== null && !isNaN(value);
//       });

//     const lineBtc = d3.line<ChartData>()
//       .x(d => xScale(new Date(d.index)))
//       .y(d => yScaleBtc(d.btc_price));

//     // Add tooltip
//     const tooltip = d3.select(tooltipRef.current)
//       .style('position', 'absolute')
//       .style('visibility', 'hidden')
//       .style('background-color', CHART_COLORS.tooltipBackground)
//       .style('color', CHART_COLORS.text)
//       .style('padding', '10px')
//       .style('border', `1px solid ${CHART_COLORS.border}`)
//       .style('border-radius', '4px')
//       .style('pointer-events', 'none');

//     // Add vertical line group
//     const verticalLine = svg.append('g')
//       .style('display', 'none');

//     verticalLine.append('line')
//       .attr('y1', 0)
//       .attr('y2', height)
//       .style('stroke', CHART_COLORS.gridLines)
//       .style('stroke-width', 1)
//       .style('stroke-dasharray', '5,5'); // This creates the dotted line

//     // Update mouse events
//     const mouseover = () => {
//       tooltip.style('visibility', 'visible');
//       verticalLine.style('display', null);
//     };

//     const mousemove = (event: MouseEvent) => {
//       const [x] = d3.pointer(event);
//       const xDate = xScale.invert(x);
//       const bisect = d3.bisector((d: ChartData) => new Date(d.index)).left;
//       const index = bisect(filteredData, xDate);
//       const dataPoint = filteredData[index];

//       if (dataPoint) {
//         // Update vertical line position
//         verticalLine.attr('transform', `translate(${x},0)`);

//         // Get the container's bounding rect
//         const containerRect = svgRef.current?.getBoundingClientRect();
        
//         // Calculate tooltip position relative to the container
//         const tooltipX = event.clientX - (containerRect?.left || 0);
//         const tooltipY = event.clientY - (containerRect?.top || 0);

//         tooltip
//           .html(`
//             <div class="text-xs">
//               Date: ${new Date(dataPoint.index).toLocaleDateString()}<br/>
//               ${Object.entries(dataPoint)
//                 .filter(([key]) => key !== 'index')
//                 .map(([key, value]) => {
//                   const formattedValue = typeof value === 'number' 
//                     ? value.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })
//                     : value;
//                   return `${key}: ${formattedValue}`;
//                 })
//                 .join('<br/>')}
//             </div>
//           `)
//           .style('left', `${tooltipX}px`)
//           .style('top', `${tooltipY - 10}px`)
//           .style('transform', 'translate(10px, 0)'); // Only add a small offset to the right
//       }
//     };

//     const mouseout = () => {
//       tooltip.style('visibility', 'hidden');
//       verticalLine.style('display', 'none');
//     };

//     svg.append('rect')
//       .attr('width', width)
//       .attr('height', height)
//       .style('fill', 'none')
//       .style('pointer-events', 'all')
//       .on('mouseover', mouseover)
//       .on('mousemove', mousemove)
//       .on('mouseout', mouseout);

//     // Create separate scales for each indicator but don't render the axes
//     const yScales = Object.keys(series)
//       .filter(key => key !== 'btc_price')
//       .reduce((scales, key) => {
//         const values = filteredData
//           .map(d => Number(d[key]))
//           .filter(v => v !== undefined && v !== null && !isNaN(v));
        
//         scales[key] = d3.scaleLinear()
//           .domain([
//             d3.min(values) || 0,
//             d3.max(values) || 0
//           ])
//           .range([height, 0]);
        
//         return scales;
//       }, {} as { [key: string]: d3.ScaleLinear<number, number> });

//     // Only add x-axis
//     svg.append('g')
//       .attr('transform', `translate(0,${height})`)
//       .call(xAxis)
//       .style('color', CHART_COLORS.text);

//     // Add horizontal gridlines
//     svg.append('g')
//       .attr('class', 'grid')
//       .call(d3.axisLeft(yScales[Object.keys(yScales)[0]] || yScaleBtc)
//         .tickSize(-width)
//         .tickFormat(() => '')
//       )
//       .style('stroke-opacity', 0.1)
//       .style('stroke', CHART_COLORS.gridLines)
//       .call(g => g.select('.domain').remove());

//     // Create and add lines for each series
//     Object.entries(series).forEach(([key, { color }]) => {
//       if (visibleSeries[key]) {
//         const scale = key === 'btc_price' ? yScaleBtc : yScales[key];
//         if (!scale) return;

//         const line = d3.line<any>()
//           .x(d => xScale(new Date(d.index)))
//           .y(d => {
//             const value = Number(d[key]);
//             return !isNaN(value) ? scale(value) : null;
//           })
//           .defined(d => !isNaN(Number(d[key])));

//         svg.append('path')
//           .datum(filteredData)
//           .attr('fill', 'none')
//           .attr('stroke', color)
//           .attr('stroke-width', 1.5)
//           .attr('d', line);
//       }
//     });

//     // Handle BTC price separately
//     if (visibleSeries.btc_price) {
//       const btcLine = d3.line<any>()
//         .x(d => xScale(new Date(d.index)))
//         .y(d => {
//           const value = Number(d.btc_price);
//           return !isNaN(value) ? yScaleBtc(value) : null;
//         })
//         .defined(d => !isNaN(Number(d.btc_price)));

//       svg.append('path')
//         .datum(filteredData)
//         .attr('fill', 'none')
//         .attr('stroke', CHART_COLORS.btcPrice)
//         .attr('stroke-width', 1.5)
//         .attr('d', btcLine);
//     }

//   }, [data, filteredData, showZScore, zScoreWindow, movingAveragePeriod, visibleSeries, series]);

//   // Legend component
//   const Legend = () => (
//     <div className="flex flex-col space-y-4 pl-4">
//       {Object.entries(series).map(([key, { label, color }]) => (
//         <div 
//           key={key}
//           className={`flex items-center cursor-pointer ${!visibleSeries[key] ? 'opacity-50' : 'opacity-100'}`}
//           onClick={() => setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }))}
//         >
//           <div 
//             className="w-1.5 h-1.5 rounded-full mr-1.5"
//             style={{ backgroundColor: color }}
//           />
//           <span className="text-white text-xs">{label}</span>
//         </div>
//       ))}
//     </div>
//   );

//   // Add Z-Score controls component
//   const ZScoreControls = () => (
//     <div className="flex items-center mr-5 border border-[#404040] rounded overflow-hidden">
//       <button
//         onClick={() => setShowZScore(!showZScore)}
//         className={`px-2 py-1 border-r border-[#404040] ${showZScore ? 'bg-[#00ffff] text-black' : 'text-[#FF6A00]'}`}
//       >
//         Z-Score
//       </button>
//       <div className={`flex items-center px-2 transition-all ${showZScore ? 'w-32 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
//         <input
//           type="range"
//           min="30"
//           max="365"
//           value={zScoreWindow}
//           onChange={(e) => setZScoreWindow(Number(e.target.value))}
//           className="w-20"
//           style={{
//             WebkitAppearance: 'none',
//             height: '4px',
//             borderRadius: '2px',
//             background: '#404040',
//             backgroundImage: `linear-gradient(#00ffff, #00ffff)`,
//             backgroundSize: `${((zScoreWindow - 30) / (365 - 30)) * 100}% 100%`,
//             backgroundRepeat: 'no-repeat'
//           }}
//         />
//         <span className="text-white ml-2 whitespace-nowrap min-w-[2rem]">{zScoreWindow}</span>
//       </div>
//     </div>
//   );

//   // Add this component for the period buttons
//   const PeriodButtons = ({ 
//     label, 
//     periods = [30, 90, 180, 365], 
//     activePeriod, 
//     onPeriodChange 
//   }: { 
//     label: string;
//     periods: number[];
//     activePeriod: number | null;
//     onPeriodChange: (period: number | null) => void;
//   }) => (
//     <div className="flex items-center mr-5 border border-[#404040] rounded overflow-hidden">
//       <span className="text-[#FF6A00] px-2 py-1 border-r border-[#404040]">{label}</span>
//       <div className="flex items-center">
//         {periods.map((period) => (
//           <button
//             key={period}
//             onClick={() => onPeriodChange(activePeriod === period ? null : period)}
//             className={`${activePeriod === period ? 'bg-[#00ffff] text-black' : 'bg-transparent text-white'} border-none px-2 py-1 cursor-pointer`}
//           >
//             {period}
//           </button>
//         ))}
//       </div>
//     </div>
//   );

//   // Add LookbackButtons component
//   const LookbackButtons = ({ 
//     activePeriod, 
//     onPeriodChange 
//   }: { 
//     activePeriod: string;
//     onPeriodChange: (period: string) => void;
//   }) => (
//     <div className="flex items-center mr-5 border border-[#404040] rounded overflow-hidden">
//       <span className="text-[#FF6A00] px-2 py-1 border-r border-[#404040]">Lookback</span>
//       <div className="flex items-center">
//         {['M', 'Q', 'YTD', 'Y', '2Y', 'AT'].map((period) => (
//           <button
//             key={period}
//             onClick={() => onPeriodChange(period)}
//             className={`${activePeriod === period ? 'bg-[#00ffff] text-black' : 'bg-transparent text-white'} border-none px-2 py-1 cursor-pointer`}
//           >
//             {period}
//           </button>
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className="h-full flex flex-col relative">
//       <div className="flex-grow overflow-hidden">
//         <div className="h-[calc(100%-20px)]">
//           <div className="flex justify-between items-center mb-2.5">
//             <div className="flex items-center">
//               <select
//                 onChange={(e) => onIndicatorSelect(e.target.value)}
//                 className="bg-[#131722] text-white border border-gray-800 rounded p-2"
//               >
//                 <option value="">Add Indicator</option>
//                 {availableIndicators.map((indicator) => (
//                   <option key={indicator} value={indicator}>
//                     {indicator.replace(/_/g, ' ').toUpperCase()}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex items-center">
//               <LookbackButtons 
//                 activePeriod={lookbackPeriod}
//                 onPeriodChange={setLookbackPeriod}
//               />
//               <PeriodButtons 
//                 label="Z-Score"
//                 periods={[30, 90, 180, 365]}
//                 activePeriod={showZScore ? zScoreWindow : null}
//                 onPeriodChange={(period) => {
//                   if (period === null) {
//                     setShowZScore(false);
//                   } else {
//                     setShowZScore(true);
//                     setZScoreWindow(period);
//                   }
//                 }}
//               />
//               <PeriodButtons 
//                 label="MA"
//                 periods={[30, 90, 180, 365]}
//                 activePeriod={movingAveragePeriod}
//                 onPeriodChange={setMovingAveragePeriod}
//               />
//             </div>
//           </div>
//           <div className="border-t border-[#404040] mb-2.5" />
//           <div className="flex h-[calc(100%-60px)]">
//             <div className="flex-grow">
//               <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
//               <div ref={tooltipRef} />
//             </div>
//             <div className="flex">
//               <div className="w-px bg-[#404040]" /> {/* Vertical line */}
//               <Legend />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DataChartD3; 