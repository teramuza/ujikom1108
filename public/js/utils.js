// API Configuration
const API_BASE_URL = 'http://localhost:4000/api/v1';

// Storage utilities for authentication
const AuthUtils = {
    setToken(token) {
        localStorage.setItem('auth_token', token);
    },

    getToken() {
        return localStorage.getItem('auth_token');
    },

    removeToken() {
        localStorage.removeItem('auth_token');
    },

    setUser(user) {
        localStorage.setItem('user_data', JSON.stringify(user));
    },

    getUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    },

    removeUser() {
        localStorage.removeItem('user_data');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    logout() {
        this.removeToken();
        this.removeUser();
        window.location.href = 'login.html';
    }
};

// API utilities
const ApiUtils = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = AuthUtils.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            // For login endpoint, don't logout on 401, just return the error response
            if (response.status === 401 && !endpoint.includes('/auth/login')) {
                AuthUtils.logout();
                return;
            }

            // Parse response body for both success and error cases
            let responseData;
            try {
                responseData = await response.json();
            } catch (parseError) {
                console.error('Failed to parse response JSON:', parseError);
                throw new Error('Server response tidak valid');
            }

            if (!response.ok) {
                // Throw error with the message from response body
                const errorMessage = responseData?.message || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint);
    },

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async postForm(endpoint, formData) {
        const token = AuthUtils.getToken();
        const config = {
            method: 'POST',
            body: formData
        };

        if (token) {
            config.headers = {
                'Authorization': `Bearer ${token}`
            };
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (response.status === 401) {
                AuthUtils.logout();
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async putForm(endpoint, formData) {
        const token = AuthUtils.getToken();
        const config = {
            method: 'PUT',
            body: formData
        };

        if (token) {
            config.headers = {
                'Authorization': `Bearer ${token}`
            };
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (response.status === 401) {
                AuthUtils.logout();
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// UI utilities
const UIUtils = {
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        // Insert at the top of content area
        const content = document.querySelector('.content');
        content.insertBefore(alertDiv, content.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    },

    showSuccess(message) {
        this.showAlert(message, 'success');
    },

    showError(message) {
        this.showAlert(message, 'danger');
    },

    showWarning(message) {
        this.showAlert(message, 'warning');
    },

    showInfo(message) {
        this.showAlert(message, 'info');
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    confirmDelete(message = 'Apakah Anda yakin ingin menghapus data ini?') {
        return confirm(message);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID');
    },

    formatDateTime(date) {
        return new Date(date).toLocaleString('id-ID');
    }
};

// Form utilities
const FormUtils = {
    serialize(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    serializeToFormData(form) {
        return new FormData(form);
    },

    reset(form) {
        form.reset();
    },

    populate(form, data) {
        for (const [key, value] of Object.entries(data)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        }
    },

    validate(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    }
};

// Table utilities
const TableUtils = {
    renderTable(containerId, data, columns) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
        `;

        columns.forEach(col => {
            html += `<th>${col.title}</th>`;
        });

        html += `
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (data.length === 0) {
            html += `
                <tr>
                    <td colspan="${columns.length}" class="text-center">Tidak ada data</td>
                </tr>
            `;
        } else {
            data.forEach(row => {
                html += '<tr>';
                columns.forEach(col => {
                    let value = row[col.field];
                    if (col.render) {
                        value = col.render(value, row);
                    }
                    html += `<td>${value}</td>`;
                });
                html += '</tr>';
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }
};

// Navigation utilities
const NavUtils = {
    init() {
        // Initialize sidebar toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (menuToggle && sidebar && mainContent) {
            // For desktop, ensure sidebar is always visible
            if (window.innerWidth > 768) {
                sidebar.classList.add('active');
                mainContent.classList.add('shifted');
            }

            menuToggle.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    // Mobile behavior - toggle sidebar
                    sidebar.classList.toggle('active');
                } else {
                    // Desktop behavior - sidebar always visible, just toggle shifted class for content
                    sidebar.classList.add('active');
                    mainContent.classList.add('shifted');
                }
            });
        }

        // Close sidebar when clicking outside on mobile only
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    mainContent.classList.remove('shifted');
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.add('active');
                mainContent.classList.add('shifted');
            } else {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
            }
        });

        // Set active navigation item
        this.setActiveNav();
    },

    setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.sidebar-nav a');

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
                link.classList.add('active');
            }
        });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication for protected pages
    const protectedPages = ['dashboard.html', 'customers.html', 'produk.html', 'perusahaan.html', 'faktur.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !AuthUtils.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Redirect to dashboard if already authenticated and on login page
    if (currentPage === 'login.html' && AuthUtils.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Initialize navigation
    NavUtils.init();

    // Initialize user info in header
    const userInfo = document.querySelector('.user-info');
    const user = AuthUtils.getUser();
    if (userInfo && user) {
        userInfo.innerHTML = `
            <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
            <span>${user.name || user.username}</span>
            <button class="btn btn-sm btn-danger" onclick="AuthUtils.logout()">Logout</button>
        `;
    }

    // Initialize modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
});
