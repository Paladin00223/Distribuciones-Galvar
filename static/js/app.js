function renderizarCategorias(listaDeCategorias) {
    const contenedor = document.getElementById('contenedor');
    contenedor.innerHTML = '';

    listaDeCategorias.forEach(categoria => {
        const link = document.createElement('a');
        link.href = `/categoria/${categoria._id}`;
        link.classList.add('categoria-enlace');
        const article = document.createElement('article');
        article.innerHTML = `
            <img src= ""${categoria.img}</p>
            <h3>${categoria.nombre}</h3>
        `;
        link.appendChild(article);
        contenedor.appendChild(link);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    renderizarCategorias(categorias);
});