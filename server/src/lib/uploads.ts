import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { HttpError } from './validate'

export const UPLOAD_ROOT = path.join(__dirname, '../../uploads')

const IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
}
/**
 * Multer instance for raster images. The stored extension is derived from the
 * MIME type, never from the client filename, so nothing like .html or .svg
 * (both can carry scripts) can land in /uploads.
 */
export function imageUpload(opts: { subdir?: string; prefix: string; maxMb: number }) {
  const dir = path.join(UPLOAD_ROOT, opts.subdir || '')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, file, cb) => {
        cb(null, `${opts.prefix}${Date.now()}-${crypto.randomBytes(4).toString('hex')}${IMAGE_TYPES[file.mimetype]}`)
      },
    }),
    limits: { fileSize: opts.maxMb * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (IMAGE_TYPES[file.mimetype]) cb(null, true)
      else cb(new HttpError(400, 'Разрешены только изображения (PNG, JPG, WEBP, GIF)'))
    },
  })
}

export const publicPath = (file: Express.Multer.File, subdir?: string) =>
  `/uploads/${subdir ? subdir + '/' : ''}${file.filename}`

/** Remove a previously uploaded file given its public `/uploads/...` path. */
export function deleteUpload(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith('/uploads/')) return
  const abs = path.resolve(UPLOAD_ROOT, publicUrl.slice('/uploads/'.length))
  if (!abs.startsWith(UPLOAD_ROOT + path.sep)) return
  fs.promises.unlink(abs).catch(() => { /* already gone */ })
}
