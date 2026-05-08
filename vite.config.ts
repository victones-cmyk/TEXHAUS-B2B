import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp'])
const allowedImageMimes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const localUploadPlugin = () => ({
  name: 'local-upload',
  configureServer(server: { middlewares: { use: (path: string, handler: (req: import('http').IncomingMessage, res: import('http').ServerResponse) => void) => void } }) {
    server.middlewares.use('/api/upload', (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
      if (req.method === 'POST') {
        const uploadDir = path.resolve(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const form = formidable({ 
          uploadDir,
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024 // 10MB
        });

        form.parse(req, (err, _fields, files) => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          const fileArray = Array.isArray(files.image) ? files.image : [files.image];
          const file = fileArray[0];
          
          if (file) {
            const ext = path.extname(file.originalFilename ?? '').toLowerCase();
            const mimetype = file.mimetype ?? '';

            if (!allowedImageExtensions.has(ext) || !allowedImageMimes.has(mimetype)) {
              fs.rmSync(file.filepath, { force: true });
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Formato de imagem não permitido.' }));
              return;
            }

            const fileName = path.basename(file.filepath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: `/uploads/${fileName}` }));
          } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Nenhuma imagem enviada.' }));
          }
        });
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localUploadPlugin()],
  server: {
    port: 5173,
    allowedHosts: ['b2b.victones.com.br'],
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
    },
  },
})
