import morgan, { StreamOptions } from 'morgan';
import fs from 'fs';
import path from 'path';

let morganMiddleware: any;

if (process.env.NODE_ENV === 'production') {
  // ✅ En producción: logs solo a consola (Railway los captura)
  morganMiddleware = morgan('combined');
  console.log('✅ Morgan configurado para consola (producción)');
} else {
  // ✅ En desarrollo: logs a archivo
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ Directorio logs/ creado');
  }
  
  const accessLogPath = path.join(logsDir, 'access.log');
  const accessLogStream = fs.createWriteStream(accessLogPath, { flags: 'a' });
  
  morganMiddleware = morgan('combined', { stream: accessLogStream });
  console.log('✅ Morgan configurado para archivo (desarrollo)');
}

export default morganMiddleware;