import { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import "chart.js/auto";


const BarChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartData = {
        labels: ['Male', 'Female'],
        datasets: [
            {
                label: '# of Patients with Brain Tumor',
                data: data,
                backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
                borderColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderWidth: 1,
            },
        ],
    };
    const options = {
        scales: {
            y: {
                type: 'linear',
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            },
            x: {
                barPercentage: 0.5,
                categoryPercentage: 1.0
            }
        }
    };

    return <Bar ref={chartRef} data={chartData} options={options} />;
};

export default BarChart;