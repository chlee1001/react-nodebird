const AWS = require('aws-sdk');
const Sharp = require('sharp');

const S3 = new AWS.S3({ region: 'ap-northeast-2' });
exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1];

  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext; // sharp에서는 jpg 대신 jpeg사용합니다
  try {
    const s3Object = await S3.getObject({ // S3에서 이미지를 받아 옵니다.
      Bucket,
      Key: filename,
    }).promise();
    const resizedImage = await Sharp(s3Object.Body)
      .resize(800, 800)
      .toFormat(requiredFormat)
      .toBuffer();
    await S3.putObject({
      Body: resizedImage,
      Bucket,
      Key: `thumb/${filename}`,
    });
    return callback(null, `thumb/${filename}`);
  } catch (error) {
    console.error(error);
    return callback(error);
  }
};
