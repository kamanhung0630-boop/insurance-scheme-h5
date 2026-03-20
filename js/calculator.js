/* 友邦保险盈御多元货币计划3 - 计算器逻辑 */

// 引用主配置
let CALC_CONFIG = window.CONFIG;

// 如果window.CONFIG不存在，使用默认配置
if (!CALC_CONFIG) {
    CALC_CONFIG = {
        defaultPlan: {
            currency: 'USD',
            paymentYears: 10,
            annualPremium: 10000,
            age: 34
        },
        calculation: {
            guaranteedRate: 0.02,
            nonGuaranteedRate: 0.05,
            projectionYears: 30
        }
    };
}

// 现金价值计算结果
let calculationResults = [];

// 基准现金价值数据（基于250,000 HKD总保费，年缴50,000 HKD × 5年）
const BENCHMARK_DATA = [
    { year: 5, age: 40, accumulatedPremium: 250000, totalCashValue: 190000, premiumMultiple: 0.76, significance: "繳費期滿，不建議提取", returnStatus: "尚未回本" },
    { year: 8, age: 43, accumulatedPremium: 250000, totalCashValue: 250000, premiumMultiple: 1.0, significance: "預期回本期", returnStatus: "回本" },
    { year: 9, age: 44, accumulatedPremium: 250000, totalCashValue: 260000, premiumMultiple: 1.04, significance: "預期回本期", returnStatus: "回本" },
    { year: 15, age: 50, accumulatedPremium: 250000, totalCashValue: 400000, premiumMultiple: 1.6, significance: "可考慮紅利鎖定", returnStatus: "增值期" },
    { year: 20, age: 55, accumulatedPremium: 250000, totalCashValue: 575000, premiumMultiple: 2.3, significance: "孩子大學教育金", returnStatus: "增值期" },
    { year: 30, age: 65, accumulatedPremium: 250000, totalCashValue: 1150000, premiumMultiple: 4.6, significance: "媽媽退休金", returnStatus: "退休規劃" },
    { year: 40, age: 75, accumulatedPremium: 250000, totalCashValue: 2250000, premiumMultiple: 9.0, significance: "指數級增長", returnStatus: "財富累積" },
    { year: 50, age: 85, accumulatedPremium: 250000, totalCashValue: 4250000, premiumMultiple: 17.0, significance: "財富傳承給孫輩", returnStatus: "財富傳承" }
];

// 插值函数
function interpolateValue(year, dataPoints, valueKey) {
    // 如果年份正好在数据点中，直接返回
    const exactMatch = dataPoints.find(dp => dp.year === year);
    if (exactMatch) return exactMatch[valueKey];

    // 对于数值数据（如现金价值），假设第0年为0
    const isNumericValue = typeof dataPoints[0][valueKey] === 'number';

    // 找到前后数据点
    let prevPoint = null;
    let nextPoint = null;

    for (const point of dataPoints) {
        if (point.year < year) {
            if (!prevPoint || point.year > prevPoint.year) {
                prevPoint = point;
            }
        } else if (point.year > year) {
            if (!nextPoint || point.year < nextPoint.year) {
                nextPoint = point;
            }
        }
    }

    // 处理数值数据的特殊逻辑
    if (isNumericValue) {
        // 如果年份小于第一个数据点（第5年），在第0年(0)和第一个点之间插值
        if (!prevPoint && year < dataPoints[0].year) {
            const firstPoint = dataPoints[0];
            const ratio = year / firstPoint.year;
            return firstPoint[valueKey] * ratio;
        }

        // 如果年份大于最后一个数据点，使用最后一个点的值（或适当外推）
        if (!nextPoint && year > dataPoints[dataPoints.length - 1].year) {
            const lastPoint = dataPoints[dataPoints.length - 1];
            // 简单外推：假设年增长率与最后一段相同
            const secondLastPoint = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : null;
            if (secondLastPoint) {
                const lastSegmentYears = lastPoint.year - secondLastPoint.year;
                const lastSegmentGrowth = lastPoint[valueKey] / secondLastPoint[valueKey];
                const annualGrowthRate = Math.pow(lastSegmentGrowth, 1/lastSegmentYears);
                const yearsSinceLast = year - lastPoint.year;
                return lastPoint[valueKey] * Math.pow(annualGrowthRate, yearsSinceLast);
            }
            return lastPoint[valueKey];
        }
    }

    // 对于一般情况（包括找不到前后点的情况）
    if (!prevPoint) return dataPoints[0][valueKey];
    if (!nextPoint) return dataPoints[dataPoints.length - 1][valueKey];

    // 对于字符串值（如significance, returnStatus），返回最接近的点的值
    if (typeof prevPoint[valueKey] === 'string') {
        const prevDistance = year - prevPoint.year;
        const nextDistance = nextPoint.year - year;
        return prevDistance <= nextDistance ? prevPoint[valueKey] : nextPoint[valueKey];
    }

    // 对于数值，线性插值
    const ratio = (year - prevPoint.year) / (nextPoint.year - prevPoint.year);
    const prevValue = prevPoint[valueKey];
    const nextValue = nextPoint[valueKey];

    return prevValue + ratio * (nextValue - prevValue);
}

