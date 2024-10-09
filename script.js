/* script.js */

/* Global Variables */
let workTime = 25; // Default values
let breakTime = 5;
let pushupNumber = 20;
let sessionType = 'Work'; // 'Work', 'Break', 'Pushup'
let timerInterval;
let timerRemaining = 0;
let stopwatchInterval;
let stopwatchTime = 0;
let userName = ''; // Initialize as empty to prompt for name
let sessionData = []; // To store sessions for analytics

/* DOM Elements */
const greetingEl = document.getElementById('greeting');
const dateEl = document.getElementById('date');
const timeEl = document.getElementById('time');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const pushupNumberInput = document.getElementById('pushup-number');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const sessionTypeEl = document.getElementById('session-type');
const timerEl = document.getElementById('timer');
const monthSelect = document.getElementById('month-select');
const todayChartEl = document.getElementById('today-chart');
const monthlyChartEl = document.getElementById('monthly-chart');
const comparisonChartEl = document.getElementById('comparison-chart');

/* Chart Instances */
let todayChart;
let monthlyChart;
let comparisonChart;

/* Sound Notifications */
const workEndSound = new Audio('work-end.mp3'); // Replace with actual sound file paths
const breakEndSound = new Audio('break-end.mp3');

/* Initialize App */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadDataFromStorage();
    promptForUserName();
    updateGreeting();
    updateDateTime();
    populateMonthSelect();
    initializeCharts();
    updateCharts();
    setInterval(updateDateTime, 1000); // Update time every second
});

/* Event Listeners */
startButton.addEventListener('click', startSession);
stopButton.addEventListener('click', stopSession);
workTimeInput.addEventListener('change', updatePreferences);
breakTimeInput.addEventListener('change', updatePreferences);
pushupNumberInput.addEventListener('change', updatePreferences);
monthSelect.addEventListener('change', updateMonthlyChart);

/* Functions */

/* Update Greeting */
function updateGreeting() {
    console.log('Updating greeting...');
    greetingEl.textContent = `Hi ${userName},`;
}

/* Update Date and Time */
function updateDateTime() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString();
    timeEl.textContent = now.toLocaleTimeString();
}

/* Start Session */
function startSession() {
    console.log('Starting session:', sessionType);
    updatePreferences(); // Ensure latest preferences are used
    if (sessionType === 'Work') {
        startWorkSession();
    } else if (sessionType === 'Break') {
        startBreakSession();
    } else if (sessionType === 'Pushup') {
        startPushupSession();
    }
}

/* Stop Session */
function stopSession() {
    console.log('Stopping session');
    clearInterval(timerInterval);
    clearInterval(stopwatchInterval);

    // Play sound when stopping the session
    workEndSound.play();

    // Reset to initial state
    sessionType = 'Work';
    sessionTypeEl.textContent = 'Work Session';
    timerEl.textContent = formatTime(workTime * 60);

    // Reset start button if in pushup session
    if (sessionType === 'Pushup') {
        startButton.textContent = "Let's get to Work TOP G";
        startButton.removeEventListener('click', endPushupSession);
        startButton.addEventListener('click', startSession);
        stopwatchTime = 0;
    }

    saveDataToStorage();
}

/* Start Work Session */
function startWorkSession() {
    console.log('Starting Work Session');
    sessionType = 'Work';
    sessionTypeEl.textContent = 'Work Session';
    timerRemaining = workTime * 60;
    timerEl.textContent = formatTime(timerRemaining);
    timerInterval = setInterval(() => {
        timerRemaining--;
        timerEl.textContent = formatTime(timerRemaining);
        if (timerRemaining <= 0) {
            clearInterval(timerInterval);
            console.log('Work session completed');
            workEndSound.play();
            sessionData.push({
                session: 'Work',
                duration: workTime * 60,
                date: new Date()
            });
            sessionType = 'Break';
            updateCharts();
            startSession(); // Automatically start Break Session
        }
    }, 1000);
}

/* Start Break Session */
function startBreakSession() {
    console.log('Starting Break Session');
    sessionType = 'Break';
    sessionTypeEl.textContent = 'Break Session';
    timerRemaining = breakTime * 60;
    timerEl.textContent = formatTime(timerRemaining);
    timerInterval = setInterval(() => {
        timerRemaining--;
        timerEl.textContent = formatTime(timerRemaining);
        if (timerRemaining <= 0) {
            clearInterval(timerInterval);
            console.log('Break session completed');
            breakEndSound.play();
            sessionData.push({
                session: 'Break',
                duration: breakTime * 60,
                date: new Date()
            });
            sessionType = 'Pushup';
            updateCharts();
            startSession(); // Automatically start Pushup Session
        }
    }, 1000);
}

/* Start Pushup Session */
function startPushupSession() {
    console.log('Starting Pushup Session');
    sessionType = 'Pushup';
    sessionTypeEl.textContent = 'Pushup Session';
    timerEl.textContent = formatTime(stopwatchTime);
    stopwatchInterval = setInterval(() => {
        stopwatchTime++;
        timerEl.textContent = formatTime(stopwatchTime);
    }, 1000);
    // Modify Start Button to Stop for Pushup Session
    startButton.textContent = 'Stop Pushup Timer';
    startButton.removeEventListener('click', startSession);
    startButton.addEventListener('click', endPushupSession);
}

/* End Pushup Session */
function endPushupSession() {
    console.log('Ending Pushup Session');
    clearInterval(stopwatchInterval);
    const actualPushups = prompt('Enter the number of pushups performed:', pushupNumber);
    sessionData.push({
        session: 'Pushup',
        duration: stopwatchTime,
        pushups: actualPushups,
        date: new Date()
    });
    stopwatchTime = 0;
    startButton.textContent = "Let's get to Work TOP G";
    startButton.removeEventListener('click', endPushupSession);
    startButton.addEventListener('click', startSession);
    sessionType = 'Work';
    sessionTypeEl.textContent = 'Work Session';
    timerEl.textContent = formatTime(workTime * 60);
    saveDataToStorage();
    updateCharts();
}

