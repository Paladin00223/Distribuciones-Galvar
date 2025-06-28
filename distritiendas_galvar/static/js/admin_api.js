// c:\Users\USUARIO\Desktop\GitHub\Distritiendas Galvar\static\js\admin_api.js

const API_BASE = '/api/admin';

/**
 * Maneja las respuestas de la API, lanzando un error si no fue exitosa.
 * @param {Response} response - La respuesta del fetch.
 * @returns {Promise<any>} - La data en formato JSON.
 */
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok || (data.success !== undefined && !data.success)) {
        throw new Error(data.message || `Error HTTP: ${response.status}`);
    }
    return data;
}

// --- Dashboard ---
export async function getDashboardStats() {
    const response = await fetch(`${API_BASE}/dashboard_stats`);
    return handleResponse(response);
}

export async function getMonthlyRevenue(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    const url = `${API_BASE}/monthly_revenue${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
}

// --- Users ---
export async function getUsers(page = 1, limit = 10, searchTerm = '') {
    const response = await fetch(`${API_BASE}/users?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
    return handleResponse(response);
}

export async function getUserById(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (!response.ok) throw new Error(`No se pudieron cargar los datos del usuario. Error: ${response.status}`);
    return response.json(); // Este endpoint particular no devuelve {success: true}
}

export async function updateUser(userId, userData) {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
}

export async function deleteUser(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
    return handleResponse(response);
}

// --- Orders ---
export async function getOrders(page = 1, limit = 10, statusFilter = 'todos', searchTerm = '') {
    const response = await fetch(`${API_BASE}/orders?status=${statusFilter}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
    return handleResponse(response);
}

export async function getOrderDetails(orderId) {
    const response = await fetch(`${API_BASE}/order_details/${orderId}`);
    return handleResponse(response);
}

export async function updateOrderStatus(orderId, newStatus) {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
    });
    return handleResponse(response);
}

// --- Products ---
export async function getProducts(page = 1, searchTerm = '') {
    const response = await fetch(`${API_BASE}/products?page=${page}&search=${encodeURIComponent(searchTerm)}`);
    return handleResponse(response);
}

export async function getProductById(productId) {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    return handleResponse(response);
}

export async function getCategories() {
    const response = await fetch('/api/categories'); // Nota: esta ruta no está bajo /api/admin
    if (!response.ok) throw new Error('Error al cargar categorías');
    return response.json();
}

export async function saveProduct(productId, formData) {
    const url = productId ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`;
    const method = productId ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method: method,
        body: formData, // No se necesita header 'Content-Type' para FormData
    });
    return handleResponse(response);
}

export async function deleteProduct(productId) {
    const response = await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
    return handleResponse(response);
}

// --- Retiros ---
export async function getWithdrawals() {
    // TODO: Implementar la ruta en el backend cuando esté lista.
    // Por ahora, devuelve un array vacío para que la UI no se rompa.
    console.warn("La función getWithdrawals aún no está implementada en el backend.");
    return Promise.resolve([]); // Devuelve una promesa resuelta con un array vacío
}