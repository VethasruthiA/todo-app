// Beautiful Todo List App with Enhanced Features

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌈 Beautiful Todo App Loaded!');
    
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const emptyState = document.getElementById('empty-state');
    const clearDoneBtn = document.getElementById('clear-done');
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.btn-filter');
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.btn-cancel');
    const saveBtn = document.querySelector('.btn-save');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('todo-tasks')) || [];
    let currentFilter = 'all';
    let currentSearch = '';
    let editingId = null;
    
    // Initialize
    renderTasks();
    updateStats();
    
    // Event Listeners
    taskForm.addEventListener('submit', handleAddTask);
    clearDoneBtn.addEventListener('click', handleClearCompleted);
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    
    // Modal Events
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelBtn.addEventListener('click', closeEditModal);
    saveBtn.addEventListener('click', handleSaveEdit);
    
    // Close modal on outside click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });
    
    // Functions
    function handleAddTask(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        
        if (!text) {
            showToast('Please enter a task', 'warning');
            return;
        }
        
        // Create new task with animation data
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'medium'
        };
        
        tasks.unshift(newTask); // Add to beginning for better UX
        saveTasks();
        renderTasks();
        updateStats();
        
        // Reset form
        taskInput.value = '';
        taskInput.focus();
        
        // Show success animation
        showToast('Task added successfully! ✨', 'success');
        
        // Button animation
        const addBtn = document.querySelector('.btn-add');
        addBtn.classList.add('pulse');
        setTimeout(() => addBtn.classList.remove('pulse'), 300);
    }
    
    function renderTasks() {
        // Filter and search tasks
        let filteredTasks = tasks.filter(task => {
            // Apply filter
            if (currentFilter === 'pending' && task.completed) return false;
            if (currentFilter === 'completed' && !task.completed) return false;
            
            // Apply search
            if (currentSearch) {
                return task.text.toLowerCase().includes(currentSearch.toLowerCase());
            }
            
            return true;
        });
        
        // Update empty state
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            tasksContainer.innerHTML = '';
        } else {
            emptyState.style.display = 'none';
            tasksContainer.innerHTML = '';
            
            // Create task elements with staggered animation
            filteredTasks.forEach((task, index) => {
                setTimeout(() => {
                    const taskElement = createTaskElement(task);
                    tasksContainer.appendChild(taskElement);
                }, index * 50); // Stagger animation
            });
        }
    }
    
    function createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.dataset.id = task.id;
        
        // Add priority indicator
        const priorityColors = {
            high: '#EF4444',
            medium: '#F59E0B',
            low: '#10B981'
        };
        
        div.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="priority-btn" style="background: ${priorityColors[task.priority]}">
                    <i class="fas fa-flag"></i>
                </button>
                <button class="delete-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = div.querySelector('.task-checkbox');
        const text = div.querySelector('.task-text');
        const deleteBtn = div.querySelector('.delete-btn');
        const priorityBtn = div.querySelector('.priority-btn');
        
        checkbox.addEventListener('change', () => toggleTask(task.id));
        text.addEventListener('click', () => openEditModal(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        priorityBtn.addEventListener('click', () => changePriority(task.id));
        
        return div;
    }
    
    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateStats();
            
            const message = task.completed ? 
                'Task completed! 🎉' : 
                'Task marked as pending';
            showToast(message, 'info');
        }
    }
    
    function deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            // Animate deletion
            const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
            if (taskElement) {
                taskElement.style.transform = 'translateX(100%)';
                taskElement.style.opacity = '0';
                setTimeout(() => {
                    tasks.splice(taskIndex, 1);
                    saveTasks();
                    renderTasks();
                    updateStats();
                    showToast('Task deleted', 'danger');
                }, 300);
            }
        }
    }
    
    function changePriority(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const priorities = ['low', 'medium', 'high'];
            const currentIndex = priorities.indexOf(task.priority);
            task.priority = priorities[(currentIndex + 1) % priorities.length];
            saveTasks();
            renderTasks();
            showToast(`Priority changed to ${task.priority}`, 'info');
        }
    }
    
    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            editingId = id;
            editInput.value = task.text;
            editModal.style.display = 'flex';
            editInput.focus();
            editInput.select();
        }
    }
    
    function closeEditModal() {
        editModal.style.display = 'none';
        editingId = null;
        editInput.value = '';
    }
    
    function handleSaveEdit() {
        const text = editInput.value.trim();
        
        if (!text) {
            showToast('Task cannot be empty', 'warning');
            return;
        }
        
        const task = tasks.find(t => t.id === editingId);
        if (task) {
            task.text = text;
            saveTasks();
            renderTasks();
            closeEditModal();
            showToast('Task updated successfully!', 'success');
        }
    }
    
    function handleClearCompleted() {
        const completedTasks = tasks.filter(t => t.completed);
        
        if (completedTasks.length === 0) {
            showToast('No completed tasks to clear', 'info');
            return;
        }
        
        if (confirm(`Clear ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''}?`)) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
            updateStats();
            showToast('Completed tasks cleared!', 'success');
        }
    }
    
    function handleSearch(e) {
        currentSearch = e.target.value;
        renderTasks();
    }
    
    function handleFilter(filter) {
        currentFilter = filter;
        
        // Update active button
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        renderTasks();
    }
    
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Update counters
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('done-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
        document.getElementById('progress-percent').textContent = `${progress}%`;
        
        // Animate progress bar
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = `${progress}%`;
        
        // Change progress bar color based on progress
        if (progress < 30) {
            progressFill.style.background = 'linear-gradient(90deg, #EF4444, #F59E0B)';
        } else if (progress < 70) {
            progressFill.style.background = 'linear-gradient(90deg, #F59E0B, #10B981)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #10B981, #8B5CF6)';
        }
    }
    
    function saveTasks() {
        localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.display = 'block';
        
        // Set color based on type
        const colors = {
            success: 'linear-gradient(135deg, #10B981, #34D399)',
            warning: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            danger: 'linear-gradient(135deg, #EF4444, #FCA5A5)',
            info: 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
        };
        
        toast.style.background = colors[type] || colors.info;
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.animation = '';
            }, 300);
        }, 3000);
    }
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        .pulse {
            animation: pulse 0.3s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .task-actions {
            display: flex;
            gap: 10px;
        }
        
        .priority-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        
        .priority-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    // Initial message
    if (tasks.length === 0) {
        setTimeout(() => {
            showToast('Welcome! Add your first task above ✨', 'info');
        }, 1000);
    } else {
        showToast(`Welcome back! You have ${tasks.length} task${tasks.length > 1 ? 's' : ''}`, 'info');
    }
    
    console.log('App initialized successfully!');
    console.log('Current tasks:', tasks);
});