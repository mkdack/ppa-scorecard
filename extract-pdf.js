const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractPDF() {
    try {
        const buffer = fs.readFileSync('/Users/michalkaczorowski/Downloads/Off-Site Term Sheet Primer.pdf');
        const uint8Array = new Uint8Array(buffer);
        
        const parser = new PDFParse(uint8Array);
        await parser.load();
        
        const result = await parser.getText();
        
        // Combine all page text
        let fullText = '';
        for (const page of result.pages) {
            fullText += `\n=== PAGE ${page.num} ===\n`;
            fullText += page.text + '\n';
        }
        
        console.log(fullText);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

extractPDF();
