// 全局变量
let countdownInterval;
let userSettings = {
    username: '',
    offworkTime: '18:00'
};

// 法定节假日数据
// 每年根据国务院发布的节假日安排更新
// 来源：https://www.gov.cn/zhengce/content/202511/content_7047090.htm
// 更新方法：
// 1. 访问国务院网站获取最新节假日安排
// 2. 更新每个节假日的名称、日期和天数
// 3. 确保日期格式为 'YYYY-MM-DD'
// 4. 确保days字段为实际放假天数
const holidays = [
    { name: '元旦', date: '2026-01-01', days: 3 },
    { name: '春节', date: '2026-02-15', days: 9 },
    { name: '清明节', date: '2026-04-04', days: 3 },
    { name: '劳动节', date: '2026-05-01', days: 5 },
    { name: '端午节', date: '2026-06-19', days: 3 },
    { name: '中秋节', date: '2026-09-25', days: 3 },
    { name: '国庆节', date: '2026-10-01', days: 7 }
];

// DOM元素
const setupPage = document.getElementById('setup-page');
const countdownPage = document.getElementById('countdown-page');
const celebration = document.getElementById('celebration');
const usernameInput = document.getElementById('username');
const offworkTimeSelect = document.getElementById('offwork-time');
const startCountdownBtn = document.getElementById('start-countdown');
const backToSetupBtn = document.getElementById('back-to-setup');
const nineSixBtn = document.getElementById('nine-six');
const tenSevenBtn = document.getElementById('ten-seven');
const userDisplay = document.getElementById('user-display');
const currentTimeEl = document.querySelector('.current-time');
const offworkCountdownEl = document.getElementById('offwork-countdown');
const weekendCountdownEl = document.getElementById('weekend-countdown');
const holidayCountdownEl = document.getElementById('holiday-countdown');
const nextWeekendCountdownEl = document.getElementById('next-weekend-countdown');
const springFestivalCountdownEl = document.getElementById('spring-festival-countdown');

// 初始化事件监听器
function initEventListeners() {
    startCountdownBtn.addEventListener('click', startCountdown);
    backToSetupBtn.addEventListener('click', backToSetup);
}

// 开始倒计时
function startCountdown() {
    userSettings.username = usernameInput.value || '用户';
    userSettings.offworkTime = offworkTimeSelect.value;
    
    // 显示倒计时页面
    setupPage.style.display = 'none';
    countdownPage.style.display = 'block';
    
    // 显示用户名
    userDisplay.textContent = userSettings.username;
    
    // 开始实时更新
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 100);
}

// 返回设置页面
function backToSetup() {
    clearInterval(countdownInterval);
    countdownPage.style.display = 'none';
    setupPage.style.display = 'block';
}

// 更新倒计时
function updateCountdown() {
    const now = new Date();
    
    // 更新当前时间
    updateCurrentTime(now);
    
    // 计算下班时间倒计时
    updateOffworkCountdown(now);
    
    // 计算周末倒计时
    updateWeekendCountdown(now);
    
    // 计算法定节假日倒计时
    updateHolidayCountdown(now);
    
    // 计算春节倒计时
    updateSpringFestivalCountdown(now);
    
    // 计算今年剩余时间
    calculateYearSummary();
}

// 更新当前时间
function updateCurrentTime(now) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    currentTimeEl.innerHTML = `当前时间是     <span>${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}</span>`;
}

// 计算下班时间倒计时
function updateOffworkCountdown(now) {
    const [offworkHours, offworkMinutes] = userSettings.offworkTime.split(':').map(Number);
    const offworkTime = new Date(now);
    offworkTime.setHours(offworkHours, offworkMinutes, 0, 0);
    
    // 如果下班时间已过，设置为明天的下班时间
    if (offworkTime <= now) {
        offworkTime.setDate(offworkTime.getDate() + 1);
    }
    
    const diff = offworkTime - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const milliseconds = Math.floor((diff % 1000) / 10);
    
    // 格式化毫秒为两位数字
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(2, '0');
    
    // 更新标题
    offworkCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">下班</span>仅剩</span><span class="time">${formattedHours}时 ${formattedMinutes}分 ${formattedSeconds}秒 ${formattedMilliseconds}</span>`;
    
    // 检查是否到达下班时间
    if (diff <= 100) {
        showCelebration('下班', '下班啦！', '快回家好好休息吧！');
    }
}

