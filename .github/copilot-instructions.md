# NN Insurance MCP Server - Project Setup Instructions

This file documents the setup and development of the NN Insurance MCP (Model Context Protocol) server project.

## Project Overview

- **Project Type**: MCP (Model Context Protocol) Server
- **Language**: TypeScript
- **Purpose**: Browse NN Insurance website and offer RGF car insurance policies through questionnaire-based recommendations
- **Target URL**: https://myinsurancepolicy.be/rgf/car/fr
- **Framework**: Model Context Protocol SDK

## Project Features

### Current Capabilities

1. **Web Browsing Tools**
   - `browse_page`: Fetch content from the insurance policy page
   - `extract_text`: Extract plain text content
   - `get_page_metadata`: Get page metadata, title, description, and links

2. **Policy Information**
   - `get_rgf_policy_info`: Retrieve detailed RGF policy features and benefits from website

3. **User Questionnaire & Recommendations**
   - `get_policy_questionnaire`: Structured questionnaire for understanding user needs
   - `recommend_policy`: AI-powered policy recommendation based on user profile

### Recommendation Engine

The `recommend_policy` tool provides:
- Risk assessment based on driver profile
- Tailored coverage recommendations
- Estimated premium calculation
- Personalized benefits highlights

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Run the Server**
   ```bash
   npm start
   ```

### Development Workflow

For continuous development with watch mode:
```bash
npm run watch
```

## Project Structure

```
.
├── src/
│   └── index.ts                # Main MCP server implementation
│       ├── Tool definitions    # All MCP tools
│       ├── Web browsing        # browse_page, extract_text, get_page_metadata
│       ├── Policy info         # getRGFPolicyInfo()
│       ├── Questionnaire       # getPolicyQuestionnaire()
│       ├── Recommendation      # recommendPolicy() and premium calculation
│
├── dist/                       # Compiled JavaScript (generated)
├── .vscode/
│   └── mcp.json               # MCP server configuration for VS Code
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## MCP Tools Available

### Browsing Tools
1. **browse_page** - Fetch content from the insurance policy page
2. **extract_text** - Extract plain text content
3. **get_page_metadata** - Get page metadata and links

### Policy Tools
4. **get_rgf_policy_info** - Get RGF policy details from the website
5. **get_policy_questionnaire** - Get structured questionnaire for users
6. **recommend_policy** - Generate personalized policy recommendations

## Key Technologies

- **@modelcontextprotocol/sdk**: Official MCP SDK for TypeScript
- **axios**: HTTP client for web requests
- **cheerio**: HTML parsing library for data extraction
- **TypeScript**: Type-safe language for development

## Architecture

The server follows the MCP specification:
- Communicates via stdio with MCP clients
- Exposes stateless tools that can be called by AI applications
- Handles HTTP requests to the target insurance website
- Parses HTML and extracts relevant information
- Generates personalized recommendations based on user input

## Debugging

The MCP server runs on stdio and can be debugged in VS Code:
- Server configuration: `.vscode/mcp.json`
- Debug: Start server with `npm start`
- Logs are output to stderr for debugging

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Target Insurance Website](https://myinsurancepolicy.be/rgf/car/fr)

## Status

Project setup complete. MCP server with policy recommendation engine ready for testing and deployment.

## Next Steps (Optional Enhancements)

- Add caching for policy information to reduce page requests
- Implement multi-language support (French, Dutch, English)
- Add more detailed coverage options based on Belgian insurance regulations  
- Integrate with actual policy quote database for real premium calculations
- Add validation for user input in questionnaire

