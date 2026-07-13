import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

// S3Client Mocking
const mockSend = vi.fn();
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: vi.fn(),
  };
});

describe('Lambda Unit Test', () => {
  beforeEach(() => {
    mockSend.mockClear();
    process.env.BUCKET_NAME = 'test-pipeline-bucket';
  });

  it('바디 데이터를 받아 정상적으로 S3 업로드를 완료하고 201 코드를 리턴해야 함', async () => {
    mockSend.mockResolvedValue({});

    const { handler } = await import('../src/handlers/hello.js');

    const mockEvent = {
      body: JSON.stringify({
        key: 'custom-file.json',
        content: 'Lambda unit test content',
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.bucket).toBe('test-pipeline-bucket');
    expect(body.key).toBe('custom-file.json');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('BUCKET_NAME 환경변수가 없을 시 500에러를 반환해야 함', async () => {
    process.env.BUCKET_NAME = undefined;
    const { handler } = await import('../src/handlers/hello.js');

    const result = await handler({} as APIGatewayProxyEvent);
    expect(result.statusCode).toBe(500);
    expect(result.body).toContain('BUCKET_NAME');
  });
});
