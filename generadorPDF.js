const PDFDocument = require('pdfkit');
const fs = require('fs');

function generarPDF(datosOficio, callback) {
    const doc = new PDFDocument();

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        callback(pdfData);
    });
    const imagePath = 'img/Membrete.jpg';

    if (fs.existsSync(imagePath)) {
        doc.image(imagePath, {
            fit: [250, 250], 
            align: 'center'
        });
    } else {
        console.error('La imagen no pudo ser encontrada en la ruta especificada.');
    }
    

    doc
        .text('             ÁREA: SERVICIOS DOCENTES \n OFICIO No. 220 (CE-148)946/2024', {
            align: 'right',
            bold: true,
            fontSize: 14
        })
        .text('Asunto: ' + datosOficio.asunto, {
            align: 'right'
        })
        .moveDown()
        .text('Durango, Dgo., ' + formatFecha(datosOficio.fecha), {
            align: 'right'
        })
        .moveDown(3)
        .text(datosOficio.maestro)
        .moveDown()
        .text(datosOficio.textoOficio)
        .moveDown(16)
        .text('Atentamente.')
        .moveDown(4)
        .text(' M.T.I. JOEL VÀZQUEZ RÌOS \n JEFE DEL DEPARTAMENTO \n DE SERVICIOS DOCENTES')
        .moveDown(4);

        const imagePath2 = 'img/Membrete-bj.jpg';

    if (fs.existsSync(imagePath2)) {
        doc.image(imagePath2, {
            fit: [500, 600], 
            align: 'center'
        });
    } else {
        console.error('La imagen no pudo ser encontrada en la ruta especificada.');
    }

    doc.end();
}

function formatFecha(fecha) {
    const date = new Date(fecha);
    const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return formattedDate;
}

module.exports = { generarPDF };
