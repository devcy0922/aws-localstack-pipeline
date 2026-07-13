import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// LocalStack 우회용 엔드포인트 환경변수 체크
const endpoint = process.env.AWS_ENDPOINT_URL || undefined;
const s3Client = new S3Client({
  endpoint,
  forcePathStyle: !!endpoint, // LocalStack 환경에서는 path-style 필수
  region: process.env.AWS_REGION || 'us-east-1',
});

/**
 * API Gateway 요청 수신 시 JSON 바디를 파싱하여 S3 버킷에 객체로 저장하는 Lambda 핸들러
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'BUCKET_NAME 환경변수가 설정되지 않았습니다.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const key = body.key || `upload-${Date.now()}.json`;
    const content = body.content || 'Default sample content';

    // S3 업로드 명령 실행
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify({ content, timestamp: new Date().toISOString() }),
        ContentType: 'application/json',
      })
    );

    console.log(`[Lambda] S3 업로드 완료: s3://${bucketName}/${key}`);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: '성공적으로 S3 버킷에 파일이 저장되었습니다.',
        bucket: bucketName,
        key,
      }),
    };
  } catch (error) {
    console.error('[Lambda] 에러 발생:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Lambda 실행 도중 에러가 발생했습니다.',
        details: String(error),
      }),
    };
  }
}
