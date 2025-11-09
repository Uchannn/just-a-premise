// server/utils/fileUtils.js
import fs from "fs";

export const safeWrite = (filePath, data) => {
  const backupPath = filePath + ".bak";
  try {
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error("Write error:", err);
    return { success: false, error: err.message };
  }
};
