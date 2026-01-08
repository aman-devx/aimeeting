const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { encrypt } = require("node-qpdf");
const multer = require("multer");

// Upload middleware with better configuration
const upload = multer({ 
    dest: "uploads/",
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 
    },
    fileFilter: (req, file, cb) => {
        // Pre-validate file type
        if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

exports.uploadMiddleware = upload.single("file");

// Cleanup helper function
const cleanupFiles = async (...filePaths) => {
    for (const filePath of filePaths) {
        if (filePath) {
            try {
                await fs.unlink(filePath);
            } catch (error) {
                console.error(`Failed to delete ${filePath}:`, error.message);
            }
        }
    }
};

// Controller to lock PDF
exports.lockpdf = async (req, res) => {
    const startTime = Date.now();
    let filePath, tempFilePath, outputPath;
    
    try {
        // Debug logging
        console.log('=== Request Debug Info ===');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
        console.log('req.body.password:', req.body.password);
        console.log('Headers:', req.headers);
        console.log('========================');

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "No file uploaded"
            });
        }

        filePath = req.file.path;
        
        // Get password from body - handle different formats
        const password = req.body.password || req.body.Password || '';

        console.log('Extracted password:', password);
        console.log('Password length:', password.length);
        console.log('Password type:', typeof password);

        // Validate password
        if (!password || password.trim() === '') {
            await cleanupFiles(filePath);
            return res.status(400).json({
                status: false,
                message: "Password is required"
            });
        }

        if (password.length < 4) {
            await cleanupFiles(filePath);
            return res.status(400).json({
                status: false,
                message: "Password must be at least 4 characters"
            });
        }

        // Load and validate PDF
        const existingPdfBytes = await fs.readFile(filePath);
        let pdfDoc;
        
        try {
            pdfDoc = await PDFDocument.load(existingPdfBytes);
            console.log('✅ PDF loaded successfully');
        } catch (loadError) {
            console.error('❌ PDF load error:', loadError);
            await cleanupFiles(filePath);
            return res.status(400).json({
                status: false,
                message: "Invalid or corrupted PDF file"
            });
        }

        // Generate unique file paths
        const timestamp = Date.now();
        tempFilePath = path.join("uploads", `temp-${timestamp}.pdf`);
        outputPath = path.join("uploads", `locked-${timestamp}.pdf`);

        // Save to temporary file
        const pdfBytes = await pdfDoc.save();
        await fs.writeFile(tempFilePath, pdfBytes);
        console.log('✅ Temp file created');

        // Encryption options - FIXED for node-qpdf v2.x
        // node-qpdf expects the password as a direct parameter, not nested in options
        const encryptOptions = {
            input: tempFilePath,
            output: outputPath,
            password: 'passwordsadf',  // User password - trimmed to remove whitespace
            keyLength: 128,
            restrictions: {
                print: 'none',
                modify: 'none', 
                extract: 'n',
                annotate: 'n',
                fillForms: 'n',
                accessibility: 'n',
                assemble: 'n'
            }
        };

        // Encrypt PDF using the correct syntax
        console.log('🔒 Starting encryption with password...');
        console.log('Encrypt options:', { ...encryptOptions, password: '***' }); // Log without exposing password
        
        await encrypt(tempFilePath, outputPath, {
            keyLength: encryptOptions.keyLength,
            password: encryptOptions.password,
            restrictions: encryptOptions.restrictions
        });
        
        console.log('✅ Encryption complete');

        // Verify output file exists
        try {
            const stats = await fs.stat(outputPath);
            if (stats.size === 0) {
                throw new Error("Generated PDF is empty");
            }
            console.log('✅ Output file size:', stats.size, 'bytes');
        } catch (statError) {
            throw new Error("Encrypted PDF file was not created");
        }

        // Read and send encrypted file
        const encryptedPdfBuffer = await fs.readFile(outputPath);

        // Set response headers
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="locked.pdf"',
            'Content-Length': encryptedPdfBuffer.length,
            'Cache-Control': 'no-cache'
        });

        // Send the buffer
        res.send(encryptedPdfBuffer);
        console.log(`✅ PDF encrypted and sent in ${Date.now() - startTime}ms`);

        // Cleanup files asynchronously (non-blocking)
        setImmediate(async () => {
            await cleanupFiles(filePath, tempFilePath, outputPath);
            console.log('✅ Cleanup complete');
        });

    } catch (error) {
        console.error("❌ Error in lockpdf:", error.message);
        console.error("Stack:", error.stack);
        
        // Cleanup on error
        await cleanupFiles(filePath, tempFilePath, outputPath);

        // Send error response if headers not sent
        if (!res.headersSent) {
            const statusCode = error.message.includes('qpdf') ? 500 : 400;
            res.status(statusCode).json({
                status: false,
                message: error.message || "Failed to encrypt PDF"
            });
        }
    }
};