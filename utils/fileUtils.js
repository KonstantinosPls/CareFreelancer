/**
 * File Utility Functions
 * Handles safe file deletion for image cleanup
 */

const fs = require('fs');
const path = require('path');

/**
 * Safely delete a file from the uploads directory
 * @param {string} filePath - The path stored in the database (e.g., '/uploads/profiles/image.jpg')
 * @returns {Promise<boolean>} - True if deleted, false if file didn't exist or error
 */
const deleteFile = async (filePath) => {
  // Don't try to delete if path is empty or undefined
  if (!filePath) return false;

  // Don't delete placeholder/default images or external URLs
  if (filePath.startsWith('http') || filePath.includes('placeholder')) {
    return false;
  }

  try {
    // Convert URL path to filesystem path
    // '/uploads/profiles/image.jpg' -> 'public/uploads/profiles/image.jpg'
    const fullPath = path.join(__dirname, '..', 'public', filePath);

    // Check if file exists before trying to delete
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted old file: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    // Log error but don't throw - file deletion shouldn't break the main operation
    console.error(`Failed to delete file ${filePath}:`, error.message);
    return false;
  }
};

/**
 * Delete multiple files
 * @param {string[]} filePaths - Array of file paths to delete
 * @returns {Promise<number>} - Number of files successfully deleted
 */
const deleteFiles = async (filePaths) => {
  if (!filePaths || !Array.isArray(filePaths)) return 0;

  let deleted = 0;
  for (const filePath of filePaths) {
    if (await deleteFile(filePath)) {
      deleted++;
    }
  }
  return deleted;
};

/**
 * Check if a file exists in the uploads directory
 * @param {string} filePath - The path stored in the database
 * @returns {boolean}
 */
const fileExists = (filePath) => {
  if (!filePath) return false;

  try {
    const fullPath = path.join(__dirname, '..', 'public', filePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
};

module.exports = {
  deleteFile,
  deleteFiles,
  fileExists
};
