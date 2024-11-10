import multer from 'multer';
import path from 'path';
import fs from 'fs'

// Настраиваем хранилище для загруженных файлов
const uploadDir = 'uploads/';

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Ограничиваем размер файла до 5MB и принимаем только изображения
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Загрузите изображения формата JPEG или PNG'));
    }
  },
});

export default upload;
