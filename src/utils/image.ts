import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function deleteFromS3(filename: string) {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_BUCKET_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY as string;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;
  const distributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;

  const s3 = new S3Client({
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    region: region,
  });

  const cloudfront = new CloudFrontClient({
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    region: region,
  });

  const params = {
    Bucket: bucketName,
    Key: filename,
  };

  const invalidationParams = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: filename,
      Paths: {
        Quantity: 1,
        Items: ["/" + filename],
      },
    },
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    const invalidationCommand = new CreateInvalidationCommand(
      invalidationParams
    );
    await cloudfront.send(invalidationCommand);

    return { message: "File deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting from S3");
  }
}
