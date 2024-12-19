import multer from "multer";
import path from "path";
import fs from "fs";

// Настраиваем хранилище для загруженных файлов
const uploadDir = "uploads/";

// Проверяем, существует ли папка uploads
if (!fs.existsSync(uploadDir)) {
  // Если не существует, создаем папку
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Папка для сохранения файлов
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Корректное кодирование кириллицы и других символов
    const originalName = file.originalname.replace(/\s+/g, "_"); // Убираем пробелы
    const sanitizedOriginalName = path.basename(originalName, path.extname(originalName)); // Имя без расширения
    const encodedName = Buffer.from(sanitizedOriginalName, "latin1").toString("utf8"); // Поддержка кириллицы
    cb(null, `${encodedName}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Устанавливаем ограничение только на размер файла (10MB) и количество файлов (10)
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // Ограничиваем размер файла и количество файлов
});

export default upload;
