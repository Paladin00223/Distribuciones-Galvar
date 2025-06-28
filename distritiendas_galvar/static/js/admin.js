// c:\Users\USUARIO\Desktop\GitHub\Distritiendas Galvar\static\js\admin.js
import * as api from './admin_api.js';
document.addEventListener("DOMContentLoaded", () => {
  const adminTabs = document.querySelectorAll(".admin-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  // Función para mostrar el contenido del tab seleccionado
  const showTabContent = (tabName) => {
    tabContents.forEach((content) => {
      if (content.id === `${tabName}-content`) {
        content.style.display = "block";
      } else {
        content.style.display = "none";
      }
    });
  };

  // Función para activar el botón del tab
  const activateTabButton = (button) => {
    adminTabs.forEach((tab) => tab.classList.remove("activo"));
    button.classList.add("activo");
  };

  // Event listeners para los botones de los tabs
  adminTabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const tabName = tabButton.dataset.tab;
      activateTabButton(tabButton);
      showTabContent(tabName);

      // Aquí es donde llamarías a las funciones para cargar los datos
      // según el tab seleccionado
      if (tabName === "dashboard") {
        loadDashboardStats();
        loadRevenueChart(); // Cargar el gráfico
      } else if (tabName === "usuarios") {
        loadUsers();
      } else if (tabName === "pedidos") {
        loadOrders();
      } else if (tabName === "productos") {
        loadProducts();
      } else if (tabName === "retiros") {
        loadWithdrawals();
      }
    });
  });

  // --- Funciones de carga de datos (ejemplos conceptuales) ---
  let revenueChartInstance = null; // Variable para guardar la instancia del gráfico

  // Cargar y renderizar el gráfico de ingresos mensuales
  const loadRevenueChart = async () => {
    try {
      const startDate = document.getElementById("startDate")?.value;
      const endDate = document.getElementById("endDate")?.value;
      const result = await api.getMonthlyRevenue(startDate, endDate);
      const chartWrapper = document.getElementById("revenue-chart-wrapper");
      const noDataMessage = document.getElementById("revenue-chart-nodata");

      // Siempre destruir la instancia anterior si existe
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
        revenueChartInstance = null;
      }

      if (result.data.labels.length === 0) {
        // No hay datos, mostrar mensaje y ocultar contenedor del gráfico
        chartWrapper.style.display = "none";
        noDataMessage.style.display = "block";
      } else {
        // Hay datos, mostrar contenedor del gráfico y ocultar mensaje
        chartWrapper.style.display = "block";
        noDataMessage.style.display = "none";

        const ctx = document.getElementById("revenueChart").getContext("2d");
        revenueChartInstance = new Chart(ctx, {
          type: "bar", // 'line' también es una buena opción
          data: {
            labels: result.data.labels,
            datasets: [{
              label: "Ingresos ($)",
              data: result.data.values,
              backgroundColor: "rgba(40, 167, 69, 0.6)", // Verde con transparencia
              borderColor: "rgba(40, 167, 69, 1)",
              borderWidth: 1,
              borderRadius: 5,
            }, ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  // Formatear el eje Y como moneda
                  callback: function (value) {
                    return "$" + value.toLocaleString("es-CO");
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: false, // Ocultar la leyenda si solo hay un dataset
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `Ingresos: ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(context.parsed.y)}`;
                  },
                },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error al cargar el gráfico de ingresos:", error);
    }
  };

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async () => {
    try {
      const result = await api.getDashboardStats();
      const stats = result.stats;
      document.getElementById("stat-total-orders").textContent =
        stats.total_orders;
      document.getElementById(
        "stat-total-revenue"
      ).textContent = `$${stats.total_revenue.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      document.getElementById("stat-total-users").textContent = stats.total_users;
      document.getElementById("stat-recent-orders").textContent = stats.recent_orders;
    } catch (error) {
      console.error("Error al cargar el dashboard:", error);
      // Opcional: mostrar un error en la UI del dashboard
    }
  };

  // Cargar usuarios
  const loadUsers = async (page = 1) => {
    // Obtener el ID del administrador que ha iniciado sesión desde el atributo data del body
    const loggedInUserId = document.body.dataset.userId;
    const searchTerm = document.getElementById("userSearchInput")?.value || "";
    const limit = 10; // Debe coincidir con el backend

    try {
      const data = await api.getUsers(page, limit, searchTerm);

      const usersTableBody = document.getElementById("usuarios-tabla");
      usersTableBody.innerHTML = ""; // Limpiar tabla antes de añadir nuevos datos
      const { users, total_pages, current_page } = data;

      if (users.length === 0) {
        usersTableBody.innerHTML =
          '<tr><td colspan="9" style="text-align: center;">No se encontraron usuarios.</td></tr>';
        return;
      }

      users.forEach((user) => {
        const row = usersTableBody.insertRow();
        // Condición para mostrar el botón de eliminar: solo si el ID del usuario en la fila
        // es diferente al ID numérico (uid) del administrador que ha iniciado sesión.
        const deleteButtonHtml =
          user.uid.toString() !== loggedInUserId
            ? `<button class="btn-accion eliminar" data-id="${user.uid}">Eliminar</button>`
            : "";
        // Usamos los campos de la base de datos (MongoDB)
        // y usamos '||' para mostrar 'N/A' si un campo opcional no existe.
        row.innerHTML = `
                    <td>${user.uid}</td>
                    <td>${user.nombre}</td>
                    <td>${user.email || "N/A"}</td>
                    <td>${user.cedula || "N/A"}</td>
                    <td>${
                      user.documento
                        ? `<a href="/uploads/${user.documento}" target="_blank">Ver</a>`
                        : "N/A"
                    }</td>
                    <td>${user.paquete || "N/A"}</td>
                    <td>${user.puntos || 0}</td>
                    <td>${user.estado || "N/A"}</td>
                    <td class="acciones">
                        <button class="btn-accion editar" data-type="user" data-id="${
                          user.uid
                        }">Editar</button>
                        ${deleteButtonHtml}
                    </td>
                `;
      });
      renderPaginationControls(
        "usuarios-pagination",
        current_page,
        total_pages,
        loadUsers
      );
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // Cargar pedidos
  const loadOrders = async (page = 1) => {
    const statusFilter =
      document.getElementById("filtroEstado")?.value || "todos";
    const searchTerm = document.getElementById("buscarPedido")?.value || "";
    const limit = 10; // Debe coincidir con el backend

    try {
      const { orders, total_pages, current_page } = await api.getOrders(page, limit, statusFilter, searchTerm);

      const ordersTableBody = document.getElementById("pedidos-tabla");
      ordersTableBody.innerHTML = "";

      if (!orders || orders.length === 0) {
        ordersTableBody.innerHTML =
          '<tr><td colspan="8" style="text-align: center;">No se encontraron pedidos.</td></tr>';
        return;
      }

      orders.forEach((order) => {
        const row = ordersTableBody.insertRow();
        // Extraer y formatear los datos del pedido para mostrarlos en la tabla
        const customerName = order.customer_info
          ? order.customer_info.nombre
          : "Usuario no encontrado";
        const productNames = order.items
          .map(
            (item) =>
              `${item.nombre || "Producto desconocido"} (x${item.cantidad})`
          )
          .join("<br>");
        const shippingAddress = order.shipping_info
          ? order.shipping_info.address
          : "N/A";
        const orderDate = new Date(order.order_date).toLocaleDateString(
          "es-ES"
        );

        row.innerHTML = `
                    <td>${order.order_uid}</td>
                    <td>${customerName}</td>
                    <td>${productNames}</td>
                    <td>${shippingAddress}</td>
                    <td>$${order.total_amount.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                    <td>${orderDate}</td>
                    <td>${order.status}</td>
                    <td class="acciones">
                        <button class="btn-accion ver" data-id="${
                          order._id
                        }">Ver Detalles</button>
                        <button class="btn-accion cambiar-estado" data-id="${
                          order._id
                        }">Cambiar Estado</button>
                    </td>
                `;
      });
      renderPaginationControls(
        "pedidos-pagination",
        current_page,
        total_pages,
        loadOrders
      );
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  // Cargar productos
  const loadProducts = async (page = 1) => {
    const searchTerm = document.getElementById("productSearchInput")?.value || "";
    try {
      const data = await api.getProducts(page, searchTerm);

      const productsTableBody = document.getElementById("productsTableBody");
      productsTableBody.innerHTML = "";
      const { products, total_pages, current_page } = data;

      if (products.length === 0) {
        productsTableBody.innerHTML =
          '<tr><td colspan="6" style="text-align: center;">No hay productos para mostrar.</td></tr>';
        return;
      }

      products.forEach((product) => {
        const row = productsTableBody.insertRow();
        const imageUrl = product.imagen
          ? `/static/uploads/products/${product.imagen}`
          : "/static/images/placeholder.png";
        row.innerHTML = `
                    <td><img src="${imageUrl}" alt="${
          product.nombre
        }" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${product.nombre}</td>
                    <td>${product.categoria}</td>
                    <td>$${product.precio.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                    <td>${product.stock}</td>
                    <td class="acciones">
                        <button class="btn-accion editar" data-type="product" data-id="${
                          product._id
                        }">Editar</button>
                        <button class="btn-accion eliminar" data-type="product" data-id="${
                          product._id
                        }">Eliminar</button>
                    </td>
                `;
      });
      renderPaginationControls(
        "productos-pagination",
        current_page,
        total_pages,
        loadProducts
      );
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  // Función para actualizar el estado de un pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await api.updateOrderStatus(orderId, newStatus);
      alert(result.message); // O usar una notificación más elegante
      loadOrders(); // Recargar la tabla de pedidos para reflejar el cambio
    } catch (error) {
      console.error("Error al cambiar el estado del pedido:", error);
      alert(`No se pudo cambiar el estado del pedido: ${error.message}`);
    }
  };

  // Cargar retiros
  const loadWithdrawals = async () => {
    try {
      const withdrawals = await api.getWithdrawals(); // Llama a la API

      const withdrawalsTableBody = document.getElementById("retiros-body");
      withdrawalsTableBody.innerHTML = "";

      if (withdrawals.length === 0) {
        withdrawalsTableBody.innerHTML =
          '<tr><td colspan="6" style="text-align: center;">No hay retiros para mostrar (función no implementada).</td></tr>';
        return;
      }
      // El código para renderizar los retiros iría aquí cuando se implemente
    } catch (error) {
      console.error("Error al cargar retiros:", error);
    }
  };

  // Función para eliminar un usuario
  const deleteUser = async (userId) => {
    try {
      const result = await api.deleteUser(userId);
      alert(result.message); // O usar una notificación más elegante
      loadUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert(`No se pudo eliminar el usuario: ${error.message}`);
    }
  };

  // Función para eliminar un producto
  const deleteProduct = async (productId) => {
    try {
      const result = await api.deleteProduct(productId);
      alert(result.message);
      loadProducts(); // Recargar la lista de productos
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(`No se pudo eliminar el producto: ${error.message}`);
    }
  };

  // --- Lógica de Paginación ---
  const renderPaginationControls = (
    containerId,
    currentPage,
    totalPages,
    loadFunction,
    context = 2
  ) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const createButton = (
      page,
      text = page,
      isDisabled = false,
      isActive = false
    ) => {
      const button = document.createElement("button");
      button.textContent = text;
      button.disabled = isDisabled;
      if (isActive) button.classList.add("active");
      button.addEventListener("click", () => loadFunction(page));
      return button;
    };

    const addEllipsis = () => {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "pagination-ellipsis";
      container.appendChild(ellipsis);
    };

    // Botón "Anterior"
    container.appendChild(
      createButton(currentPage - 1, "Anterior", currentPage === 1)
    );

    let lastPage = 0;
    for (let i = 1; i <= totalPages; i++) {
      // Condiciones para mostrar un número de página:
      // 1. Es la primera página.
      // 2. Es la última página.
      // 3. Está dentro del rango de 'context' alrededor de la página actual.
      const shouldShow =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - context && i <= currentPage + context);

      if (shouldShow) {
        if (i > lastPage + 1) {
          addEllipsis();
        }
        container.appendChild(createButton(i, i, false, i === currentPage));
        lastPage = i;
      }
    }

    // Botón "Siguiente"
    container.appendChild(
      createButton(currentPage + 1, "Siguiente", currentPage === totalPages)
    );
  };

  // --- Lógica para el Modal de Edición ---
  const modal = document.getElementById("edit-user-modal");
  const closeModalButton = document.querySelector(".close-button");
  const editForm = document.getElementById("edit-user-form");

  const statusModal = document.getElementById("status-order-modal");
  const closeStatusButtons = document.querySelectorAll(".status-close-button");
  const statusForm = document.getElementById("status-order-form");

  const orderDetailsModal = document.getElementById("order-details-modal");
  const closeOrderDetailsButton = document.querySelector(
    ".order-details-close"
  );
  const orderDetailsContent = document.getElementById("order-details-content");

  const productModalElement = document.getElementById("productModal");
  let productModal = null; // Inicializar a null para comprobar si existe

  // Solo inicializar el modal de Bootstrap si el elemento existe
  if (productModalElement) {
    productModal = new bootstrap.Modal(productModalElement);
  }

  const closeProductButtons = document.querySelectorAll(
    ".product-close-button"
  );
  const productForm = document.getElementById("productForm");

  // Función para abrir el modal y cargar los datos del usuario
  const openEditModal = async (userId) => {
    try {

      const user = await api.getUserById(userId); // Usar la API para obtener los datos
      // Llenar el formulario con los datos del usuario
      document.getElementById("edit-user-id").value = user.uid;
      document.getElementById("edit-user-name").value = user.nombre || "";
      document.getElementById("edit-user-email").value = user.email || "";
      document.getElementById("edit-user-cedula").value = user.cedula || "";
      document.getElementById("edit-user-paquete").value = user.paquete || "";
      document.getElementById("edit-user-puntos").value = user.puntos || 0;
      document.getElementById("edit-user-estado").value =
        user.estado || "activo";
      document.getElementById("edit-user-tipo").value = user.tipo || "usuario";

      modal.style.display = "block";
    } catch (error) {
      console.error("Error al abrir modal de edición:", error);
      alert(error.message);
    }
  };

  // Función para renderizar los detalles de un pedido en el modal
  const renderOrderDetails = (order) => {
    const itemsHtml = order.items
      .map(
        (item) => `
            <li><span>${item.nombre || "Producto desconocido"} (x${
          item.cantidad
        })</span><strong>$${(item.precio_compra * item.cantidad).toLocaleString(
          "es-CO",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}</strong></li>
        `
      )
      .join("");

    const detailsHtml = `
            <div class="details-section">
                <h4>Información del Pedido</h4>
                <ul>
                    <li><span>Nº Pedido:</span><strong>${
                      order.order_uid
                    }</strong></li>
                    <li><span>ID de Referencia:</span><strong>${
                      order._id
                    }</strong></li>
                    <li><span>Fecha:</span><strong>${new Date(
                      order.order_date
                    ).toLocaleString("es-ES")}</strong></li>
                    <li><span>Estado:</span><strong>${
                      order.status
                    }</strong></li>
                    <li><span>Monto Total:</span><strong>$${order.total_amount.toLocaleString(
                      "es-CO",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</strong></li>
                </ul>
            </div>
            <div class="details-section">
                <h4>Información del Cliente</h4>
                <ul>
                    <li><span>Nombre:</span><strong>${
                      order.customer_info.nombre
                    }</strong></li>
                    <li><span>Email:</span><strong>${
                      order.customer_info.email || "N/A"
                    }</strong></li>
                    <li><span>Teléfono:</span><strong>${
                      order.customer_info.phone || "N/A"
                    }</strong></li>
                </ul>
            </div>
            <div class="details-section" style="grid-column: 1 / -1;">
                <h4>Información de Envío</h4>
                <ul>
                    <li><span>Recibe:</span><strong>${
                      order.shipping_info.name
                    }</strong></li>
                    <li><span>Dirección:</span><strong>${
                      order.shipping_info.address
                    }</strong></li>
                    <li><span>Teléfono de Contacto:</span><strong>${
                      order.shipping_info.phone
                    }</strong></li>
                    <li><span>Email de Contacto:</span><strong>${
                      order.shipping_info.email
                    }</strong></li>
                </ul>
            </div>
            <div class="details-section" style="grid-column: 1 / -1;">
                <h4>Productos</h4>
                <ul>${itemsHtml}</ul>
            </div>
        `;
    orderDetailsContent.innerHTML = detailsHtml;
  };

  // Función para abrir el modal de detalles del pedido
  const openOrderDetailsModal = async (orderId) => {
    orderDetailsContent.innerHTML = "<p>Cargando detalles...</p>";
    orderDetailsModal.style.display = "block";
    try {
      const result = await api.getOrderDetails(orderId);
      renderOrderDetails(result.order); // La API ya maneja el {success: true}
    } catch (error) {
      orderDetailsContent.innerHTML = `<p style="color: red;">Error al cargar los detalles: ${error.message}</p>`;
    }
  };

  // Función para cerrar el modal
  const closeEditModal = () => {
    modal.style.display = "none";
  };

  // Función para abrir el modal de cambio de estado
  const openStatusModal = (orderId, currentStatus) => {
    document.getElementById("edit-order-id").value = orderId;
    const statusSelect = document.getElementById("edit-order-status");

    // Lista de estados válidos del dropdown
    const validStatuses = Array.from(statusSelect.options).map(
      (opt) => opt.value
    );

    // Si el estado actual es válido, lo seleccionamos. Si no, usamos 'Pendiente' por defecto.
    if (currentStatus && validStatuses.includes(currentStatus.trim())) {
      statusSelect.value = currentStatus.trim();
    } else {
      statusSelect.value = "Pendiente";
    }
    statusModal.style.display = "block";
  };

  // Función para cerrar el modal de cambio de estado
  const closeStatusModal = () => {
    statusModal.style.display = "none";
  };

  // Función para cerrar el modal de detalles de pedido
  const closeOrderDetailsModal = () => {
    orderDetailsModal.style.display = "none";
  };

  // Función para abrir el modal de producto (añadir/editar)
  const openProductModal = async (productId = null) => {
    if (!productModal) {
      // Asegurarse de que el modal de Bootstrap esté inicializado
      console.error("El modal de producto no está inicializado.");
      return;
    }

    productForm.reset(); // Limpiar todos los campos del formulario
    document.getElementById("product-id").value = ""; // Limpiar el ID oculto del producto
    const imagePreview = document.getElementById("image-preview");
    imagePreview.style.display = "none"; // Ocultar la previsualización de imagen
    imagePreview.src = "#"; // Limpiar la fuente de la imagen (por si había una anterior)
    document.getElementById("image-preview").style.display = "none";
    // Cargar categorías en el dropdown
    try {
      const categorySelect = document.getElementById("product-category");
      const categories = await api.getCategories();
      categorySelect.innerHTML =
        '<option value="">Seleccione una categoría</option>';
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });

      if (productId) {
        document.getElementById("product-modal-title").textContent =
          "Editar Producto";
        const result = await api.getProductById(productId);
        const p = result.product;
        document.getElementById("product-id").value = p._id;
        document.getElementById("product-name").value = p.nombre;
        document.getElementById("product-description").value = p.descripcion;
        document.getElementById("product-category").value = p.categoria;
        document.getElementById("product-price").value = p.precio;
        document.getElementById("product-stock").value = p.stock;
        document.getElementById(
          "image-preview"
        ).src = `/static/uploads/products/${p.imagen}`;
        document.getElementById("image-preview").style.display = "block";
      } else {
        document.getElementById("product-modal-title").textContent =
          "Añadir Producto";
      }
      productModal.show(); // Usar el método de Bootstrap para mostrar el modal
    } catch (error) {
      console.error("Error al abrir modal de producto:", error);
    }
  };

  // Event listener para el botón de cerrar
  closeModalButton.addEventListener("click", closeEditModal);

  // Event listener para cerrar los modales si se hace clic fuera de su contenido
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditModal();
    }
    if (event.target === statusModal) {
      closeStatusModal();
    }
    if (event.target === orderDetailsModal) {
      closeOrderDetailsModal();
    }
  });

  // Event listener para el botón de cerrar del modal de detalles
  closeOrderDetailsButton.addEventListener("click", closeOrderDetailsModal);
  // Event listener para el envío del formulario de edición
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userId = document.getElementById("edit-user-id").value;
    const formData = new FormData(editForm);
    const data = Object.fromEntries(formData.entries());

    try {
      await api.updateUser(userId, data);
      alert("Usuario actualizado con éxito.");
      closeEditModal();
      loadUsers(); // Recargar la tabla de usuarios
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    }
  });

  // Event listener para los botones de cerrar del modal de estado
  closeStatusButtons.forEach((button) => {
    button.addEventListener("click", closeStatusModal);
  });

  // Event listener para el envío del formulario de cambio de estado
  statusForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const orderId = document.getElementById("edit-order-id").value;
    const newStatus = document.getElementById("edit-order-status").value;

    // Reutilizamos la función que ya teníamos
    await updateOrderStatus(orderId, newStatus);

    // Cerramos el modal después de la operación
    closeStatusModal();
  });

  // --- Lógica para el Modal de Productos ---
  // Event listeners para los botones de cerrar del modal de producto
  closeProductButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => productModal?.hide() // Usar el método 'hide' de Bootstrap
    );
  });

  // Manejar la previsualización de la imagen seleccionada
  document.getElementById("product-image-input")?.addEventListener("change", function () {
    const preview = document.getElementById("image-preview");
    const file = this.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    } else {
      preview.src = "#";
      preview.style.display = "none";
    }
  });

  productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const productId = document.getElementById("product-id").value;
    const formData = new FormData(productForm); // FormData maneja archivos y campos de texto

    try {
      const result = await api.saveProduct(productId, formData);
      alert(result.message);
      productModal.hide(); // Usar método de Bootstrap para cerrar
      loadProducts();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert(`No se pudo guardar el producto: ${error.message}`);
    }
  });

  // Event listener para el botón "Añadir Nuevo Producto"
  document.getElementById('addNewProductBtn')?.addEventListener('click', () => {
    openProductModal(); // Llamar sin ID para abrir en modo "añadir"
  });

  // Inicializar: mostrar el primer tab (Dashboard) y cargar sus datos al cargar la página
  const initialTabButton = document.querySelector(".admin-tab.activo");
  if (initialTabButton) {
    const initialTabName = initialTabButton.dataset.tab;
    showTabContent(initialTabName);
    // Cargar los datos del tab inicial
    if (initialTabName === "dashboard") {
      loadDashboardStats();
      loadRevenueChart();
    } else if (initialTabName === "usuarios") {
      loadUsers();
    } else if (initialTabName === "productos") {
      loadProducts();
    }
  }

  // --- Lógica para filtros y acciones de tabla (ejemplos conceptuales) ---

  // Filtro de usuarios (ejemplo básico)
  const userSearchInput = document.getElementById("userSearchInput");
  let searchTimeout;

  if (userSearchInput) {
    userSearchInput.addEventListener("input", (event) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadUsers(1); // Reinicia a la página 1 con el nuevo término de búsqueda
      }, 300); // 300ms debounce para no sobrecargar el servidor
    });
  }

  // Filtro de fecha para el gráfico
  const applyDateFilterBtn = document.getElementById("applyDateFilter");
  if (applyDateFilterBtn) {
    applyDateFilterBtn.addEventListener("click", loadRevenueChart);
  }

  const clearDateFilterBtn = document.getElementById("clearDateFilter");
  if (clearDateFilterBtn) {
    clearDateFilterBtn.addEventListener("click", () => {
      document.getElementById("startDate").value = "";
      document.getElementById("endDate").value = "";
      loadRevenueChart();
    });
  }

  // Filtro de pedidos por estado (ejemplo básico)
  const orderStatusFilter = document.getElementById("filtroEstado");
  if (orderStatusFilter) {
    orderStatusFilter.addEventListener("change", () => loadOrders(1));
  }

  // Filtro de búsqueda para pedidos
  const orderSearchInput = document.getElementById("buscarPedido");
  if (orderSearchInput) {
    orderSearchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadOrders(1); // Reinicia a la página 1 con el nuevo término de búsqueda
      }, 300);
    });
  }

  // Filtro de búsqueda para productos
  const productSearchInput = document.getElementById("productSearchInput");
  if (productSearchInput) {
    productSearchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadProducts(1); // Reinicia a la página 1 con el nuevo término de búsqueda
      }, 300);
    });
  }

  // Botón para exportar a CSV
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const statusFilter =
        document.getElementById("filtroEstado")?.value || "todos";
      const searchTerm = document.getElementById("buscarPedido")?.value || "";
      const exportUrl = `/api/admin/export_orders_csv?status=${statusFilter}&search=${encodeURIComponent(
        searchTerm
      )}`;
      window.open(exportUrl, "_blank");
    });
  }

  // Delegación de eventos para botones de acción en tablas (ejemplo)
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("btn-accion")) {
      const id = event.target.dataset.id;

      if (target.classList.contains("editar")) {
        // Botón Editar
        if (target.dataset.type === "user") {
          openEditModal(id);
        } else if (target.dataset.type === "product") {
          openProductModal(id);
        }
      } else if (target.classList.contains("eliminar")) {
        // Botón Eliminar
        if (target.dataset.type === "user") {
          if (
            confirm(
              `¿Estás seguro de que deseas eliminar al usuario con ID: ${id}?`
            )
          ) {
            deleteUser(id);
          }
        } else if (target.dataset.type === "product") {
          if (confirm(`¿Estás seguro de que deseas eliminar este producto?`)) {
            deleteProduct(id);
          }
        }
      } else if (target.classList.contains("cambiar-estado")) {
        // Botón Cambiar Estado
        const currentStatus = target.closest("tr").cells[6].textContent; // Asumiendo que el estado está en la 7ma columna (índice 6)
        openStatusModal(id, currentStatus);
      } else if (target.classList.contains("ver")) {
        // Botón Ver Detalles
        openOrderDetailsModal(id);
      }
    }
  });

  // Botón para añadir producto
  const addProductBtn = document.getElementById("add-product-btn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openProductModal();
    });
  }
});