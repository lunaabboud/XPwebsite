document.addEventListener('DOMContentLoaded', () => {
    // Boot Screen
    setTimeout(() => {
        document.querySelector('.boot-screen').style.display = 'none';
        document.querySelector('#welcome-window').classList.add('active');
        addTaskbarItem('welcome-window', 'Welcome to Lina\'s Portfolio', 'https://via.placeholder.com/16x16?text=Home');
    }, 5000);

    // System Clock
    const updateClock = () => {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.querySelector('.system-clock').textContent = time;
    };
    updateClock();
    setInterval(updateClock, 1000);

    // Window Management
    let zIndexCounter = 200;
    const windows = document.querySelectorAll('.window');
    const taskbarItems = document.querySelector('.taskbar-items');
    const startMenu = document.querySelector('.start-menu');
    const contextMenu = document.querySelector('.context-menu');

    // Window Dragging
    windows.forEach(window => {
        const header = window.querySelector('.window-header');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (window.classList.contains('maximized')) return;

            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            window.classList.add('active');
            window.style.zIndex = zIndexCounter++;
            deactivateOtherWindows(window);
            updateTaskbarActive(window.id);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                window.style.left = `${currentX}px`;
                window.style.top = `${currentY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Store initial position
        currentX = parseInt(window.style.left) || 0;
        currentY = parseInt(window.style.top) || 0;

        // Window Controls
        window.querySelector('.minimize').addEventListener('click', () => {
            window.classList.remove('active');
            updateTaskbarActive(null);
        });

        window.querySelector('.maximize').addEventListener('click', () => {
            if (window.classList.contains('maximized')) {
                window.classList.remove('maximized');
                window.style.width = window.dataset.originalWidth || '500px';
                window.style.height = window.dataset.originalHeight || '350px';
                window.style.left = window.dataset.originalLeft || '100px';
                window.style.top = window.dataset.originalTop || '100px';
            } else {
                window.dataset.originalWidth = window.style.width;
                window.dataset.originalHeight = window.style.height;
                window.dataset.originalLeft = window.style.left;
                window.dataset.originalTop = window.style.top;
                window.classList.add('maximized');
            }
        });

        window.querySelector('.close').addEventListener('click', () => {
            window.classList.remove('active');
            const taskbarItem = taskbarItems.querySelector(`[data-window="${window.id}"]`);
            if (taskbarItem) taskbarItem.remove();
            updateTaskbarActive(null);
        });
    });

    // Desktop Icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const windowId = icon.dataset.window;
            if (windowId) {
                const window = document.getElementById(windowId);
                window.classList.add('active');
                window.style.zIndex = zIndexCounter++;
                deactivateOtherWindows(window);
                addTaskbarItem(windowId, window.querySelector('.window-title').textContent, getWindowIcon(window));
                updateTaskbarActive(windowId);
            }
        });

        icon.addEventListener('dblclick', () => {
            icon.click();
        });
    });

    // Taskbar Items
    taskbarItems.addEventListener('click', (e) => {
        const item = e.target.closest('.taskbar-item');
        if (item) {
            const windowId = item.dataset.window;
            const window = document.getElementById(windowId);
            if (window.classList.contains('active')) {
                window.classList.remove('active');
                updateTaskbarActive(null);
            } else {
                window.classList.add('active');
                window.style.zIndex = zIndexCounter++;
                deactivateOtherWindows(window);
                updateTaskbarActive(windowId);
            }
        }
    });

    // Start Menu
    document.querySelector('.start-button').addEventListener('click', () => {
        startMenu.classList.toggle('active');
        contextMenu.classList.remove('active');
    });

    document.querySelectorAll('.start-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.dataset.window;
            if (windowId) {
                const window = document.getElementById(windowId);
                window.classList.add('active');
                window.style.zIndex = zIndexCounter++;
                deactivateOtherWindows(window);
                addTaskbarItem(windowId, window.querySelector('.window-title').textContent, getWindowIcon(window));
                updateTaskbarActive(windowId);
                startMenu.classList.remove('active');
            }
        });
    });

    // Context Menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (e.target.closest('.desktop-background')) {
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.add('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            contextMenu.classList.remove('active');
        }
        if (!e.target.closest('.start-button') && !e.target.closest('.start-menu')) {
            startMenu.classList.remove('active');
        }
    });

    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.textContent === 'Refresh') {
                window.location.reload();
            } else if (item.textContent === 'Properties') {
                alert('System Properties - Not Implemented');
            }
            contextMenu.classList.remove('active');
        });
    });

    // Contact Form Submission
    document.querySelector('.contact-form .xp-button').addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        if (name && email && message) {
            showLoadingScreen();
            setTimeout(() => {
                alert('Message sent successfully!');
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('message').value = '';
                hideLoadingScreen();
            }, 2000);
        } else {
            alert('Please fill in all fields.');
        }
    });

    // Helper Functions
    function addTaskbarItem(windowId, title, iconSrc) {
        if (!taskbarItems.querySelector(`[data-window="${windowId}"]`)) {
            const item = document.createElement('div');
            item.classList.add('taskbar-item');
            item.dataset.window = windowId;
            item.innerHTML = `<img src="${iconSrc}" alt="${title}">${title}`;
            taskbarItems.appendChild(item);
        }
    }

    function updateTaskbarActive(windowId) {
        document.querySelectorAll('.taskbar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.window === windowId);
        });
    }

    function deactivateOtherWindows(activeWindow) {
        windows.forEach(w => {
            if (w !== activeWindow) {
                w.classList.remove('active');
                w.classList.add('inactive');
            } else {
                w.classList.remove('inactive');
            }
        });
    }

    function getWindowIcon(window) {
        const img = window.querySelector('.window-title img');
        return img ? img.src : 'https://via.placeholder.com/16x16?text=Icon';
    }

    function showLoadingScreen() {
        document.querySelector('.loading-screen').classList.add('active');
    }

    function hideLoadingScreen() {
        document.querySelector('.loading-screen').classList.remove('active');
    }
});
