import { describe, it, expect, beforeAll } from 'vitest';
import { APIGatewayClient, GetRestApisCommand } from '@aws-sdk/client-api-gateway';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const LOCALSTACK_URL = 'http://localhost:4566';
const REGION = 'us-east-1';

describe('LocalStack Serverless Integration Test', () => {
  let apiEndpoint = '';
  let s3Client: S3Client;

  beforeAll(async () => {
    s3Client = new S3Client({
      endpoint: LOCALSTACK_URL,
      forcePathStyle: true,
      region: REGION,
    });

    const apiGatewayClient = new APIGatewayClient({
      endpoint: LOCALSTACK_URL,
      region: REGION,
    });

    try {
      // 1. 배포된 가상 API Gateway의 ID 조회
      const res = await apiGatewayClient.send(new GetRestApisCommand({}));
      const api = res.items?.[0];
      if (!api || !api.id) {
        throw new Error('LocalStack에 배포된 API Gateway를 찾을 수 없습니다. 배포 여부를 확인하세요.');
      }

      // LocalStack API Gateway URL 조립
      apiEndpoint = `${LOCALSTACK_URL}/restapis/${api.id}/local/_user_request_/items`;
      console.log(`[IntegrationTest] 탐지된 API Gateway 엔드포인트: ${apiEndpoint}`);
    } catch (err) {
      console.warn('⚠️ LocalStack 가상 환경 API Gateway 감지 실패. 통합 테스트는 생략되거나 로컬 mock으로만 구동될 수 있습니다.', err);
    }
  });

  it('통합 E2E: API Gateway로 POST 요청을 보내면 Lambda가 실행되어 S3에 파일이 들어와야 함', async () => {
    if (!apiEndpoint) {
      console.log('Skipping integration test (LocalStack offline or deployment missing)');
      return;
    }

    const testKey = `integration-test-${Date.now()}.json`;
    const testContent = 'LocalStack E2E pipeline integration testing contents';

    // 2. 가상 API Gateway 호출
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: testKey,
        content: testContent,
      }),
    });

    expect(response.status).toBe(201);
    const body = await response.json() as { key: string; bucket: string };
    expect(body.key).toBe(testKey);

    // 3. S3 버킷에 실제로 오브젝트가 생성되었는지 교차 검증
    const s3Result = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: body.bucket,
      })
    );

    const uploadedFile = s3Result.Contents?.find((c) => c.Key === testKey);
    expect(uploadedFile).toBeDefined();
    console.log(`[IntegrationTest] S3 업로드 검증 완료: ${uploadedFile?.Key}`);
  });
});
