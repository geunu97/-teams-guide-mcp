# teams-guide-mcp

클린 코드 가이드 문서를 제공하고 외부 프로젝트의 코드를 검사할 수 있는 MCP(Model Context Protocol) 서버입니다.

## ✨ 주요 기능

- 📚 **가이드 문서 제공**: 클린 코드 작성 가이드 등 다양한 가이드 문서 읽기
- 📖 **외부 파일 읽기**: 외부 프로젝트의 파일을 읽어서 분석 가능
- 🔍 **클린 코드 검사**: 가이드를 기반으로 코드 품질 검사 및 개선 제안

## 🚀 빠른 시작

### 1. 설치

npm 패키지로 설치되어 있다면 바로 사용할 수 있습니다.

### 2. MCP 클라이언트 설정

**Cursor/Claude Desktop 설정 예시:**

```json
{
  "mcpServers": {
    "guide-mcp": {
      "command": "npx",
      "args": ["-y", "teams-guide-mcp"]
    }
  }
}
```

설정 후 MCP 클라이언트를 재시작하세요.

## 🛠️ 사용 가능한 도구

### `get_guide`

가이드 문서의 내용을 읽어서 반환합니다.

**매개변수:**

- `fileName` (필수): 읽을 가이드 파일명 (예: `clean-code-guide.md`)

**사용 예시:**

```
"clean-code-guide.md 가이드를 읽어줘"
```

### `read_file`

외부 프로젝트의 파일을 읽어서 반환합니다.

**매개변수:**

- `filePath` (필수): 읽을 파일 경로 (상대 경로 또는 절대 경로)

**사용 예시:**

```
"read_file 도구로 ./src/utils.js 파일을 읽어줘"
```

### `check_clean_code`

클린 코드 가이드를 기반으로 파일을 검사합니다.

**매개변수:**

- `filePath` (필수): 검사할 파일 경로
- `guideName` (선택): 사용할 가이드 파일명 (기본값: `clean-code-guide.md`)

**사용 예시:**

```
"check_clean_code로 ./src/index.js 파일을 클린 코드 가이드로 검사해줘"
```

## 📚 사용 가능한 리소스

MCP 클라이언트에서 `guide://파일명` 형태로 가이드 문서에 직접 접근할 수 있습니다.

예: `guide://clean-code-guide.md`

## 💡 사용 시나리오

### 시나리오 1: 클린 코드 가이드 읽기

```
"클린 코드 가이드의 네이밍 규칙을 알려줘"
```

### 시나리오 2: 외부 파일 읽기

```
"read_file로 ./src/utils.js를 읽어줘"
```

### 시나리오 3: 클린 코드 검사

```
"check_clean_code로 ./src/index.js를 검사하고 개선 사항을 제안해줘"
```

## 📁 프로젝트 구조

```
teams-guide-mcp/
├── src/
│   └── index.js          # MCP 서버 메인 코드
├── guides/
│   └── clean-code-guide.md   # 클린 코드 가이드 문서
└── package.json
```

## 🔧 개발자용

### 가이드 문서 추가

`guides/` 디렉토리에 `.md` 또는 `.txt` 파일을 추가하면 자동으로 인식됩니다.

### 버전 관리 및 배포

이 프로젝트는 GitHub Actions를 사용하여 자동 배포를 지원합니다.

#### 자동 배포 설정

태그가 `v*.*.*` 형식으로 푸시되면 자동으로:

- `package.json` 버전 업데이트
- npm에 패키지 배포
- GitHub Release 생성

## 📋 요구사항

- Node.js v20.18.0 이상
- npm

## 📄 라이선스

MIT
