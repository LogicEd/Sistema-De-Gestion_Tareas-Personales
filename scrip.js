const API_URL = 'http://localhost:3000';  // Cambia a la URL de producción si despliegas
let token = localStorage.getItem('token');

// Función para sanitizar texto
function sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auth
document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (res.ok) {
        const data = await res.json();
        token = data.token;
        localStorage.setItem('token', token);
        showApp();
    } else {
        alert('Error en login');
    }
});

document.getElementById('register-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (res.ok) alert('Registrado');
    else alert('Error');
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    showAuth();
});

function showApp() {
    document.getElementById('auth').classList.remove('show');
    document.getElementById('app').style.display = 'block';
    loadTasks();
}

function showAuth() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth').classList.add('show');
}

if (token) showApp();

// Tareas
async function loadTasks() {
    const res = await fetch(`${API_URL}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } });
    const tasks = await res.json();
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    const categories = new Set();
    tasks.forEach(task => {
        categories.add(task.category);
        const li = document.createElement('li');
        li.className = 'task' + (task.completed ? ' completed' : '');
        li.innerHTML = `
            <div>
                <strong>${sanitize(task.text)}</strong> - ${sanitize(task.category)} - ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
            </div>
            <div>
                <button onclick="toggleComplete('${task._id}')">${task.completed ? 'Desmarcar' : 'Completar'}</button>
                <button onclick="editTask('${task._id}')">Editar</button>
                <button onclick="deleteTask('${task._id}')">Eliminar</button>
            </div>
        `;
        list.appendChild(li);
    });
    // Actualizar filtro de categorías
    const filter = document.getElementById('filter-category');
    filter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach(cat => {
        filter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

document.getElementById('add-task').addEventListener('click', async () => {
    const text = document.getElementById('task-input').value;
    const category = document.getElementById('category-input').value || 'General';
    const dueDate = document.getElementById('due-date-input').value;
    await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text, category, dueDate })
    });
    loadTasks();
});

async function toggleComplete(id) {
    const res = await fetch(`${API_URL}/tasks/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const task = await res.json();
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...task, completed: !task.completed })
    });
    loadTasks();
}

async function editTask(id) {
    const res = await fetch(`${API_URL}/tasks/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const task = await res.json();
    const newText = prompt('Editar:', task.text);
    if (newText) {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...task, text: newText })
        });
        loadTasks();
    }
}

async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadTasks();
}

// Filtros
document.getElementById('search-input').addEventListener('input', filterTasks);
document.getElementById('filter-category').addEventListener('change', filterTasks);

function filterTasks() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const text = task.textContent.toLowerCase();
        const cat = task.querySelector('div').textContent.split(' - ')[1];
        task.style.display = (text.includes(search) && (!category || cat === category)) ? 'flex' : 'none';
    });
}