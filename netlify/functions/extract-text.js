// netlify/functions/extract-text.js
// Extract text from PDF and Word documents

const mammoth = require('mammoth');
const PDFParser = require('pdf2json');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { fileData, fileType, fileName } = JSON.parse(event.body);
    
    if (!fileData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing file data' })
      };
    }

    // Decode base64 file data
    const buffer = Buffer.from(fileData, 'base64');
    let extractedText = '';

    const fileNameLower = (fileName || '').toLowerCase();

    if (fileNameLower.endsWith('.pdf')) {
      // Extract text from PDF using pdf2json
      extractedText = await extractPDFText(buffer);
      
    } else if (fileNameLower.endsWith('.docx')) {
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      
    } else if (fileNameLower.endsWith('.doc')) {
      // Try to extract from old DOC format
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (err) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Could not extract text from .doc file. Please save as .docx or .pdf and try again.' 
          })
        };
      }
    } else if (fileNameLower.endsWith('.txt')) {
      // Plain text
      extractedText = buffer.toString('utf-8');
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unsupported file type. Use .txt, .pdf, .doc, or .docx' })
      };
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Could not extract meaningful text. The file may be scanned images or encrypted.' 
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        text: extractedText,
        fileName: fileName,
        length: extractedText.length
      })
    };

  } catch (error) {
    console.error('Extraction error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to extract text',
        message: error.message
      })
    };
  }
};

function extractPDFText(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      let text = '';
      if (pdfData.formImage && pdfData.formImage.Pages) {
        pdfData.formImage.Pages.forEach(page => {
          if (page.Texts) {
            page.Texts.forEach(textItem => {
              if (textItem.R) {
                textItem.R.forEach(r => {
                  if (r.T) {
                    // Decode URL-encoded text
                    text += decodeURIComponent(r.T) + ' ';
                  }
                });
              }
            });
            text += '\n';
          }
        });
      }
      resolve(text);
    });
    
    pdfParser.on('pdfParser_dataError', (error) => {
      reject(new Error('PDF parsing failed: ' + error.parserError));
    });
    
    pdfParser.parseBuffer(buffer);
  });
}
