import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

// Ruta absoluta a la carpeta uploads dentro de src
const uploadDir = path.join(__dirname, '..', 'uploads');

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

const storage: StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + uniqueSuffix + ext);
	}
});

const upload = multer({ storage });

export default upload;