// 计算保证和非保证现金价值的分配比例
function getGuaranteedRatio(year) {
    if (year <= 5) return 0.8;  // 早期保证比例高
    if (year <= 10) return 0.7;
    if (year <= 20) return 0.6;
    return 0.5;  // 长期非保证比例增加
}

// 初始化计算器
function initializeCalculator() {
    console.log('正在初始化计算器...');

    // 获取DOM元素
    const premiumSlider = document.getElementById('premium-slider');
    const premiumInput = document.getElementById('premium-input');
    const applyPremiumButton = document.getElementById('apply-premium');

    // 设置滑块初始值
    if (premiumSlider) {
        premiumSlider.value = CALC_CONFIG.defaultPlan.annualPremium;
    }

    // 设置输入框初始值
    if (premiumInput) {
        premiumInput.value = CALC_CONFIG.defaultPlan.annualPremium;
    }

    // 绑定事件监听器
    bindCalculatorEvents();

    // 初始计算
    updateCalculations();

    console.log('计算器初始化完成');
}

// 绑定计算器事件
function bindCalculatorEvents() {
    const premiumSlider = document.getElementById('premium-slider');
    const premiumInput = document.getElementById('premium-input');
    const applyPremiumButton = document.getElementById('apply-premium');

    if (!premiumSlider || !premiumInput) {
        console.error('找不到计算器元素');
        return;
    }

    // 滑块变化事件
    premiumSlider.addEventListener('input', function() {
        premiumInput.value = this.value;
        updateCalculations();
    });

    // 输入框变化事件
    premiumInput.addEventListener('input', function() {
        const validation = validatePremium(this.value);
        if (!validation.valid) {
            this.value = validation.value;
        }
        premiumSlider.value = this.value;
    });

    premiumInput.addEventListener('change', function() {
        updateCalculations();
    });

    // 应用按钮点击事件
    if (applyPremiumButton) {
        applyPremiumButton.addEventListener('click', updateCalculations);
    }

    // 输入框回车键支持
    premiumInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            updateCalculations();
        }
    });
}

// 更新所有计算
function updateCalculations() {
    const premium = getCurrentPremium();
    if (premium === null) return;

    // 更新显示
    updatePremiumDisplay(premium);

    // 计算现金价值
    calculateCashValues(premium);

    // 更新表格
    updateCashValueTable();

    // 更新图表
    if (typeof updateChart === 'function') {
        updateChart(calculationResults);
    }

    // 更新预计退休金
    updateEstimatedPension();
}

// 获取当前保费
function getCurrentPremium() {
    const premiumInput = document.getElementById('premium-input');
    if (!premiumInput) return CALC_CONFIG.defaultPlan.annualPremium;

    const validation = validatePremium(premiumInput.value);
    if (!validation.valid) {
        showNotification(validation.message, 'warning');
        premiumInput.value = validation.value;
        return validation.value;
    }

    return validation.value;
}

