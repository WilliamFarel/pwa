// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const allBtn = document.getElementById('allBtn');
const activeBtn = document.getElementById('activeBtn');
const completedBtn = document.getElementById('completedBtn');
const clearCompleted = document.getElementById('clearCompleted');
const itemsLeft = document.getElementById('itemsLeft');
const installBtn = document.getElementById('installBtn');
const installBtnContainer = document.querySelector('.install-btn-container');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    renderTodos();
    setupEventListeners();
    updateItemsLeft();
    checkInstallPrompt();
}

// Set up event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    allBtn.addEventListener('click', () => setFilter('all'));
    activeBtn.addEventListener('click', () => setFilter('active'));
    completedBtn.addEventListener('click', () => setFilter('completed'));
    
    clearCompleted.addEventListener('click', clearCompletedTodos);
    
    // PWA installation
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtnContainer.style.display = 'block';
    });
    
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtnContainer.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
    
    window.addEventListener('appinstalled', () => {
        installBtnContainer.style.display = 'none';
        deferredPrompt = null;
    });
}

// Check if install prompt should be shown
function checkInstallPrompt() {
    window.addEventListener('load', () => {
        if (navigator.standalone) {
            installBtnContainer.style.display = 'none';
        }
    });
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false
        };
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        todoInput.value = '';
        updateItemsLeft();
    }
}

// Render todos based on current filter
function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
    
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = currentFilter === 'all' ? 'No todos yet' : 
                                  currentFilter === 'active' ? 'No active todos' : 'No completed todos';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.color = '#9e9e9e';
        todoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodoComplete(todo.id));
        
        const span = document.createElement('span');
        span.className = 'todo-text' + (todo.completed ? ' completed' : '');
        span.textContent = todo.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        
        todoList.appendChild(li);
    });
}

// Toggle todo completion status
function toggleTodoComplete(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

// Set the current filter
function setFilter(filter) {
    currentFilter = filter;
    allBtn.classList.remove('active');
    activeBtn.classList.remove('active');
    completedBtn.classList.remove('active');
    
    if (filter === 'all') allBtn.classList.add('active');
    if (filter === 'active') activeBtn.classList.add('active');
    if (filter === 'completed') completedBtn.classList.add('active');
    
    renderTodos();
}

// Clear all completed todos
function clearCompletedTodos() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

// Update the "items left" counter
function updateItemsLeft() {
    const count = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${count} item${count !== 1 ? 's' : ''} left`;
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
// Initialize the app
init();