import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs', 'access.log'), { flags: 'a' })

export default accessLogStream;