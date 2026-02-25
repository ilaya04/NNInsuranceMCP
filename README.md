# NN Insurance MCP Server

A Model Context Protocol (MCP) server for browsing and recommending NN Insurance RGF car insurance policies by asking users targeted questions.

## Overview

This MCP server provides tools to interact with NN Insurance, allowing AI applications to:
- Browse and extract information from the RGF car insurance policy page
- Guide users through a questionnaire to understand their insurance needs
- Provide personalized RGF car insurance policy recommendations

## Features

- **browse_page**: Fetch and extract content from the insurance policy page with optional HTML preview
- **extract_text**: Extract plain text content from the page
- **get_page_metadata**: Retrieve metadata including title, description, links, and headings
- **get_rgf_policy_info**: Get detailed information about RGF car insurance features and benefits
- **get_policy_questionnaire**: Retrieve a structured questionnaire for gathering user information
- **recommend_policy**: Provide personalized RGF car insurance recommendations based on user profile

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

## Development

For development with auto-compilation:
```bash
npm run watch
```

## Usage Example

### Typical workflow for recommending RGF policies:

1. **Start with policy information:**
   ```
   Call: get_rgf_policy_info()
   Returns: Details about RGF car insurance coverage and features
   ```

2. **Get questionnaire structure:**
   ```
   Call: get_policy_questionnaire()
   Returns: Structured questions to ask the user
   ```

3. **Collect user information:**
   - Ask each question from the questionnaire
   - Gather responses from the user

4. **Get personalized recommendation:**
   ```
   Call: recommend_policy({
     age: 35,
     driving_experience: 15,
     vehicle_type: "sedan",
     annual_mileage: 15000,
     driving_habits: "mixed",
     has_accidents: false,
     vehicle_value: 25000,
     budget_range: "€100-150"
   })
   Returns: Personalized recommendation with estimated premium and coverage options
   ```

5. **Browse policy details:**
   ```
   Call: browse_page() or extract_text()
   Returns: Full policy details from the website for further information
   ```

## Architecture

The server follows the Model Context Protocol specification and exposes web-browsing tools that can be called by MCP clients (such as Claude or other AI applications).

### Tools

### Tools

#### browse_page
Fetches content from the target URL with optional HTML inclusion.

**Parameters:**
- `include_html` (boolean, optional): Include raw HTML content in response (default: false)

#### extract_text
Extracts clean text content from the page, excluding scripts and styles.

#### get_page_metadata
Returns structured metadata about the page including:
- Page title and description
- OpenGraph meta tags
- All links on the page
- All headings on the page

#### get_rgf_policy_info
Retrieves detailed information about RGF car insurance policy features, benefits, and coverage types extracted from the website.

**Response includes:**
- Policy name and URL
- Coverage types and features
- Policy benefits
- Full policy details from the page

#### get_policy_questionnaire
Returns a structured questionnaire with the following questions:
- Driver's age
- Years of driving experience
- Vehicle type
- Annual mileage
- Driving habits (urban/highway/mixed)
- Accident history
- Vehicle value
- Budget range for insurance

**Response format:** A JSON object with each question including id, question text, type (number/select/boolean), and available options.

#### recommend_policy
Provides a personalized RGF car insurance recommendation based on user profile.

**Parameters:**
- `age` (number): Driver's age in years
- `driving_experience` (number): Years of driving experience
- `vehicle_type` (string): Type of vehicle (sedan, suv, van, sports car, etc.)
- `annual_mileage` (number): Estimated annual mileage in kilometers
- `driving_habits` (string): Driving habits (urban, highway, or mixed)
- `has_accidents` (boolean): Whether driver has had accidents in past 5 years
- `accident_count` (number, optional): Number of accidents
- `vehicle_value` (number): Vehicle value in euros
- `budget_range` (string): Monthly budget range (€50-100, €100-150, €150-200, €200+)

**Response includes:**
- Risk level assessment (Low/Medium/High)
- Recommended coverage types
- Estimated premium (monthly and annual)
- Key highlights and next steps

## Configuration

The target URL is configured as:
```
https://myinsurancepolicy.be/rgf/car/fr
```

To change the target URL, modify the `TARGET_URL` constant in `src/index.ts`.

## MCP Server Configuration

The `.vscode/mcp.json` file contains the server configuration for VS Code:

```json
{
  "servers": {
    "nn-insurance-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

## Debugging in VS Code

1. Build the project: `npm run build`
2. Start the server: `npm start`
3. The server will communicate via stdio with MCP clients

## Dependencies

- `@modelcontextprotocol/sdk`: Official MCP SDK for TypeScript
- `axios`: HTTP client for fetching web pages
- `cheerio`: jQuery-like library for parsing HTML

## License

MIT

## Support

For issues or questions about MCP, visit https://modelcontextprotocol.io/
