// 云存储配置示例 - 可选方案
const AWS = require('aws-sdk');

// AWS S3配置
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// 上传文件到S3
const uploadToS3 = async (file, filename) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploads/${filename}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
};

// 从S3删除文件
const deleteFromS3 = async (filename) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploads/${filename}`
  };
  
  await s3.deleteObject(params).promise();
};

module.exports = { uploadToS3, deleteFromS3 };

