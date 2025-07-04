document.addEventListener('DOMContentLoaded', () => {
    // Основные переменные
    let tasks = [];
    let currentFilter = 'all';
    
    // Элементы DOM
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const currentDateEl = document.getElementById('currentDate');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Инициализация сайта
    displayCurrentDate();
    loadTasks();
    renderTasks();
    
    // Обработчики событий
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Обработчики фильтров
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    // Функция отображения текущей даты
    function displayCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        };
        currentDateEl.textContent = now.toLocaleDateString('ru-RU', options);
    }
    
    // Добавление новой задачи
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;
        
        const newTask = {
            id: Date.now(),
            text,
            createdAt: new Date().toISOString(),
            dueDate: null,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        taskInput.value = '';
        taskInput.focus();
    }
    
    // Сохранение задач
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Загрузка задач
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
    }
    
    // Отображение задач
    function renderTasks() {
        taskList.innerHTML = '';
        
        // Фильтрация задач
        let filteredTasks = tasks;
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        if (currentFilter === 'today') {
            filteredTasks = tasks.filter(task => task.dueDate === today);
        } else if (currentFilter === 'tomorrow') {
            filteredTasks = tasks.filter(task => task.dueDate === tomorrowStr);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Сортировка
        filteredTasks.sort((a, b) => a.completed - b.completed);
        
        // Отображение
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">Задач нет</div>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('li');
            taskEl.className = 'task-item';
            if (task.completed) taskEl.classList.add('completed');
            
            // Форматирование дат
            const createdDate = formatDate(new Date(task.createdAt));
            const dueDate = task.dueDate ? formatDate(new Date(task.dueDate)) : null;
            
            taskEl.innerHTML = `
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        data-id="${task.id}">
                    <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                    <div class="task-actions">
                        <button class="date-btn" data-id="${task.id}">📆</button>
                        <button class="delete-btn" data-id="${task.id}">✕</button>
                    </div>
                </div>
                <div class="task-meta">
                    <div class="created-date">Создано: ${createdDate}</div>
                    ${dueDate ? `<div class="due-date">Сделать до: ${dueDate}</div>` : ''}
                </div>
            `;
            
            taskList.appendChild(taskEl);
        });
        
        // Добавление обработчиков
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskStatus);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
        
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', setDueDate);
        });
    }
    
    // Переключение статуса задачи
    function toggleTaskStatus(e) {
        const taskId = parseInt(e.target.dataset.id);
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
    
    // Удаление задачи
    function deleteTask(e) {
        const taskId = parseInt(e.target.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
    
    // Установка срока выполнения
    function setDueDate(e) {
        const taskId = parseInt(e.target.dataset.id);
        const dueDate = prompt("Введите дату выполнения в формате ГГГГ-ММ-ДД (например, 2025-07-01):");
        if (!dueDate) return;
        
        // Простая проверка формата
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            alert("Пожалуйста, введите дату в правильном формате (ГГГГ-ММ-ДД)");
            return;
        }
        
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, dueDate };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    // Форматирование даты
    function formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'вчера';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'завтра';
        }
        
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }
});