// 计算周末倒计时
function updateWeekendCountdown(now) {
    const dayOfWeek = now.getDay(); // 0-6，0是周日
    let daysToWeekend;
    
    if (dayOfWeek === 0) {
        daysToWeekend = 6; // 周日距离下周六还有6天
    } else {
        daysToWeekend = 6 - dayOfWeek; // 其他天距离周六的天数
    }
    
    // 更新标题
    weekendCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">周末</span>休息仅剩</span><span class="time">${daysToWeekend}天</span>`;
    
    // 检查是否到达周末
    if (dayOfWeek === 6) {
        showCelebration('周末', '放假啦！', '周末好好放松一下');
    }
}

// 计算法定节假日倒计时
function updateHolidayCountdown(now) {
    const currentDate = new Date(now);
    const currentYear = currentDate.getFullYear();
    
    // 过滤出当前年份的节假日并按日期排序
    const currentYearHolidays = holidays
        .map(holiday => {
            const holidayDate = new Date(holiday.date);
            return { ...holiday, date: holidayDate };
        })
        .filter(holiday => holiday.date.getFullYear() === currentYear)
        .sort((a, b) => a.date - b.date);
    
    // 找到下一个节假日
    const nextHoliday = currentYearHolidays.find(holiday => holiday.date > currentDate);
    
    // 计算距离周末的天数
    const dayOfWeek = currentDate.getDay();
    let daysToWeekend;
    if (dayOfWeek === 0) {
        daysToWeekend = 6;
    } else {
        daysToWeekend = 6 - dayOfWeek;
    }
    
    // 计算距离下一个节假日的天数
    let daysToHoliday = Infinity;
    if (nextHoliday) {
        daysToHoliday = Math.ceil((nextHoliday.date - currentDate) / (1000 * 60 * 60 * 24));
    }
    
    // 根据周末和节假日的远近调整显示顺序
    if (daysToWeekend < daysToHoliday) {
        // 周末更近
        weekendCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">周末</span>休息仅剩</span><span class="time">${daysToWeekend}天</span>`;
        
        if (nextHoliday) {
            const workdaysToHoliday = calculateWorkdays(currentDate, nextHoliday.date);
            holidayCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">${nextHoliday.name}</span>放假仅剩（工作日）</span><span class="time">${workdaysToHoliday}天</span>`;
            
            // 计算下下个节假日
            const nextNextHolidayIndex = currentYearHolidays.findIndex(holiday => holiday.date > currentDate) + 1;
            const nextNextHoliday = currentYearHolidays[nextNextHolidayIndex];
            
            if (nextNextHoliday) {
                const workdaysToNextHoliday = calculateWorkdays(currentDate, nextNextHoliday.date);
                nextWeekendCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">${nextNextHoliday.name}</span>假仅剩（工作日）</span><span class="time">${workdaysToNextHoliday}天</span>`;
            } else {
                nextWeekendCountdownEl.closest('.countdown-box').querySelector('h3').textContent = '距离下一个假期还有一段时间';
            }
        } else {
            holidayCountdownEl.closest('.countdown-box').querySelector('h3').textContent = '距离下一个假期还有一段时间';
            nextWeekendCountdownEl.closest('.countdown-box').querySelector('h3').textContent = '距离下一个假期还有一段时间';
        }
    } else {
        // 法定节假日更近
        if (nextHoliday) {
            const workdaysToHoliday = calculateWorkdays(currentDate, nextHoliday.date);
            holidayCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">${nextHoliday.name}</span>假仅剩（工作日）</span><span class="time">${workdaysToHoliday}天</span>`;
            
            // 计算下一个周末
            weekendCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离下一次<span class="keyword">周末</span>休息仅剩（工作日）</span><span class="time">${daysToWeekend}天</span>`;
            
            // 计算下下个节假日
            const nextNextHolidayIndex = currentYearHolidays.findIndex(holiday => holiday.date > currentDate) + 1;
            const nextNextHoliday = currentYearHolidays[nextNextHolidayIndex];
            
            if (nextNextHoliday) {
                const workdaysToNextHoliday = calculateWorkdays(currentDate, nextNextHoliday.date);
                nextWeekendCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">${nextNextHoliday.name}</span>假期仅剩（工作日）</span><span class="time">${workdaysToNextHoliday}天</span>`;
            } else {
                nextWeekendCountdownEl.closest('.countdown-box').querySelector('h3').textContent = '距离下一个假期还有一段时间';
            }
        } else {
            holidayCountdownEl.closest('.countdown-box').querySelector('h3').textContent = '距离下一个假期还有一段时间';
            weekendCountdownEl.closest('.countdown-box').querySelector('h3').innerHTML = `<span class="text-part">距离<span class="keyword">周末</span>休息仅剩</span><span class="time">${daysToWeekend}天</span>`;
            nextWeekendCountdownEl.closest('.countdown-box').querySelector('h3').textContent = '距离下一个假期还有一段时间';
        }
    }
    
    // 检查是否到达节假日
    if (nextHoliday && Math.abs(currentDate - nextHoliday.date) < 86400000) {
        showCelebration('假期', '放假啦！', '出门好好玩一下');
    }
}

