import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

const dropZone = document.getElementById('dropZone');

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
            makeChart()
        } catch (error) {
            console.error('Error loading PDF: ', error);
        }
    };

    fileReader.readAsArrayBuffer(file);
}


const grades = {}
// Extract grades using regex
function extractGrades(text) {
    const regex = /(.*?) \d[\S\s]*[12][A-G] (.*?) - (.*?)  Assessments: [\S\s]*Semester grade ([\d\/ ]*)?([\S ]*)?%   IB *KZ ([\d\/ %]*)?[A-Za-z ]*(\/[\d\/ %]*)?[A-Za-z ]*([\d ]*)[\S\s]*Absence (.*)[\d]+ /
    const match = text.match(regex);
    console.log(text)

    if (match) {
        const [_, name, subject, teacher, dates, names, fmax, smax, rawgrades, attendance] = match
        const totalGrade = rawgrades.trim().split(/\s+/).slice(-3);
        console.log(rawgrades)
        if (totalGrade[0]) {
            grades[subject] = parseInt(totalGrade[0], 10)
        }
        
    } else {
        console.warn(text)
        console.warn('No grades found in the extracted text.');
    }
}
// Get the canvas element
const ctx = document.getElementById('gradesChart').getContext('2d');
let gradesChart = null;
function makeChart() {
    if (gradesChart) {
        gradesChart.destroy()
    }

    // Convert to sorted arrays in one step
    const sortedEntries = Object.entries(grades)
    .sort(([, gradeA], [, gradeB]) => gradeB - gradeA); // Sort by grade (descending)

    // Extract sorted labels and grades
    const sortedLabels = sortedEntries.map(([subject]) => subject);
    const sortedGrades = sortedEntries.map(([, grade]) => grade);

    gradesChart = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: sortedLabels,
        datasets: [{
            label: 'Grades (%)',
            data: sortedGrades,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }]
        },
        options: {
        scales: {
            y: {
            beginAtZero: true,
            max: 100,
            },
        },
        plugins: {
            annotation: {
            annotations: {
                line7: {
                type: 'line',
                yMin: 84, // Draw a horizontal line at y = 84
                yMax: 84,
                borderColor: 'blue', // Line color
                borderWidth: 1,
                label: {
                    content: '7', // Label text
                    enabled: true,
                    position: 'end', // Position of the label
                    backgroundColor: 'red', // Label background color
                    color: 'white', // Label text color
                },
                },
                line6: {
                type: 'line',
                yMin: 67, // Draw a horizontal line at y = 67
                yMax: 67,
                borderColor: 'blue', // Line color
                borderWidth: 1,
                label: {
                    content: '6', // Label text
                    enabled: true,
                    position: 'end', // Position of the label
                    backgroundColor: 'green', // Label background color
                    color: 'white', // Label text color
                },
                },
                line5: {
                type: 'line',
                yMin: 54, // Draw a horizontal line at y = 67
                yMax: 54,
                borderColor: 'blue', // Line color
                borderWidth: 1,
                label: {
                    content: '5', // Label text
                    enabled: true,
                    position: 'end', // Position of the label
                    backgroundColor: 'green', // Label background color
                    color: 'white', // Label text color
                },
                },
            },
            },
        },
        responsive: true,
        },
    });
}