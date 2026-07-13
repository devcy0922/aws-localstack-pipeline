# Local AWS Serverless Pipeline デモ (CI/CD)

> LocalStack, Serverless Framework, GitHub Actions를 사용하여 AWS 요금 허들 없이 완전 자동화된 Lambda 배포 및 통합 테스트 샌드박스를 구축한 포트폴리오 프로젝트입니다.

---

## 🌟 프로젝트 배경 및 목적
개인 프로젝트나 포트폴리오를 만들 때 AWS 계정 비용 문제나 보안 자격 증명 유출 리스크는 큰 장애물입니다.  
본 프로젝트는 **"AWS 계정 없이 로컬 환경 및 CI/CD 워크플로우 내에서 실제 AWS의 동작 방식을 100% 동일하게 재현하고 검증할 수 있는가?"**에 대한 모범 설계안입니다.

이를 통해 비용 0원으로 클라우드 인프라 설계(IaC), CI/CD 자동 배포, 그리고 통합 테스트까지의 풀사이클 클라우드 개발 역량을 증명합니다.

---

## 🏗️ 아키텍처 및 파이프라인 흐름

```
[PR 생성 / 커밋 Push]
       │
       ▼
[GitHub Actions Runner (CI)]
       │
       ├─▶ 1. 코드 린트 & 포맷 검증 (Biome)
       ├─▶ 2. LocalStack Docker 컨테이너 실행 (S3, Lambda, API Gateway 가상화)
       ├─▶ 3. Serverless Framework로 LocalStack에 Lambda & API Gateway 배포 (IaC)
       ├─▶ 4. 가상 API Gateway Endpoint에 HTTP 요청을 쏘는 통합 테스트 수행
       └─▶ 5. 최종 가상 AWS 리소스 정리 및 검증 통과
```

---

## 🚀 핵심 기술적 차별성 (Wow Factors)

### 1. 비용 0원으로 증명하는 클라우드 인프라 설계 능력 (LocalStack)
* LocalStack을 GitHub Actions 내 Docker 컨테이너로 띄워 **S3, Lambda, API Gateway, IAM** 가상 엔드포인트를 구축했습니다.
* 실제 AWS 인프라 리소스 비용 발생 없이 로컬/CI 내부에서 격리된 클라우드 통합 테스트 샌드박스를 구현했습니다.

### 2. 가상 API Gateway & S3 연동 통합 테스트 (Vitest)
* 단순 코드 빌드 확인을 넘어, API Gateway 엔드포인트로 JSON 페이로드를 전달하면 Lambda가 동작하여 S3 버킷에 실제 오브젝트가 기록되는지 SDK 리스트 조회를 통해 교차 검증하는 통합 E2E 테스트를 자동화했습니다.

### 3. 유연한 인프라 우회 설계 (AWS SDK v3)
* 소스 코드 내부에서 `AWS_ENDPOINT_URL` 환경 변수 유무에 따라, 로컬 에뮬레이터(LocalStack)와 AWS 실제 서비스 환경을 유연하게 스위칭할 수 있도록 클라이언트 생성 로직을 최적화했습니다.

---

## 📁 주요 구성 파일 링크

* [serverless.yml](file:///path/to/project/srv/aws-localstack-pipeline/serverless.yml): LocalStack 플러그인을 활용한 AWS 리소스 IaC 구성
* [hello.ts](file:///path/to/project/srv/aws-localstack-pipeline/src/handlers/hello.ts): S3 SDK 연동 비즈니스 로직을 지닌 Lambda 핸들러
* [deploy-test.yml](file:///path/to/project/srv/aws-localstack-pipeline/.github/workflows/deploy-test.yml): LocalStack 헬스체크 루프 및 통합 테스트를 자동화한 CI 워크플로우
* [integration.test.ts](file:///path/to/project/srv/aws-localstack-pipeline/tests/integration.test.ts): 가상 리소스 상대로 E2E 연동성을 검증하는 통합 테스트

---

## 💻 로컬 구동 방법

### 1. 패키지 설치
```bash
pnpm install
```

### 2. LocalStack (Docker) 실행
```bash
docker compose up -d localstack
```

### 3. LocalStack에 가상 AWS 인프라 배포 (Serverless Deploy)
```bash
pnpm run deploy:local
```

### 4. 통합 테스트 수행
```bash
pnpm run test:integration
```

---
> **Developer:** yooncy (devcy0922)
> **License:** MIT
