// LineChart.tsx
import { onCleanup, createEffect, Component } from 'solid-js';
import 'chartjs-adapter-date-fns';
import Chart, { ChartData, ScriptableContext } from 'chart.js/auto';
import { YearData } from '../../types/YearData';
import { OperationMode } from '../../types/OperationMode';
import { TimesData } from '../../types/TimesData';
import { FeatureTimes } from "../../types/FeatureTimes";

interface LineChartProps {
  data: YearData | undefined;
  operationMode: OperationMode | undefined;
}

const updateFeaturePointsX = (chart: Chart<"line", { x: Date, y: Date }[] | undefined, unknown>, maxDate: Date, minDate: Date) => {
  const maxDayIndex = getDayIndex(maxDate);
  const minDayIndex = getDayIndex(minDate);

  const data = chart.data;
  //todo: complete..
  data.datasets.forEach(dataset => {
    dataset.pointBorderColor = (ctx) => {
      return ctx.dataIndex == maxDayIndex || ctx.dataIndex == minDayIndex ? 'red' : 'green';
    };
    dataset.pointBorderColor = (ctx) => {
      return ctx.dataIndex == maxDayIndex || ctx.dataIndex == minDayIndex ? 'red' : 'green';
    };
  });

}

const getDayIndex = (date: Date) => {
  let firstDay = new Date(date.getFullYear(), 0, 1);
  let diff = +date - +firstDay;
  let index = Math.floor(diff / (1000 * 60 * 60 * 24));
  return index;
}

