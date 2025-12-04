#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MCP 서버 생성
const server = new Server(
  {
    name: "guide-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// 가이드 디렉토리 경로 설정
// npm 패키지로 설치된 환경에서 guides 디렉토리 경로
const guideDir = path.resolve(__dirname, "../guides");

// 가이드 파일 목록 가져오기
function getGuideFiles() {
  if (!fs.existsSync(guideDir)) {
    fs.mkdirSync(guideDir, { recursive: true });
    return [];
  }
  return fs
    .readdirSync(guideDir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".txt"));
}

// 리소스 목록 제공
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const guides = getGuideFiles();
  return {
    resources: guides.map((file) => ({
      uri: `guide://${file}`,
      name: path.basename(file, path.extname(file)),
      description: `가이드 문서: ${file}`,
      mimeType: "text/markdown",
    })),
  };
});

// 리소스 읽기
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const fileName = request.params.uri.replace("guide://", "");
  const filePath = path.join(guideDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`가이드 파일을 찾을 수 없습니다: ${fileName}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "text/markdown",
        text: content,
      },
    ],
  };
});

// 도구 목록 제공
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_guide",
        description: "가이드 문서의 내용을 읽어서 반환합니다.",
        inputSchema: {
          type: "object",
          properties: {
            fileName: {
              type: "string",
              description: "읽을 가이드 파일명 (예: clean-code-guide.md)",
            },
          },
          required: ["fileName"],
        },
      },
      {
        name: "read_file",
        description: "외부 프로젝트의 파일을 읽어서 반환합니다. 절대 경로 또는 현재 작업 디렉토리 기준 상대 경로를 사용할 수 있습니다.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "읽을 파일 경로 (예: ./src/utils.js 또는 C:/project/src/utils.js)",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "check_clean_code",
        description: "클린 코드 가이드를 기반으로 파일을 검사합니다. 가이드 문서를 참조하여 코드 품질을 분석합니다.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "검사할 파일 경로 (예: ./src/utils.js)",
            },
            guideName: {
              type: "string",
              description: "사용할 가이드 파일명 (기본값: clean-code-guide.md)",
              default: "clean-code-guide.md",
            },
          },
          required: ["filePath"],
        },
      },
    ],
  };
});



// 도구 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_guide") {
    const filePath = path.join(guideDir, args.fileName);

    if (!fs.existsSync(filePath)) {
      return {
        content: [
          {
            type: "text",
            text: `가이드 파일을 찾을 수 없습니다: ${args.fileName}\n\n사용 가능한 파일: ${getGuideFiles().join(", ")}`,
          },
        ],
        isError: true,
      };
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: `# ${args.fileName}\n\n${content}`,
        },
      ],
    };
  }

  if (name === "read_file") {
    try {
      // 절대 경로인지 확인
      const filePath = path.isAbsolute(args.filePath)
        ? args.filePath
        : path.resolve(process.cwd(), args.filePath);

      if (!fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: `파일을 찾을 수 없습니다: ${args.filePath}\n\n절대 경로: ${filePath}`,
            },
          ],
          isError: true,
        };
      }

      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return {
          content: [
            {
              type: "text",
              text: `경로가 파일이 아닙니다: ${args.filePath}`,
            },
          ],
          isError: true,
        };
      }

      const content = fs.readFileSync(filePath, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: `# 파일: ${args.filePath}\n\n\`\`\`\n${content}\n\`\`\``,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `파일 읽기 오류: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === "check_clean_code") {
    try {
      // 1. 가이드 문서 읽기
      const guideName = args.guideName || "clean-code-guide.md";
      const guidePath = path.join(guideDir, guideName);

      if (!fs.existsSync(guidePath)) {
        return {
          content: [
            {
              type: "text",
              text: `가이드 파일을 찾을 수 없습니다: ${guideName}\n\n사용 가능한 파일: ${getGuideFiles().join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      const guideContent = fs.readFileSync(guidePath, "utf-8");

      // 2. 검사할 파일 읽기
      const filePath = path.isAbsolute(args.filePath)
        ? args.filePath
        : path.resolve(process.cwd(), args.filePath);

      if (!fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: `검사할 파일을 찾을 수 없습니다: ${args.filePath}`,
            },
          ],
          isError: true,
        };
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");

      // 3. 가이드와 파일 내용을 함께 반환 (AI가 분석하도록)
      return {
        content: [
          {
            type: "text",
            text: `# 클린 코드 검사 결과\n\n## 검사 대상 파일\n\`\`\`\n${fileContent}\n\`\`\`\n\n## 클린 코드 가이드\n\n${guideContent}\n\n---\n\n위 가이드를 참조하여 코드를 분석하고 개선 사항을 제안해주세요.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `클린 코드 검사 오류: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `알 수 없는 도구: ${name}`,
      },
    ],
    isError: true,
  };
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP 가이드 서버가 시작되었습니다.");
}

main().catch(console.error);
