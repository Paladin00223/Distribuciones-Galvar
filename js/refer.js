function copyReferLink() {
    const referLink = document.getElementById('referLink').textContent;
    navigator.clipboard.writeText(referLink).then(() => {
        alert('Enlace copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el enlace:', err);
        alert('Error al copiar el enlace');
    });
}

function loadReferralData() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    const referLink = `${window.location.origin}${window.location.pathname}?ref=${user.id || 'new'}`;
    document.getElementById('referLink').textContent = referLink;

    // Aquí puedes cargar las estadísticas reales cuando las implementes
    // Por ahora usamos datos de ejemplo
    document.getElementById('totalReferrals').textContent = '0';
    document.getElementById('activeReferrals').textContent = '0';
    document.getElementById('totalEarnings').textContent = '$0';
}

// Verificar si hay un código de referencia en la URL
window.onload = function () {
    loadReferralData();

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && refCode !== 'new') {
        localStorage.setItem('referralCode', refCode);
    }
};