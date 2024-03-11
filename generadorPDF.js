const PDFDocument = require('pdfkit');

function generarPDF(datosOficio, callback) {
    const doc = new PDFDocument(); 

    // Pipe its output somewhere, like to a file or HTTP response
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        callback(pdfData);
    });

    // Escribir contenido en el PDF
    doc.text('Asunto: ' + datosOficio.asunto)
       .moveDown()
       .text('Maestro: ' + datosOficio.maestro)
       .moveDown()
       .text('Materia: ' + datosOficio.materia)
       .moveDown()
       .text('Grupo: ' + datosOficio.grupo)
       .moveDown()
       .text('Dirigido a: ' + datosOficio.dirigido)
       .moveDown()
       .text('Jefe de docentes: ' + datosOficio.jefeDocentes)
       .moveDown()
       .text('Fecha: ' + formatFecha(datosOficio.fecha))
       .moveDown()
       .text('Texto del Oficio: ' + datosOficio.textoOficio)
       .moveDown();

    doc.end();
}

// Función para formatear la fecha
function formatFecha(fecha) {
    const date = new Date(fecha);
    const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return formattedDate;
}

module.exports = { generarPDF };
