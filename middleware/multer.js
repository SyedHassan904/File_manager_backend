import multer from "multer";
import crypto from 'crypto';
import path from "path";
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'temp');

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // use the absolute path
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(5, (err, name) => {
      if (err) return cb(err);
      const fn = path.parse(file.originalname).name + name.toString('hex') + path.extname(file.originalname);
      cb(null, fn);
    });
  }
});

const upload = multer({ storage: storage });

export default upload;