document.addEventListener('DOMContentLoaded', () => {
    const contactButtons = document.querySelectorAll('.contact-button');
    
    contactButtons.forEach(button => {
        button.addEventListener('click', () => {
            const phoneNumber = '3208186026';
            const message = '¿Deseas contactar a Distribuciones Galvar?';
            
            if (confirm(message)) {
                // Crear un enlace de WhatsApp
                const whatsappLink = `https://wa.me/57${phoneNumber}`;
                window.open(whatsappLink, '_blank');
            }
        });
    });
}); 