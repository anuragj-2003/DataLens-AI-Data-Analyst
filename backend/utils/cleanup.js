const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const MAX_FILE_AGE_MS = 60 * 60 * 1000; // 1 Hour
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // Check every 30 minutes

/**
 * Checks the uploads directory and removes files older than MAX_FILE_AGE_MS.
 */
const cleanOldFiles = () => {
    // Ensure directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
        return;
    }

    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            console.error('[Cleanup] Error reading uploads directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(UPLOADS_DIR, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    // console.error(`[Cleanup] Error checking stats for ${file}:`, err);
                    return;
                }

                const now = Date.now();
                const fileAge = now - stats.mtimeMs; // Modification time

                if (fileAge > MAX_FILE_AGE_MS) {
                    console.log(`[Cleanup] Deleting old file: ${file} (Age: ${(fileAge / 1000 / 60).toFixed(1)}m)`);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`[Cleanup] Failed to delete ${file}:`, err);
                    });
                }
            });
        });
    });
};

/**
 * Starts the interval to clean up old files.
 */
const startCleanupJob = () => {
    console.log('[Cleanup] File cleanup job started.');
    console.log(`[Cleanup] Files older than ${MAX_FILE_AGE_MS / 1000 / 60} minutes will be deleted.`);

    // Run once immediately on startup logic (optional, but good for cleaning restart junk)
    cleanOldFiles();

    // Schedule regular cleanup
    setInterval(cleanOldFiles, CLEANUP_INTERVAL_MS);
};

module.exports = { startCleanupJob };
