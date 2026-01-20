
// FILE: fileUtils.js
// DESCRIPTION:
// A utility for extracting text from different file formats (PDF, DOCX, XLSX, TXT)
// and splitting it into manageable chunks for RAG embedding.


const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Document } = require("@langchain/core/documents");

// FUNCTION: processUploadedFile
// DESCRIPTION: Extracts text from a file and splits it for vector storage.
// INPUT: file (Object) - Multer file object containing path and mimetype.
// OUTPUT: Array<Document> - List of LangChain Document objects with metadata.
const processUploadedFile = async (file) => {
    if (!file) return [];

    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    let documents = [];
    const filePath = file.path;

    try {
        // 1. EXTRACT RAW TEXT
        // We use different libraries based on the file extension.
        let text = "";
        if (fileExtension === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (fileExtension === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            text = xlsx.utils.sheet_to_txt(sheet);
        } else {
            // Text file fallback (txt, md, etc.)
            text = fs.readFileSync(filePath, 'utf-8');
        }

        // 2. CREATE DOCUMENT OBJECT
        if (text) {
            documents = [
                new Document({
                    pageContent: text,
                    metadata: { source: file.originalname, page: 1 }
                })
            ];
        }

    } catch (e) {
        console.error("Error processing file", e);
    } finally {
        // 3. CLEANUP
        // Always try to delete the temp file to save disk space.
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.error("Cleanup error", e);
        }
    }

    // 4. SPLIT INTO CHUNKS (RAG STRATEGY)
    // Large texts are bad for semantic search. We split them into
    // overlapping chunks (1000 chars) for better retrieval accuracy.
    if (documents.length > 0) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = await splitter.splitDocuments(documents);

        // Preserve source metadata across chunks
        splitDocs.forEach(doc => {
            doc.metadata.source = file.originalname;
        });

        return splitDocs;
    }

    return [];
};

module.exports = {
    processUploadedFile
};
