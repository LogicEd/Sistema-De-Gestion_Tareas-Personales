// Simulación de autenticación (usuario: admin, contraseña: admin)
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Hash simple para simular seguridad (en producción, usa bcrypt)
    const hashedPass = btoa(password); // Base64 simple; reemplaza con CryptoJS
    if (username === 'admin' && hashedPass === btoa('admin')) {
        localStorage.setItem('session', 'loggedIn');
        document.getElementById('auth').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        loadTasks();
    } else {
        alert('Credenciales incorrectas');
    }
}

// Verificar sesión al cargar
if (localStorage.getItem('session') === 'loggedIn') {
    document.getElementById('auth').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadTasks();
}

// API simulada con localStorage
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// CRUD: Leer tareas
function loadTasks() {
    const tasks = getTasks();
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${task.title}</strong> - ${task.description} (Vence: ${task.dueDate})
            </div>
            <div>
                <button onclick="editTask(${index})">Editar</button>
                <button onclick="deleteTask(${index})">Eliminar</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// CRUD: Crear tarea
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    
    // Validación básica para prevenir XSS (sanitización simple)
    if (!title) return alert('Título requerido');
    const sanitizedTitle = title.replace(/<script[^>]*>.*?<\/script>/gi, ''); // Básico; usa DOMPurify en producción
    const sanitizedDesc = description.replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    const tasks = getTasks();
    tasks.push({ title: sanitizedTitle, description: sanitizedDesc, dueDate });
    saveTasks(tasks);
    loadTasks();
    this.reset();
});

// CRUD: Actualizar tarea
function editTask(index) {
    const tasks = getTasks();
    const task = tasks[index];
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('dueDate').value = task.dueDate;
    // Para simplificar, reutiliza el formulario de creación; en producción, separa
    document.getElementById('taskForm').onsubmit = function(e) {
        e.preventDefault();
        task.title = document.getElementById('title').value.trim();
        task.description = document.getElementById('description').value.trim();
        task.dueDate = document.getElementById('dueDate').value;
        saveTasks(tasks);
        loadTasks();
        this.reset();
        this.onsubmit = null; // Resetear
    };
}

// CRUD: Eliminar tarea
function deleteTask(index) {
    if (confirm('¿Eliminar tarea?')) {
        const tasks = getTasks();
        tasks.splice(index, 1);
        saveTasks(tasks);
        loadTasks();
    }
}