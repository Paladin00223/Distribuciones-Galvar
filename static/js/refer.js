function copyReferLink() {
    const referLink = document.getElementById('referLink').textContent;
    navigator.clipboard.writeText(referLink).then(() => {
        alert('Enlace copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el enlace:', err);
        alert('Error al copiar el enlace');
    });
}

function loadReferralData(emailUsuario) {
    // Obtener usuario actual desde el backend
    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(usuarios => {
            const user = Array.isArray(usuarios) ? usuarios[0] : usuarios || {};
            const referLink = `${window.location.origin}${window.location.pathname}?ref=${user.id || 'new'}`;
            document.getElementById('referLink').textContent = referLink;

            // Obtener estadísticas de referidos desde el backend (ajusta el endpoint según tu API)
            fetch(`http://localhost:5000/referidos?usuarioId=${user.id}`)
                .then(response => response.json())
                .then(stats => {
                    document.getElementById('totalReferrals').textContent = stats.totalReferrals || '0';
                    document.getElementById('activeReferrals').textContent = stats.activeReferrals || '0';
                    document.getElementById('totalEarnings').textContent = stats.totalEarnings
                        ? `$${stats.totalEarnings.toLocaleString('es-CO')}` : '$0';
                })
                .catch(() => {
                    document.getElementById('totalReferrals').textContent = '0';
                    document.getElementById('activeReferrals').textContent = '0';
                    document.getElementById('totalEarnings').textContent = '$0';
                });
        })
        .catch(() => {
            document.getElementById('referLink').textContent = '';
            document.getElementById('totalReferrals').textContent = '0';
            document.getElementById('activeReferrals').textContent = '0';
            document.getElementById('totalEarnings').textContent = '$0';
        });
}

// Verificar si hay un código de referencia en la URL
window.onload = function () {
    // Suponiendo que tienes el email del usuario autenticado
    const emailUsuario = sessionStorage.getItem('usuarioEmail'); // Ajusta según tu lógica
    if (emailUsuario) {
        loadReferralData(emailUsuario);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && refCode !== 'new') {
        // Guardar el código de referido en el backend
        fetch('http://localhost:5000/referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode: refCode, email: emailUsuario })
        })
        .catch(error => {
            console.error('Error al guardar el código de referido:', error);
        });
    }
};