// 计算春节倒计时
function updateSpringFestivalCountdown(now) {
    const currentDate = new Date(now);
    const currentYear = currentDate.getFullYear();
    
    // 找到春节
    const springFestival = holidays.find(holiday => holiday.name === '春节');
    let springFestivalDate = new Date(springFestival.date);
    
    // 如果今年春节已过，计算明年春节
    if (springFestivalDate < currentDate) {
        // 简单处理，实际应该根据农历计算
        springFestivalDate = new Date(`${currentYear + 1}-01-28`);
    }
    
    // 计算自然日倒计时
    const daysToSpringFestival = Math.ceil((springFestivalDate - currentDate) / (1000 * 60 * 60 * 24));
    
    // 计算工作日倒计时
    const workdaysToSpringFestival = calculateWorkdays(currentDate, springFestivalDate);
    
    // 直接通过ID获取倒计时框，避免依赖springFestivalCountdownEl
    const countdownBox = document.querySelector('#spring-festival-countdown').closest('.countdown-box');
    countdownBox.innerHTML = `
        <h3><span class="text-part">距离<span class="keyword">过年</span>放假仅剩</span><span class="time">${daysToSpringFestival}天</span></h3>
        <h3><span class="text-part">距离<span class="keyword">过年</span>再上班</span><span class="time">${workdaysToSpringFestival}天</span></h3>
        <div id="spring-festival-countdown"></div>
    `;
    
    // 检查是否到达春节
    if (Math.abs(currentDate - springFestivalDate) < 86400000) {
        showCelebration('春节', '过年啦！', '新年快乐，今年你是最棒的自己！');
    }
}

// 计算两个日期之间的工作日
function calculateWorkdays(startDate, endDate) {
    let workdays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workdays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workdays;
}

// 显示庆祝动画
function showCelebration(type, title, message) {
    celebration.style.display = 'flex';
    celebration.querySelector('h2').textContent = title;
    celebration.querySelector('p').textContent = message;
    
    // 根据类型设置按钮文本
    const buttonsContainer = celebration.querySelector('.celebration-buttons');
    if (type === '下班') {
        buttonsContainer.innerHTML = '<button id="celebration-close">立即下班</button>';
    } else {
        buttonsContainer.innerHTML = '<button id="celebration-close">立即放假</button>';
    }
    
    // 生成撒花效果
    createConfetti();
    
    // 添加按钮点击事件
    document.querySelectorAll('#celebration-close').forEach(button => {
        button.addEventListener('click', () => {
            celebration.style.display = 'none';
        });
    });
}

// 计算今年剩余时间
function calculateYearSummary() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    
    // 计算剩余周末数量
    let remainingWeekends = 0;
    let currentDate = new Date(now);
    while (currentDate <= endOfYear) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            remainingWeekends++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    remainingWeekends = Math.floor(remainingWeekends / 2); // 每周末2天
    
    // 计算剩余法定节假日数量和总天数（排除春节）
    const currentYearHolidays = holidays
        .filter(holiday => holiday.name !== '春节') // 排除春节
        .filter(holiday => new Date(holiday.date).getFullYear() === currentYear && new Date(holiday.date) > now);
    const remainingHolidays = currentYearHolidays.length;
    
    // 计算剩余所有法定节假日天数总和（根据实际天数计算，排除春节）
    const remainingHolidayDays = currentYearHolidays.reduce((total, holiday) => total + holiday.days, 0);
    
    // 计算可休息总天数
    const totalRestDays = remainingWeekends * 2 + remainingHolidayDays;
    
    // 更新显示
    document.getElementById('remaining-weekends').textContent = `${remainingWeekends}个周末`;
    document.getElementById('remaining-holidays').textContent = `${remainingHolidays}个法定节假日`;
    document.getElementById('holiday-days').textContent = `${remainingHolidayDays}天假期`;
    document.getElementById('total-rest-days').textContent = `${totalRestDays}天`;
}