// 更新保费显示
function updatePremiumDisplay(premium) {
    // 更新保费值显示
    const premiumValueElement = document.getElementById('premium-value');
    if (premiumValueElement) {
        premiumValueElement.textContent = formatCurrency(premium);
    }

    // 更新方案参数中的保费显示
    const planPremiumElement = document.getElementById('plan-premium');
    if (planPremiumElement) {
        planPremiumElement.textContent = formatCurrency(premium);
    }

    // 更新总缴费
    updateTotalPayment(premium);
}

// 更新总缴费显示
function updateTotalPayment(premium) {
    const totalPayment = premium * CALC_CONFIG.defaultPlan.paymentYears;
    const totalPaymentElement = document.getElementById('total-payment');

    if (totalPaymentElement) {
        totalPaymentElement.textContent = formatCurrency(totalPayment);
    }
}

// 计算现金价值（基于用户提供的基准数据）
function calculateCashValues(premium) {
    calculationResults = [];

    const { paymentYears, age } = CALC_CONFIG.defaultPlan;
    const projectionYears = 50; // 使用用户提供的50年数据

    console.log(`开始计算现金价值，保费: ${premium} USD, 缴费年限: ${paymentYears}年`);

    for (let year = 1; year <= projectionYears; year++) {
        const currentAge = age + year;
        const accumulatedPremium = Math.min(year, paymentYears) * premium;

        // 计算比例因子（当前累计保费相对于基准累计保费）
        const benchmarkAccumulatedPremium = 250000; // 基准数据中的累计保费 (50,000 HKD × 5年)
        const scalingFactor = accumulatedPremium / benchmarkAccumulatedPremium;

        // 从基准数据插值计算总现金价值
        const benchmarkTotalValue = interpolateValue(year, BENCHMARK_DATA, 'totalCashValue');
        const totalValue = benchmarkTotalValue * scalingFactor;

        // 计算保费倍数（总现金价值 / 累计保费）
        const premiumMultiple = totalValue / accumulatedPremium;

        // 从基准数据插值获取阶段性意义
        let significance = interpolateValue(year, BENCHMARK_DATA, 'significance');
        let returnStatus = interpolateValue(year, BENCHMARK_DATA, 'returnStatus');

        // 如果没有插值到具体意义，根据保费倍数推断
        if (significance === '') {
            if (premiumMultiple < 1) {
                significance = '尚未回本，不建議提取';
                returnStatus = '尚未回本';
            } else if (premiumMultiple < 1.5) {
                significance = '回本期，可考慮持有';
                returnStatus = '回本';
            } else if (premiumMultiple < 3) {
                significance = '增值期，適合中期規劃';
                returnStatus = '增值期';
            } else if (premiumMultiple < 5) {
                significance = '高增長期，適合退休規劃';
                returnStatus = '退休規劃';
            } else {
                significance = '財富累積期，適合傳承規劃';
                returnStatus = '財富傳承';
            }
        }

        // 按比例分配保证和非保证现金价值
        const guaranteedRatio = getGuaranteedRatio(year);
        const guaranteedValue = totalValue * guaranteedRatio;
        const nonGuaranteedValue = totalValue * (1 - guaranteedRatio);

        // 调试输出关键年份
        if (year <= 5 || year === 10 || year === 20 || year === 30 || year === 40 || year === 50) {
            console.log(`第${year}年: 年龄${currentAge}岁, 累计保费${formatCurrency(accumulatedPremium)}, ` +
                `基准价值${formatCurrency(benchmarkTotalValue)}, 缩放因子${scalingFactor.toFixed(2)}, ` +
                `总价值${formatCurrency(totalValue)}, 保证${formatCurrency(guaranteedValue)}, ` +
                `非保证${formatCurrency(nonGuaranteedValue)}`);
        }

        calculationResults.push({
            year: year,
            age: currentAge,
            accumulatedPremium: accumulatedPremium,
            guaranteedValue: guaranteedValue,
            nonGuaranteedValue: nonGuaranteedValue,
            totalValue: totalValue,
            premiumMultiple: premiumMultiple,
            significance: significance,
            returnStatus: returnStatus
        });
    }

    console.log(`现金价值计算完成，基于用户数据共${calculationResults.length}年的数据`);

    // 检查前几个数据点是否有效
    if (calculationResults.length > 0) {
        const firstData = calculationResults[0];
        console.log('第一年数据检查:', {
            year: firstData.year,
            totalValue: firstData.totalValue,
            guaranteedValue: firstData.guaranteedValue,
            nonGuaranteedValue: firstData.nonGuaranteedValue,
            isValid: !isNaN(firstData.totalValue) && !isNaN(firstData.guaranteedValue) && !isNaN(firstData.nonGuaranteedValue)
        });
    }

    return calculationResults;
}