/* Update Preferences */
function updatePreferences() {
    console.log('Updating preferences');
    workTime = parseInt(workTimeInput.value) || workTime;
    breakTime = parseInt(breakTimeInput.value) || breakTime;
    pushupNumber = parseInt(pushupNumberInput.value) || pushupNumber;
    savePreferencesToStorage();
    updateComparisonChart();
}

/* Format Time in MM:SS */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/* Load Data from localStorage */
function loadDataFromStorage() {
    console.log('Loading data from localStorage');
    // Load Preferences
    if (localStorage.getItem('workTime')) {
        workTime = parseInt(localStorage.getItem('workTime'));
        workTimeInput.value = workTime;
    }
    if (localStorage.getItem('breakTime')) {
        breakTime = parseInt(localStorage.getItem('breakTime'));
        breakTimeInput.value = breakTime;
    }
    if (localStorage.getItem('pushupNumber')) {
        pushupNumber = parseInt(localStorage.getItem('pushupNumber'));
        pushupNumberInput.value = pushupNumber;
    }
    if (localStorage.getItem('userName')) {
        userName = localStorage.getItem('userName');
    }
    // Load Session Data
    if (localStorage.getItem('sessionData')) {
        sessionData = JSON.parse(localStorage.getItem('sessionData'));
    }
}

/* Save Preferences to localStorage */
function savePreferencesToStorage() {
    console.log('Saving preferences to localStorage');
    localStorage.setItem('workTime', workTime);
    localStorage.setItem('breakTime', breakTime);
    localStorage.setItem('pushupNumber', pushupNumber);
    localStorage.setItem('userName', userName);
}

/* Save Session Data to localStorage */
function saveDataToStorage() {
    console.log('Saving session data to localStorage');
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
}

/* Initialize Charts */
function initializeCharts() {
    console.log('Initializing Charts');
    // Today's Activity Chart
    todayChart = new Chart(todayChartEl, {
        type: 'bar',
        data: {
            labels: ['Work', 'Break', 'Pushup'],
            datasets: [{
                label: 'Duration (Minutes)',
                data: [0, 0, 0],
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
            }]
        },
        options: {
            responsive: true
        }
    });

    // Monthly Activity Chart
    monthlyChart = new Chart(monthlyChartEl, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Duration (Minutes)',
                data: [],
                backgroundColor: '#36a2eb',
                borderColor: '#36a2eb',
                fill: false
            }]
        },
        options: {
            responsive: true
        }
    });

    // Comparison Chart
    comparisonChart = new Chart(comparisonChartEl, {
        type: 'bar',
        data: {
            labels: ['Work Time', 'Break Time', 'Preferred Pushups'],
            datasets: [{
                label: 'Values',
                data: [workTime, breakTime, pushupNumber],
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
            }]
        },
        options: {
            responsive: true
        }
    });
}

/* Update Charts */
function updateCharts() {
    console.log('Updating all charts');
    updateTodayChart();
    updateMonthlyChart();
    updateComparisonChart();
}

/* Update Today's Chart */
function updateTodayChart() {
    console.log('Updating Today\'s Chart');
    const today = new Date().toDateString();
    const todaySessions = sessionData.filter(session => new Date(session.date).toDateString() === today);

    const workDuration = todaySessions
        .filter(session => session.session === 'Work')
        .reduce((total, session) => total + session.duration, 0) / 60;

    const breakDuration = todaySessions
        .filter(session => session.session === 'Break')
        .reduce((total, session) => total + session.duration, 0) / 60;

    const pushupDuration = todaySessions
        .filter(session => session.session === 'Pushup')
        .reduce((total, session) => total + session.duration, 0) / 60;

    todayChart.data.datasets[0].data = [
        workDuration.toFixed(2),
        breakDuration.toFixed(2),
        pushupDuration.toFixed(2)
    ];
    todayChart.update();
}

/* Update Monthly Chart */
function updateMonthlyChart() {
    console.log('Updating Monthly Chart');
    const selectedMonth = monthSelect.value;
    const monthlySessions = sessionData.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getMonth() === parseInt(selectedMonth);
    });

    const daysInMonth = new Date(new Date().getFullYear(), parseInt(selectedMonth) + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const data = labels.map(day => {
        const daySessions = monthlySessions.filter(session => new Date(session.date).getDate() === day);
        const totalDuration = daySessions.reduce((total, session) => total + session.duration, 0) / 60;
        return totalDuration.toFixed(2);
    });

    monthlyChart.data.labels = labels;
    monthlyChart.data.datasets[0].data = data;
    monthlyChart.update();
}

/* Update Comparison Chart */
function updateComparisonChart() {
    console.log('Updating Comparison Chart');
    comparisonChart.data.datasets[0].data = [workTime, breakTime, pushupNumber];
    comparisonChart.update();
}

/* Populate Month Select */
function populateMonthSelect() {
    console.log('Populating Month Select');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthSelect.innerHTML = monthNames.map((month, index) => {
        const selected = index === new Date().getMonth() ? 'selected' : '';
        return `<option value="${index}" ${selected}>${month}</option>`;
    }).join('');
}

/* Prompt for User Name on Every Visit */
function promptForUserName() {
    console.log('Prompting for user name');
    const name = prompt('Please enter your name:', userName || 'Cristian');
    if (name) {
        userName = name;
        localStorage.setItem('userName', userName);
    } else {
        userName = 'User'; // Default name if none provided
    }
}
