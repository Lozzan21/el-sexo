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
    doc.text('Número de Oficio: ' + datosOficio.numeroOficio)
       .moveDown()
       .text('Asunto: ' + datosOficio.asunto)
       .moveDown()
       .text('A quién va dirigido: ' + datosOficio.destinatario)
       .moveDown()
       .text('Fecha: ' + datosOficio.fecha)
       .moveDown()
       .text('Texto del Oficio: ' + datosOficio.textoOficio)
       .moveDown();

    doc.end();
}

module.exports = { generarPDF };
