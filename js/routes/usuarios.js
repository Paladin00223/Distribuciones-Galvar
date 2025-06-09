// Rutas para usuarios
const express = require('express');
const router = express.Router();

// Middleware para verificar autenticación
const verificarAuth = (req, res, next) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ mensaje: 'No autorizado' });
    }
    next();
};

// Comprar paquete
router.post('/comprar-paquete', verificarAuth, async (req, res) => {
    try {
        const { paqueteId, puntos } = req.body;
        const usuario = req.session.usuario;

        // Verificar si el usuario tiene suficientes puntos
        if (usuario.puntos < puntos) {
            return res.status(400).json({ mensaje: 'Puntos insuficientes' });
        }

        // Actualizar paquete del usuario
        usuario.paquete = paqueteId;
        usuario.puntos -= puntos;

        // Si es el paquete 1 o superior, calcular puntos de bonificación
        if (paqueteId >= 1) {
            // 50% del paquete 1 como bonificación
            const puntosBonificacion = Math.floor(1000 * 0.5); // 1000 es el precio del paquete 1
            usuario.puntos += puntosBonificacion;
        }

        // Guardar cambios
        req.session.usuario = usuario;

        // Si el usuario tiene referido, otorgar puntos al referido
        if (usuario.referidoPor) {
            const referido = await Usuario.findById(usuario.referidoPor);
            if (referido && referido.paquete >= 1) {
                // El referido recibe puntos por la compra del paquete
                referido.puntos += Math.floor(puntos * 0.1); // 10% de la compra
                await referido.save();
            }
        }

        res.json({
            mensaje: 'Paquete comprado exitosamente',
            usuario: usuario
        });
    } catch (error) {
        console.error('Error al comprar paquete:', error);
        res.status(500).json({ mensaje: 'Error al procesar la compra' });
    }
});

// Obtener información del usuario
router.get('/info', verificarAuth, (req, res) => {
    const usuario = req.session.usuario;
    res.json({
        usuario: {
            nombre: usuario.nombre,
            email: usuario.email,
            puntos: usuario.puntos,
            paquete: usuario.paquete
        }
    });
});

module.exports = router; 