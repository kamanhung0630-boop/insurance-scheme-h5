/* 友邦保险盈御多元货币计划3 - 主逻辑文件 */

// 页面配置
const CONFIG = {
    // 默认方案参数
    defaultPlan: {
        currency: 'HKD',
        paymentYears: 5,
        annualPremium: 50000,
        age: 35,
        gender: 'female',
        goal: 'education'
    },

    // 计算参数
    calculation: {
        guaranteedRate: 0.02,      // 保证回报率 2%
        nonGuaranteedRate: 0.05,   // 非保证回报率 5%
        projectionYears: 50        // 预测年限 50年以匹配用户数据
    },

    // 产品信息
    product: {
        name: '盈御多元货币计划3',
        description: '多元货币储蓄保险计划，提供长期财富增值和教育金规划',
        features: [
            '多元货币选择',
            '长期储蓄增值',
            '教育金规划',
            '财富传承'
        ]
    }
};

// 格式化货币显示
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// 格式化百分比
function formatPercentage(value) {
    return new Intl.NumberFormat('zh-CN', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value);
}

// 页面初始化
function initializePage() {
    console.log('正在初始化友邦保险方案页面...');

    // 设置页面标题
    document.title = `友邦保险 - ${CONFIG.product.name} | 退休金方案`;

    // 初始化产品信息
    initializeProductInfo();

    // 初始化客户画像
    initializeCustomerProfile();

    // 初始化方案参数
    initializePlanParameters();

    // 初始化计算器
    if (typeof initializeCalculator === 'function') {
        initializeCalculator();
    }

    // 初始化图表
    if (typeof initializeChart === 'function') {
        initializeChart();
    }

    // 设置事件监听器
    setupEventListeners();

    // 初始化悬浮按钮
    initializeFloatingButtons();

    // 初始化滚动动画
    initializeScrollAnimations();

    // 初始计算
    if (typeof updateCalculations === 'function') {
        updateCalculations();
    }

    console.log('页面初始化完成');
}

// 初始化产品信息
function initializeProductInfo() {
    // 设置产品名称
    const productNameElement = document.querySelector('h1.display-4');
    if (productNameElement) {
        productNameElement.textContent = CONFIG.product.name;
    }

    // 设置产品描述（如果需要）
    const productDescriptionElements = document.querySelectorAll('.product-description');
    productDescriptionElements.forEach(el => {
        if (el.dataset.default) {
            el.textContent = CONFIG.product.description;
        }
    });
}

// 初始化客户画像
function initializeCustomerProfile() {
    const customer = CONFIG.defaultPlan;

    // 设置年龄
    const ageElement = document.getElementById('customer-age');
    if (ageElement) {
        ageElement.textContent = `${customer.age}岁`;
    }

    // 设置性别
    const genderElement = document.getElementById('customer-gender');
    if (genderElement) {
        genderElement.textContent = customer.gender === 'male' ? '男性' : '女性';
    }

    // 设置财务目标
    const goalElement = document.getElementById('customer-goal');
    if (goalElement) {
        goalElement.textContent = getGoalText(customer.goal);
    }
}

// 获取财务目标文本
function getGoalText(goal) {
    const goalMap = {
        'retirement': '退休金规划',
        'education': '教育基金',
        'investment': '投资增值',
        'protection': '风险保障'
    };
    return goalMap[goal] || '财务规划';
}

// 初始化方案参数
function initializePlanParameters() {
    const plan = CONFIG.defaultPlan;

    // 设置货币
    const currencyElement = document.getElementById('plan-currency');
    if (currencyElement) {
        currencyElement.textContent = plan.currency;
    }

    // 设置缴费年限
    const yearsElement = document.getElementById('plan-years');
    if (yearsElement) {
        yearsElement.textContent = plan.paymentYears;
    }

    // 设置年缴保费
    const premiumElement = document.getElementById('plan-premium');
    if (premiumElement) {
        premiumElement.textContent = formatCurrency(plan.annualPremium, plan.currency);
    }

    // 计算并显示总缴费
    updateTotalPayment();
}