// 更新现金价值表格
function updateCashValueTable() {
    const tableBody = document.getElementById('cash-value-table');
    if (!tableBody) return;

    // 清空现有行
    tableBody.innerHTML = '';

    // 添加新行（每5年显示一次，前10年每年显示）
    calculationResults.forEach(result => {
        // 前10年每年显示，之后每5年显示一次
        if (result.year <= 10 || result.year % 5 === 0) {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.style.animationDelay = `${result.year * 0.05}s`;

            // 高亮特定年份
            if (result.year === CALC_CONFIG.defaultPlan.paymentYears) {
                row.classList.add('table-primary');
            } else if (result.year === 20 || result.year === 30) {
                row.classList.add('table-info');
            }

            // 格式化保费倍数
            const multipleText = result.premiumMultiple < 1 ?
                `尚未回本` :
                `${result.premiumMultiple.toFixed(1)}倍`;

            // 根据倍数设置颜色
            let multipleColorClass = 'text-muted';
            if (result.premiumMultiple >= 1) multipleColorClass = 'text-success';
            if (result.premiumMultiple >= 2) multipleColorClass = 'text-primary';
            if (result.premiumMultiple >= 4) multipleColorClass = 'text-warning';
            if (result.premiumMultiple >= 8) multipleColorClass = 'text-danger';

            row.innerHTML = `
                <td class="fw-bold">第${result.year}年</td>
                <td>${result.age}岁</td>
                <td class="text-primary fw-semibold">${formatCurrency(result.accumulatedPremium)}</td>
                <td class="text-success fw-bold">${formatCurrency(result.totalValue)}</td>
                <td class="${multipleColorClass} fw-semibold">${multipleText}</td>
                <td class="text-muted">${result.significance}</td>
            `;

            tableBody.appendChild(row);
        }
    });

    // 如果表格为空，添加一行说明
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center text-muted py-4">
                <i class="fas fa-calculator me-2"></i>
                请调整保费以查看现金价值预测
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// 更新预计退休金
function updateEstimatedPension() {
    const estimatedPensionElement = document.getElementById('estimated-pension');
    if (!estimatedPensionElement || calculationResults.length === 0) return;

    // 假设客户在65岁退休（当前34岁，31年后）
    const retirementYear = 31;
    let retirementValue;

    if (retirementYear <= calculationResults.length) {
        retirementValue = calculationResults[retirementYear - 1].totalValue;
    } else {
        // 如果预测年限不够，使用最后一年数据
        retirementValue = calculationResults[calculationResults.length - 1].totalValue;
    }

    estimatedPensionElement.textContent = formatCurrency(retirementValue);
    estimatedPensionElement.classList.remove('text-muted');
    estimatedPensionElement.classList.add('text-success');
}

// 获取现金价值数据
function getCashValueData() {
    return calculationResults;
}

// 获取特定年份的现金价值
function getCashValueByYear(year) {
    if (year < 1 || year > calculationResults.length) {
        return null;
    }
    return calculationResults[year - 1];
}

// 获取当前配置
function getCurrentConfig() {
    const premium = getCurrentPremium();
    return {
        premium: premium,
        paymentYears: CALC_CONFIG.defaultPlan.paymentYears,
        age: CALC_CONFIG.defaultPlan.age,
        currency: CALC_CONFIG.defaultPlan.currency,
        calculation: CALC_CONFIG.calculation
    };
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCalculator,
        updateCalculations,
        getCashValueData,
        getCashValueByYear,
        getCurrentConfig,
        calculationResults
    };
}