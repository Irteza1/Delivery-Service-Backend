const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { ReturnLabel } = require("../models/returnProcessSchema");

exports.getAllReturnLabelsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const returnLabels = await ReturnLabel.find({ userId, orderId: null });

        return await res.status(200).json(returnLabels);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

exports.updateReturnLabel = async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    try {
        const updatedReturnLabel = await ReturnLabel.updateOne(
            { _id: id },
            fieldsToUpdate
        );
        res.status(200).json(updatedReturnLabel);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err });
    }
};

exports.deleteReturnLabel = async (req, res) => {
    const { id } = req.params;
    try {
        await ReturnLabel.deleteOne({ _id: id });
        return res.status(204).end();
    } catch (err) {
        console.error(err);
        return res.status(404).json({ error: err });
    }
};

exports.deleteReturnLabelsForUser = async (req, res) => {
    const { userId } = req.params;
    const orderId = null;
    try {
        await ReturnLabel.deleteMany({ userId, orderId });
        return res.status(204).end();
    } catch (err) {
        console.error(err);
        return res.status(404).json(err);
    }
};

exports.file = async (req, res) => {
    const { attachment, labelType, description, userId } = req.body;
    const fileBuffer = req.file?.buffer ?? undefined;
    try {
        const returnLabel = new ReturnLabel({
            attachment,
            labelType,
            description,
            userId,
            image: fileBuffer,
        });

        await returnLabel.save();

        res.status(201).json(returnLabel);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

/*
exports.uploadFile = async (req, res) => {

  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../uploads/${req.file.originalname}`);

  if (['.png', '.jpg', '.jpeg'].includes(path.extname(req.file.originalname).toLowerCase())) {
    if (req.body.labelType === 'Physical') {
      physicalLabel(targetPath);
    } else if (req.body.labelType === 'Digital') {
      digitalLabel(targetPath);
    } else if (req.body.labelType === 'Amazon') {
      amazonLabel(targetPath);
    }
    fs.readFile(tempPath, async (err, data) => {
  if(err) {
    console.error(err.message);
    return res.status(500).end("There was an error.");
  }
  zlib.gzip(data, async (err, compressedData) => {
    if  (err) {
      console.error(err.message);
      return res.status(500).end('There was an error:', err);
    }
    const newImage = new Image({
      name: req.file.originalname,
      image: {
        data: compressedData, // This stores the new compressed data.
        contentType: req.file.mimetype
      }
    });
    try {
      await newImage.save();
      fs.unlink(tempPath, err => {
        if (err) console.error(err.message);
      });
      res.status(200).end('File uploaded and saved to database successfully!');
    } catch (error) {
      console.error(error.message);
      res.status(500).end('Server error');
      }
    })
  })
}};
*/