// 更新总缴费显示
function updateTotalPayment() {
    const plan = CONFIG.defaultPlan;
    const totalPayment = plan.annualPremium * plan.paymentYears;
    const totalPaymentElement = document.getElementById('total-payment');

    if (totalPaymentElement) {
        totalPaymentElement.textContent = formatCurrency(totalPayment, plan.currency);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 图表显示/隐藏切换
    const chartToggle = document.getElementById('show-chart-toggle');
    if (chartToggle) {
        chartToggle.addEventListener('change', function() {
            const chartContainer = document.getElementById('chart-container');
            if (chartContainer) {
                chartContainer.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    // 应用保费按钮
    const applyPremiumButton = document.getElementById('apply-premium');
    if (applyPremiumButton) {
        applyPremiumButton.addEventListener('click', function() {
            const premiumInput = document.getElementById('premium-input');
            if (premiumInput && typeof updateCalculations === 'function') {
                updateCalculations();
            }
        });
    }

    // 输入框回车键支持
    const premiumInput = document.getElementById('premium-input');
    if (premiumInput) {
        premiumInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && typeof updateCalculations === 'function') {
                updateCalculations();
            }
        });
    }

    // 窗口调整大小时更新图表
    window.addEventListener('resize', function() {
        if (typeof resizeChart === 'function') {
            resizeChart();
        }
    });

    // 打印优化
    window.addEventListener('beforeprint', function() {
        document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', function() {
        document.body.classList.remove('printing');
    });
}

// 数据验证
function validatePremium(premium) {
    const minPremium = 10000;
    const maxPremium = 100000;

    if (isNaN(premium) || premium === '') {
        return {
            valid: false,
            message: '请输入有效的保费金额',
            value: minPremium
        };
    }

    premium = parseInt(premium);

    if (premium < minPremium) {
        return {
            valid: false,
            message: `保费不能低于 ${formatCurrency(minPremium)}`,
            value: minPremium
        };
    }

    if (premium > maxPremium) {
        return {
            valid: false,
            message: `保费不能超过 ${formatCurrency(maxPremium)}`,
            value: maxPremium
        };
    }

    return {
        valid: true,
        message: '',
        value: premium
    };
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有通知
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // 5秒后自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// 初始化悬浮按钮和表单
function initializeFloatingButtons() {
    const appointmentBtn = document.getElementById('appointment-btn');
    const shareBtn = document.getElementById('share-btn');
    const printBtn = document.getElementById('print-btn');
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));

    if (appointmentBtn) {
        appointmentBtn.addEventListener('click', function() {
            appointmentModal.show();
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    text: '友邦保险盈御多元货币计划3 - 教育金储蓄方案',
                    url: window.location.href
                }).catch(console.error);
            } else {
                // 回退方案：复制链接到剪贴板
                navigator.clipboard.writeText(window.location.href).then(function() {
                    showNotification('链接已复制到剪贴板！', 'success');
                }).catch(function() {
                    prompt('请手动复制链接:', window.location.href);
                });
            }
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', function() {
            // 使用浏览器打印功能生成PDF
            window.print();
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = {
                name: document.getElementById('clientName').value,
                phone: document.getElementById('clientPhone').value,
                email: document.getElementById('clientEmail').value,
                date: document.getElementById('appointmentDate').value,
                notes: document.getElementById('appointmentNotes').value
            };

            // 这里应该发送到服务器，现在仅模拟
            console.log('预约表单提交:', formData);
            showNotification('预约提交成功！我们会尽快联系您。', 'success');
            appointmentModal.hide();
            appointmentForm.reset();
        });
    }
}

// 初始化滚动动画
function initializeScrollAnimations() {
    const cards = document.querySelectorAll('.card');

    if (!('IntersectionObserver' in window)) {
        // 浏览器不支持IntersectionObserver，直接显示所有卡片
        cards.forEach(card => {
            card.classList.add('card-visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach((card, index) => {
        card.classList.add('card-animate');
        // 添加延迟类
        if (index % 4 === 1) card.classList.add('delay-1');
        if (index % 4 === 2) card.classList.add('delay-2');
        if (index % 4 === 3) card.classList.add('delay-3');
        if (index % 4 === 0 && index !== 0) card.classList.add('delay-4');
        observer.observe(card);
    });
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        formatCurrency,
        formatPercentage,
        validatePremium,
        showNotification
    };
}