const LineChart: Component<LineChartProps> = (props) => {
  const canvasRef = (element: HTMLCanvasElement) => {
    createEffect(() => {
      if (element) {
        const ctx = element.getContext('2d');
        if (ctx) {
          const newChart = new Chart(ctx, {
            type: 'line',
            data: {
              datasets: getDatasets(),
            },
            options: {
              scales: {
                x: {
                  type: "time", // use the time scale for the x-axis
                  time: {
                    unit: "month", // display the data by month
                    displayFormats: {
                      month: "MMM", // format the month as Jan, Feb, etc.
                    },
                  },
                },
                y: {
                  type: "time", // use the time scale for the y-axis
                  reverse: true, // reverse so Fajr is at top and Isha at bottom
                  time: {
                    parser: "HH:mm", // parse the data as hours and minutes
                    displayFormats: {
                      hour: "HH:mm", // format the tick labels as hours and minutes
                    },
                  },
                },
              },
              plugins: {
                legend: {
                  display: false, // hide the legend since labels are on the graph
                },
                tooltip: {
                  callbacks: {
                    title: (context) => {
                      if (context.length > 0) {
                        const date = new Date(context[0].parsed.x);
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + '.';
                      }
                      return '';
                    },
                    label: (context) => {
                      const time = new Date(context.parsed.y);
                      const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                      return `${context.dataset.label}: ${timeStr}`;
                    }
                  }
                }
              }
            }
          });

          // Plugin to draw a vertical line for the current day
          const currentDayLinePlugin = {
            id: 'currentDayLine',
            afterDatasetsDraw(chart: Chart) {
              const xScale = chart.scales.x;
              const yScale = chart.scales.y;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const xPosition = xScale.getPixelForValue(today.getTime());
              
              if (xPosition !== undefined && !isNaN(xPosition)) {
                const ctx = chart.ctx;
                ctx.save();
                ctx.strokeStyle = '#999999';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(xPosition, yScale.top);
                ctx.lineTo(xPosition, yScale.bottom);
                ctx.stroke();
                ctx.restore();
              }
            }
          };

          Chart.register(currentDayLinePlugin);

          // Plugin to draw labels directly on the lines
          const lineLabelsPlugin = {
            id: 'lineLabels',
            afterDatasetsDraw(chart: Chart) {
              try {
                const ctx = chart.ctx;
                const xScale = chart.scales.x;
                const yScale = chart.scales.y;
                const chartArea = chart.chartArea;

                if (!chart.data.datasets || chart.data.datasets.length === 0) {
                  return;
                }

                chart.data.datasets.forEach((dataset: any, idx: number) => {
                  if (!dataset.data || dataset.data.length === 0) return;

                  // Use middle point of data for better visibility
                  const midIndex = Math.floor(dataset.data.length / 2);
                  const midDataPoint = dataset.data[midIndex];
                  
                  if (!midDataPoint || typeof midDataPoint.x === 'undefined' || typeof midDataPoint.y === 'undefined') {
                    return;
                  }

                  const xPos = xScale.getPixelForValue(midDataPoint.x);
                  const yPos = yScale.getPixelForValue(midDataPoint.y);
                  
                  if (typeof xPos === 'number' && typeof yPos === 'number' && isFinite(xPos) && isFinite(yPos)) {
                    // Check if position is within chart area
                    if (xPos >= chartArea.left && xPos <= chartArea.right && yPos >= chartArea.top && yPos <= chartArea.bottom) {
                      ctx.save();
                      ctx.font = 'bold 16px Arial';
                      ctx.fillStyle = dataset.baseColor || '#000000';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.lineWidth = 5;
                      ctx.strokeStyle = 'white';
                      
                      ctx.strokeText(dataset.label, xPos, yPos);
                      ctx.fillText(dataset.label, xPos, yPos);
                      ctx.restore();
                    }
                  }
                });
              } catch (e) {
                console.error('Error in lineLabelsPlugin:', e);
              }
            }
          };

          Chart.register(lineLabelsPlugin);
        }
      }
    });
  };

  const getDatasets = () => {
    switch (props.operationMode) {
      case "DayLength":
        return [
          getDataset('sunrise', 'blue', 'white'),
          getDataset('sunset', 'red', 'orange')
        ];

      case "FastingTimes":
        return [
          getDataset('fajr', 'blue', 'white'),
          getDataset('maghrib', 'red', 'orange')
        ];

      case "PrayerTimes":
        return [
          getDataset('fajr', '#FF6B6B'),      // Red
          getDataset('sunrise', '#FFA500'),   // Orange
          getDataset('dhuhr', '#4ECDC4'),     // Teal
          getDataset('asr', '#45B7D1'),       // Blue
          getDataset('maghrib', '#96CEB4'),   // Green
          getDataset('isha', '#6C5CE7')       // Purple
        ];

      default:
        return [];
    }
  }

  const getDataset = (time: string, borderColor: string, backgroundColor: string = 'transparent') => {
    const maxIndex = getDayIndex(props.data?.maxFeatureTimes[time] as Date);
    const minIndex = getDayIndex(props.data?.minFeatureTimes[time] as Date);
    return {
      label: toTitleCase(time),
      data: props.data?.timesData.map(t => ({ x: t.date, y: t[time] })),
      borderWidth: 2,
      fill: true,
      baseColor: borderColor, // Store base color for label rendering
      borderColor: (ctx:ScriptableContext<'line'>) => {
        return ctx.dataIndex == maxIndex || ctx.dataIndex == minIndex ? 'black' : borderColor
      },
      pointStyle: 'circle',
      pointRadius: (ctx: ScriptableContext<'line'>) => {
        if (ctx.dataIndex == maxIndex || ctx.dataIndex == minIndex) return 3;
        return 0; // hide normal points
      },
      pointBorderWidth: (ctx: ScriptableContext<'line'>) => {
        if (ctx.dataIndex == minIndex) return 2; // border for min
        return 0; // no border for max (solid)
      },
      pointBackgroundColor: (ctx: ScriptableContext<'line'>) => {
        if (ctx.dataIndex == maxIndex) return borderColor; // solid with prayer time color for max
        return 'transparent'; // transparent for min (shows border only)
      },
      pointBorderColor: (ctx: ScriptableContext<'line'>) => {
        return borderColor; // use prayer time color for both
      },
      backgroundColor,
    }
  }

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt: string) => {
        return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
      }
    );
  }

  // const ColorPoints = (chart: Chart<"line", { x: Date, y: Date }[] | undefined, unknown>) => {
  //   const maxDayIndex = getDayIndex(maxDate);
  //   const minDayIndex = getDayIndex(minDate);

  //   const data = chart.data;
  //   //todo: complete..
  //   data.dataset.forEach(dataset => { 
  //     dataset.pointBorderColor = (ctx) => {
  //       return ctx.dataIndex == maxDayIndex || ctx.dataIndex == minDayIndex ? 'red' : 'green';
  //     };
  //     dataset.pointBorderColor = (ctx) => {
  //       return ctx.dataIndex == maxDayIndex || ctx.dataIndex == minDayIndex ? 'red' : 'green';
  //     };
  //   });
  // }

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default LineChart;
