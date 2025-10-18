// Función para sanitizar entrada y prevenir XSS.
function sanitizeInput(input) {
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Cargar tareas desde localStorage al iniciar.
loadTasks();

// Cargar tareas desde localStorage.
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${sanitizeInput(task.text)}</span>
            <div>
                <button onclick="toggleTask(${index})">${task.completed ? 'Desmarcar' : 'Completar'}</button>
                <button onclick="deleteTask(${index})">Eliminar</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Agregar tarea.
document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskText = sanitizeInput(taskInput.value.trim());
    if (taskText) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.push({ text: taskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';
        loadTasks();
    }
});

// Alternar estado de tarea.
function toggleTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Eliminar tarea.
function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}