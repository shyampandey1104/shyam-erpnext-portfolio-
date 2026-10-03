const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const fileInfo = document.getElementById('file-info');
const fileNameDisplay = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const previewBtn = document.getElementById('preview-btn');
const previewModal = document.getElementById('preview-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const printBtn = document.getElementById('print-btn');
const labelsContainer = document.getElementById('labels-container');
const printArea = document.getElementById('print-area');

let currentExcelData = [];

// Format numbers to 3 decimal places
function formatWt(val) {
    if (val === undefined || val === null || val === '') return '0.000';
    const num = parseFloat(val);
    if (isNaN(num)) return '0.000';
    return num.toFixed(3);
}

// Generate single label HTML
function generateLabelHTML(row) {
    if (!row['Item Code']) return '';
    
    const itemCode = String(row['Item Code']).trim();
    
    // Ignore rows where "Item Code" is actually a long instruction note (like "these details needs to be printed...")
    if (itemCode.length > 30 && !row['Gross Wt.'] && !row['Net Wt.']) {
        return ''; 
    }

    return `
        <div class="print-label">
            <div class="label-row-top">
                <span class="col-left">${row['Purity'] || ''}</span>
                <span class="col-right">${row['Ready Receipt'] || ''}</span>
            </div>
            <div class="label-code">
                ${itemCode}
            </div>
            <div class="label-row-data">
                <span class="col-label">Gross</span>
                <span class="col-val">${formatWt(row['Gross Wt.'])}</span>
            </div>
            <div class="label-row-data">
                <span class="col-label">Net</span>
                <span class="col-val">${formatWt(row['Net Wt.'])}</span>
            </div>
            <div class="label-divider">--------------------</div>
            <div class="label-row-data">
                <span class="col-label">Kun</span>
                <span class="col-val">${row['Kundan pcs'] || 0} / ${formatWt(row['Kundan Wt.'])}</span>
            </div>
            <div class="label-row-data">
                <span class="col-label">CS</span>
                <span class="col-val">${formatWt(row['CS wt'])}</span>
            </div>
            <div class="label-row-data">
                <span class="col-label">BB</span>
                <span class="col-val">${formatWt(row['BB wt'])}</span>
            </div>
            <div class="label-row-data">
                <span class="col-label">OT</span>
                <span class="col-val">${formatWt(row['OT wt'])}</span>
            </div>
        </div>
    `;
}

// File handling logic
function handleFile(file) {
    if (!file) return;
    
    // Update UI
    dropZone.style.display = 'none';
    fileInfo.style.display = 'flex';
    fileNameDisplay.textContent = file.name;
    previewBtn.disabled = false;

    // Read Excel
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        
        // Assume data is in the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        currentExcelData = XLSX.utils.sheet_to_json(worksheet);
    };
    reader.readAsArrayBuffer(file);
}

// Drag & Drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// Click to browse
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

// Remove file
removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    currentExcelData = [];
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    previewBtn.disabled = true;
});

// Preview & Print actions
previewBtn.addEventListener('click', () => {
    let allLabelsHTML = '';
    
    currentExcelData.forEach(row => {
        allLabelsHTML += generateLabelHTML(row);
    });

    if (!allLabelsHTML.trim()) {
        allLabelsHTML = '<p style="color: black; text-align: center; padding: 20px;">No valid data found in the Excel sheet.</p>';
    }

    // Set to modal preview
    labelsContainer.innerHTML = allLabelsHTML;
    
    // Set to actual print area
    printArea.innerHTML = allLabelsHTML;
    
    // Show modal
    previewModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    previewModal.classList.remove('active');
});

// Close modal on outside click
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        previewModal.classList.remove('active');
    }
});

// Print
printBtn.addEventListener('click', () => {
    window.print();
});
