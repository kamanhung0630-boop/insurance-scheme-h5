/* 友邦保险盈御多元货币计划3 - 图表逻辑 */

let cashValueChart = null;
let chartData = [];
let pendingChartData = null; // 等待图表初始化的数据
let chartInitialized = false; // 标记图表是否已初始化

// 销毁现有图表
function destroyChart() {
    if (cashValueChart) {
        console.log('销毁现有图表...');
        cashValueChart.destroy();
        cashValueChart = null;
        chartInitialized = false;
    }
}

// 初始化图表
function initializeChart() {
    console.log('正在初始化图表...');

    // 如果图表已初始化，先销毁
    if (chartInitialized && cashValueChart) {
        console.log('图表已初始化，先销毁再重新初始化');
        destroyChart();
    }

    const chartCanvas = document.getElementById('cashValueChart');
    if (!chartCanvas) {
        console.warn('找不到图表画布元素');
        return;
    }

    // 检查canvas是否已被使用
    if (chartCanvas.chart) {
        console.log('Canvas已被使用，销毁现有图表');
        if (chartCanvas.chart.destroy) {
            chartCanvas.chart.destroy();
        }
        chartCanvas.chart = null;
    }

    // 创建图表上下文
    const chartContext = chartCanvas.getContext('2d');

    // 初始图表数据
    chartData = getInitialChartData();

    try {
        // 创建图表
        cashValueChart = new Chart(chartContext, {
            type: 'line',
            data: getChartData(chartData),
            options: getChartOptions()
        });

        // 将图表引用保存到canvas元素上
        chartCanvas.chart = cashValueChart;
        chartInitialized = true;

        // 调整图表大小以适应容器
        resizeChart();

        console.log('图表初始化完成，现金价值图表已创建');

        // 检查是否有待处理的图表数据
        if (pendingChartData && pendingChartData.length > 0) {
            console.log(`应用待处理的图表数据: ${pendingChartData.length}年`);
            updateChart(pendingChartData);
            pendingChartData = null;
        } else {
            console.log('没有待处理的图表数据');
        }
    } catch (error) {
        console.error('初始化图表时出错:', error);
        // 尝试清理并重新初始化
        if (cashValueChart && cashValueChart.destroy) {
            cashValueChart.destroy();
            cashValueChart = null;
        }
        chartCanvas.chart = null;
        chartInitialized = false;
    }
}

// 获取初始图表数据
function getInitialChartData() {
    // 返回空数据，等待计算器计算结果
    return [];
}

// 获取图表数据
function getChartData(data) {
    const years = data.map(item => item.year);
    const guaranteedValues = data.map(item => item.guaranteedValue);
    const nonGuaranteedValues = data.map(item => item.nonGuaranteedValue);
    const totalValues = data.map(item => item.totalValue);

    return {
        labels: years,
        datasets: [
            {
                label: '保证现金价值',
                data: guaranteedValues,
                borderColor: '#198754', // 绿色
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: '非保证现金价值',
                data: nonGuaranteedValues,
                borderColor: '#FFC107', // 黄色
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: '总现金价值',
                data: totalValues,
                borderColor: '#0056B3', // 友邦蓝
                backgroundColor: 'rgba(0, 86, 179, 0.1)',
                borderWidth: 4,
                fill: false,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#0056B3'
            }
        ]
    };
}

// 获取图表选项
function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Noto Sans SC', sans-serif",
                        size: 14
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: "'Noto Sans SC', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Noto Sans SC', sans-serif",
                    size: 13
                },
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    },
                    title: function(context) {
                        return `第${context[0].label}年`;
                    }
                }
            },
            title: {
                display: true,
                text: '现金价值增长趋势 (HKD)',
                font: {
                    family: "'Noto Sans SC', sans-serif",
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: '保单年度',
                    font: {
                        family: "'Noto Sans SC', sans-serif",
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        family: "'Noto Sans SC', sans-serif",
                        size: 12
                    },
                    callback: function(value) {
                        // 每5年显示一个标签
                        if (value % 5 === 0) {
                            return `第${value}年`;
                        }
                        return '';
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: '现金价值 (HKD)',
                    font: {
                        family: "'Noto Sans SC', sans-serif",
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        family: "'Noto Sans SC', sans-serif",
                        size: 12
                    },
                    callback: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                        return value;
                    }
                },
                beginAtZero: true
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        elements: {
            point: {
                hoverBackgroundColor: '#FFFFFF',
                hoverBorderColor: '#0056B3',
                hoverBorderWidth: 3
            }
        }
    };
}

// 更新图表
function updateChart(data) {
    // 检查数据是否有效
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('图表数据无效:', data);
        return;
    }

    // 检查图表是否已初始化
    if (!cashValueChart) {
        console.log(`图表未初始化，保存待处理数据: ${data.length}年`);
        pendingChartData = data;
        return;
    }

    chartData = data;

    // 检查数据是否包含有效数值
    const validData = data.filter(item =>
        item &&
        typeof item.guaranteedValue === 'number' &&
        typeof item.nonGuaranteedValue === 'number' &&
        typeof item.totalValue === 'number'
    );

    if (validData.length === 0) {
        console.warn('图表数据中没有有效的数值:', data);
        return;
    }

    console.log(`更新图表数据: ${validData.length}年有效数据`);

    // 更新图表数据
    try {
        cashValueChart.data = getChartData(validData);
        // 更新图表
        cashValueChart.update('none');
        console.log(`图表已成功更新，显示${validData.length}年的数据`);
    } catch (error) {
        console.error('更新图表时出错:', error);
    }
}

// 调整图表大小
function resizeChart() {
    if (!cashValueChart) return;

    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) return;

    // 根据容器大小调整图表高度
    const containerWidth = chartContainer.clientWidth;
    const aspectRatio = containerWidth > 768 ? 2 : 1.5;
    const chartHeight = containerWidth / aspectRatio;

    const chartCanvas = document.getElementById('cashValueChart');
    if (chartCanvas) {
        chartCanvas.style.height = `${chartHeight}px`;
    }

    cashValueChart.resize();
}

// 切换图表显示
function toggleChartVisibility(show) {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
        chartContainer.style.display = show ? 'block' : 'none';
    }

    if (show && cashValueChart) {
        setTimeout(resizeChart, 100);
    }
}

// 导出图表为图片
function exportChart() {
    if (!cashValueChart) {
        showNotification('图表未初始化', 'warning');
        return;
    }

    const link = document.createElement('a');
    link.download = `友邦保险-现金价值图表-${new Date().toISOString().split('T')[0]}.png`;
    link.href = cashValueChart.toBase64Image();
    link.click();
}

// 重置图表缩放
function resetChartZoom() {
    if (cashValueChart && cashValueChart.resetZoom) {
        cashValueChart.resetZoom();
    }
}

// 高亮特定年份
function highlightYear(year) {
    if (!cashValueChart || !chartData.length) return;

    const yearIndex = year - 1;
    if (yearIndex < 0 || yearIndex >= chartData.length) return;

    // 更新所有数据点样式
    cashValueChart.data.datasets.forEach(dataset => {
        dataset.pointBackgroundColor = dataset.data.map((_, index) => {
            return index === yearIndex ? '#FF6B35' : dataset.borderColor;
        });
        dataset.pointRadius = dataset.data.map((_, index) => {
            return index === yearIndex ? 8 : 4;
        });
    });

    cashValueChart.update();
}


// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeChart,
        updateChart,
        resizeChart,
        toggleChartVisibility,
        exportChart,
        resetChartZoom,
        highlightYear,
        cashValueChart
    };
}