// 创建撒花效果
function createConfetti() {
    const colors = ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff', '#00ffcc', '#ff6699'];
    
    // 清除之前可能存在的所有彩花容器
    const existingConfettiContainer = document.querySelector('.celebration-confetti');
    if (existingConfettiContainer && existingConfettiContainer.parentNode) {
        existingConfettiContainer.parentNode.removeChild(existingConfettiContainer);
    }
    
    // 创建新的彩花容器
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'celebration-confetti';
    document.body.appendChild(confettiContainer);
    
    // 存储所有创建的彩花元素
    const confettiElements = [];
    
    // 循环生成撒花
    function generateConfetti() {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            // 随机位置
            confetti.style.left = Math.random() * 100 + '%';
            
            // 随机颜色
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // 随机动画延迟
            confetti.style.animationDelay = Math.random() * 2 + 's';
            
            // 随机动画持续时间
            confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
            
            // 随机大小
            const size = Math.random() * 10 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size * 2 + 'px';
            
            // 随机旋转方向
            const rotationDirection = Math.random() > 0.5 ? 1 : -1;
            confetti.style.setProperty('--rotation-direction', rotationDirection);
            
            confettiContainer.appendChild(confetti);
            confettiElements.push(confetti);
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                    // 从数组中移除
                    const index = confettiElements.indexOf(confetti);
                    if (index > -1) {
                        confettiElements.splice(index, 1);
                    }
                }
            }, 5000);
        }
    }
    
    // 初始生成一批撒花
    generateConfetti();
    
    // 每隔一段时间生成一批新的撒花，实现循环效果
    const confettiInterval = setInterval(generateConfetti, 1000);
    
    // 当庆祝窗口关闭时，清除定时器和所有彩花
    const celebrationCloseButtons = document.querySelectorAll('#celebration-close');
    celebrationCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            clearInterval(confettiInterval);
            
            // 清除所有彩花
            if (confettiContainer && confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
            
            // 清空数组
            confettiElements.length = 0;
        });
    });
}

// 初始化噪点背景
function initNoiseBackground() {
    const container = document.getElementById('noise-bg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    
    // 噪点参数
    const pixelSize = 2;
    const noiseScale = 0.01;
    const noiseSpeed = 0.001;
    
    let time = 0;
    
    // 生成噪点
    function generateNoise() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let x = 0; x < canvas.width; x += pixelSize) {
            for (let y = 0; y < canvas.height; y += pixelSize) {
                // 计算噪声值
                const noiseValue = Math.sin(
                    x * noiseScale + time * noiseSpeed +
                    Math.cos(y * noiseScale + time * noiseSpeed * 0.7) * 2 +
                    Math.sin((x + y) * noiseScale * 0.5 + time * noiseSpeed * 0.5) * 1.5
                );
                
                // 计算亮度
                const brightness = (noiseValue + 1) / 2;
                
                // 确定颜色
                let color;
                if (brightness > 0.7) {
                    // 亮绿色
                    color = `rgba(0, ${Math.floor(255 * brightness)}, ${Math.floor(204 * brightness)}, ${brightness * 0.8})`;
                } else if (brightness > 0.3) {
                    // 中等绿色
                    color = `rgba(0, ${Math.floor(150 * brightness)}, ${Math.floor(120 * brightness)}, ${brightness * 0.6})`;
                } else {
                    // 暗绿色
                    color = `rgba(0, ${Math.floor(50 * brightness)}, ${Math.floor(40 * brightness)}, ${brightness * 0.4})`;
                }
                
                // 绘制像素
                ctx.fillStyle = color;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
        
        time++;
        requestAnimationFrame(generateNoise);
    }
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // 开始生成噪点
    generateNoise();
}

// 初始化 particles.js
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#00ffcc' // 主题色点
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.8,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff', // 白色线条
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 8,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                repulse: {
                    distance: 150,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
    
    // 确保particles.js画布覆盖整个页面
    setTimeout(() => {
        const particlesCanvas = document.querySelector('#particles-js canvas');
        if (particlesCanvas) {
            particlesCanvas.style.width = '100%';
            particlesCanvas.style.height = '100%';
        }
    }, 100);
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        const particlesCanvas = document.querySelector('#particles-js canvas');
        if (particlesCanvas) {
            particlesCanvas.style.width = '100%';
            particlesCanvas.style.height = '100%';
        }
    });
}

// 初始化
function init() {
    initEventListeners();
    initParticles();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);