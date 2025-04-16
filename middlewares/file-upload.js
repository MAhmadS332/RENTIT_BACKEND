const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const FileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, callBack) => {
      callBack(null, "uploads/images");
    },
    filename: (req, file, callBack) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      callBack(null, uuidv1() + "." + extension);
    },
  }),
  fileFilter: (req, file, callBack) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("invalid type");
    callBack(error, isValid);
  },
});

module.exports = FileUpload;
