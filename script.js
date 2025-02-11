import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

const dropZone = document.getElementById('dropZone');
const gradesTableBody = document.querySelector('#gradesTable tbody');


dropZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // Prevent the default behavior of opening the file
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); // Prevent the default behavior of opening the file

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        processPdf(file);
    } else {
        alert('Please drop a valid PDF file.');
    }
});
// Process the PDF file
async function processPdf(file) {
    const fileReader = new FileReader();

    fileReader.onload = async function (e) {
        const pdfData = new Uint8Array(e.target.result);

        try {
            // Load the PDF using pdf.js
            const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
            let totalPages = pdfDoc.numPages;

            // Extract text from each page and process grades
            for (let i = 1; i <= totalPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                let pageText = "";

                textContent.items.forEach(function (item) {
                    pageText += item.str + " ";
                });

                // Extract grades from the current page
                extractGrades(pageText);
            }
        } catch (error) {
            console.error('Error loading PDF: ', error);
        }
    };

    fileReader.readAsArrayBuffer(file);
}

// Extract grades using regex
function extractGrades(text) {
    //const regex = /(.*) *\n[\S\s]*[12][A-G][ \n]*(.*)[\S\s]*KZ\n([\n\/\d%]*)%\n[\S\s]*Grade\n(\/[\n\/\d%]*)%\n[\S\s]*Grade\n([\d\n ]*)\n[\S\s]*/;
    const regex = /(.*?) 2[\S\s]*[12][A-G] (.*?) -/
    const match = text.match(regex);
    console.log(text)

    if (match) {
        //const [_, name, subject, g1, g2, g3] = match;
        const [_, name, subject] = match
        displayGrades(name, subject);
    } else {
        console.warn(text)
        console.warn('No grades found in the extracted text.');
    }
}

// Display grades in the table
function displayGrades(name, subject) {
    const row = gradesTableBody.insertRow();

    row.insertCell(0).textContent = name;
    row.insertCell(1).textContent = subject;
    // row.insertCell(1).textContent = formativeGrades;
    // row.insertCell(2).textContent = summativeGrades;
    // row.insertCell(3).textContent = totalGrade;
}