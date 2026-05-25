const pdfParse = require('pdf-parse');

/**
 * Extract plain text from a PDF buffer.
 * Throws an error with statusCode 422 for invalid/corrupt PDFs.
 */
async function extractTextFromPdf(buffer) {
  if (!buffer?.length) {
    const error = new Error('PDF file is empty');
    error.statusCode = 422;
    throw error;
  }

  try {
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
  } catch (err) {
    console.error('PDF extract error:', err.message);
    const error = new Error(
      'Could not read this PDF. Export it again from Word/Google Docs as PDF, or try a different file.'
    );
    error.statusCode = 422;
    error.cause = err;
    throw error;
  }
}

module.exports = { extractTextFromPdf };
