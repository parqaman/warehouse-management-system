import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  SubTitle,
  Title,
  Tooltip,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  SubTitle,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: Map<string, number> | undefined;
  chartTitle?: string;
  chartSubTitle?: string;
}

export const BarChart = ({
  data,
  chartTitle,
  chartSubTitle,
}: BarChartProps) => {
  return (
    <Bar
      data={{
        labels: data?.keys() ? Array.from(data.keys()) : [],
        datasets: [
          {
            data: data?.values() ? Array.from(data.values()) : [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      }}
      options={{
        plugins: {
          filler: {
            propagate: true,
            drawTime: 'beforeDraw',
          },
          title: {
            align: 'center',
            display: true,
            position: 'top',
            color: '#000000',
            font: {
              size: 24,
            },
            fullSize: true,
            padding: {
              top: 15,
              bottom: 15,
            },
            text: chartTitle,
          },
          subtitle: {
            align: 'center',
            display: true,
            position: 'bottom',
            color: '#000000',
            font: {
              size: 16,
            },
            fullSize: true,
            padding: {
              top: 15,
              bottom: 15,
            },
            text: chartSubTitle,
          },
          legend: {
            display: false,
          },
        },
        maintainAspectRatio: false,
        responsive: true,
      }}
    />
  );
};
