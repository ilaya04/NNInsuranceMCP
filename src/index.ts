#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  TextContent,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import cors from "cors";

const TARGET_URL = "https://myinsurancepolicy.be/rgf/car/fr";
const HTTP_PORT = 3000;

interface TextContentResult {
  type: "text";
  text: string;
}

interface ToolResult {
  type: "text" | "image";
  text?: string;
  data?: string;
  mimeType?: string;
}

interface UserProfile {
  age?: number;
  drivingExperience?: number;
  vehicleType?: string;
  annualMileage?: number;
  drivingHabits?: string;
  hasAccidents?: boolean;
  accidentCount?: number;
  vehicleValue?: number;
  budgetRange?: string;
}

// Tool definitions
const tools: Tool[] = [
  {
    name: "browse_page",
    description:
      "Fetches and extracts content from the NN Insurance policy page",
    inputSchema: {
      type: "object" as const,
      properties: {
        include_html: {
          type: "boolean",
          description:
            "Whether to include raw HTML content (default: false)",
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: "extract_text",
    description:
      "Extracts plain text content from the insurance policy page",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_page_metadata",
    description:
      "Retrieves metadata information like title, description, and links from the page",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_rgf_policy_info",
    description:
      "Retrieves detailed information about RGF car insurance policy features and benefits",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_policy_questionnaire",
    description:
      "Returns a structured questionnaire to gather user information for policy recommendations",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "recommend_policy",
    description:
      "Provides RGF car insurance policy recommendation based on user profile and needs",
    inputSchema: {
      type: "object" as const,
      properties: {
        age: {
          type: "number",
          description: "Driver's age in years",
        },
        driving_experience: {
          type: "number",
          description: "Years of driving experience",
        },
        vehicle_type: {
          type: "string",
          description: 'Type of vehicle (e.g., "sedan", "suv", "van")',
        },
        annual_mileage: {
          type: "number",
          description: "Estimated annual mileage in kilometers",
        },
        driving_habits: {
          type: "string",
          description:
            'Driving habits (e.g., "urban", "highway", "mixed")',
        },
        has_accidents: {
          type: "boolean",
          description: "Whether driver has had accidents in the past 5 years",
        },
        accident_count: {
          type: "number",
          description: "Number of accidents in the past 5 years",
        },
        vehicle_value: {
          type: "number",
          description: "Approximate vehicle value in euros",
        },
        budget_range: {
          type: "string",
          description:
            'Budget range for insurance (e.g., "€50-100", "€100-150", "€150+")',
        },
      },
      required: [],
    },
  },
];

const server = new Server({
  name: "nn-insurance-mcp",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// Tool implementations
async function browsePage(includeHtml: boolean = false): Promise<string> {
  const response = await axios.get(TARGET_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  // Extract main content
  const body = $("body");
  const mainContent = body.text().trim();

  if (includeHtml) {
    return JSON.stringify(
      {
        text_content: mainContent.substring(0, 5000), // Limit text content
        html_preview: response.data.substring(0, 3000),
      },
      null,
      2
    );
  }

  return mainContent.substring(0, 10000);
}

async function extractText(): Promise<string> {
  const response = await axios.get(TARGET_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  // Extract all meaningful text content
  const paragraphs: string[] = [];
  $("p, h1, h2, h3, h4, h5, h6, li, span, div").each((_, element) => {
    const text = $(element).text().trim();
    if (text && text.length > 0) {
      paragraphs.push(text);
    }
  });

  return paragraphs.join("\n\n");
}

async function getPageMetadata(): Promise<string> {
  const response = await axios.get(TARGET_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  const metadata = {
    url: TARGET_URL,
    title: $("title").text() || "No title found",
    description: $('meta[name="description"]').attr("content") || "No description",
    og_title: $('meta[property="og:title"]').attr("content"),
    og_description: $('meta[property="og:description"]').attr("content"),
    links: [] as string[],
    headings: [] as string[],
  };

  // Extract links
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      metadata.links.push(href);
    }
  });

  // Extract headings
  $("h1, h2, h3, h4, h5, h6").each((_, element) => {
    const text = $(element).text().trim();
    if (text) {
      metadata.headings.push(text);
    }
  });

  return JSON.stringify(metadata, null, 2);
}

async function getRGFPolicyInfo(): Promise<string> {
  const response = await axios.get(TARGET_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  // Extract policy information from the page
  const policyInfo = {
    policyName: "RGF Car Insurance",
    url: TARGET_URL,
    coverageTypes: [] as string[],
    features: [] as string[],
    benefits: [] as string[],
    fullDetails: "",
  };

  // Extract main content sections
  $("section, article, .content, .policy-details")
    .find("h2, h3, li, p")
    .each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 20) {
        const tagName = ($(element).prop("tagName") as string || "").toLowerCase();
        if (tagName === "h2" || tagName === "h3") {
          policyInfo.coverageTypes.push(text);
        } else if (tagName === "li") {
          policyInfo.features.push(text);
        }
      }
    });

  // Get all body text as full details
  policyInfo.fullDetails = $("body").text().trim().substring(0, 8000);

  return JSON.stringify(policyInfo, null, 2);
}

function getPolicyQuestionnaire(): string {
  const questionnaire = {
    title: "RGF Car Insurance Policy Questionnaire",
    description:
      "Please answer the following questions to help us find the best RGF car insurance policy for you",
    questions: [
      {
        id: "age",
        question: "What is your age?",
        type: "number",
        required: true,
        hint: "Enter your age in years",
      },
      {
        id: "driving_experience",
        question: "How many years of driving experience do you have?",
        type: "number",
        required: true,
        hint: "Enter years of experience",
      },
      {
        id: "vehicle_type",
        question: "What type of vehicle do you own?",
        type: "select",
        required: true,
        options: ["Sedan", "SUV", "Van", "Sports Car", "Other"],
      },
      {
        id: "annual_mileage",
        question: "What is your estimated annual mileage (in km)?",
        type: "number",
        required: true,
        hint: "Enter approximate annual kilometers",
      },
      {
        id: "driving_habits",
        question: "What are your typical driving habits?",
        type: "select",
        required: true,
        options: ["Urban (city driving)", "Highway (long distances)", "Mixed"],
      },
      {
        id: "has_accidents",
        question:
          "Have you had any accidents in the past 5 years?",
        type: "boolean",
        required: true,
      },
      {
        id: "accident_count",
        question: "If yes, how many accidents?",
        type: "number",
        required: false,
        hint: "Leave blank if no accidents",
      },
      {
        id: "vehicle_value",
        question: "What is the approximate value of your vehicle (in euros)?",
        type: "number",
        required: true,
        hint: "Approximate current market value",
      },
      {
        id: "budget_range",
        question: "What is your preferred monthly budget for insurance?",
        type: "select",
        required: true,
        options: ["€50-100", "€100-150", "€150-200", "€200+"],
      },
    ],
  };

  return JSON.stringify(questionnaire, null, 2);
}

function recommendPolicy(profile: UserProfile): string {
  // Score calculation based on user profile
  let riskScore = 0;
  let recommendedCoverages: string[] = [];

  // Age scoring
  if (profile.age) {
    if (profile.age < 25) riskScore += 3;
    else if (profile.age < 35) riskScore += 1;
    else if (profile.age > 70) riskScore += 2;
  }

  // Driving experience scoring
  if (profile.drivingExperience) {
    if (profile.drivingExperience < 2) riskScore += 2;
    else if (profile.drivingExperience < 5) riskScore += 1;
  }

  // Accident history scoring
  if (profile.hasAccidents) {
    riskScore += (profile.accidentCount || 1) * 2;
  }

  // Mileage scoring
  if (profile.annualMileage) {
    if (profile.annualMileage > 30000) riskScore += 1;
  }

  // Recommended coverages based on profile
  recommendedCoverages.push("Third-Party Liability (Mandatory)");

  if (riskScore >= 4) {
    recommendedCoverages.push("Comprehensive Coverage");
    recommendedCoverages.push("Collision Protection");
  }

  if (profile.vehicleValue && profile.vehicleValue > 20000) {
    recommendedCoverages.push("Full Coverage Package");
    recommendedCoverages.push("Roadside Assistance");
  }

  if (profile.annualMileage && profile.annualMileage > 20000) {
    recommendedCoverages.push("Breakdown Assistance");
  }

  if (profile.drivingHabits === "highway") {
    recommendedCoverages.push("Extended Coverage");
    recommendedCoverages.push("Legal Assistance");
  }

  // Build recommendation
  const recommendation = {
    profileSummary: {
      age: profile.age,
      experience: profile.drivingExperience,
      vehicleType: profile.vehicleType,
      riskLevel:
        riskScore <= 2
          ? "Low"
          : riskScore <= 4
            ? "Medium"
            : "High",
      riskScore: riskScore,
    },
    recommendation: {
      policyName: "RGF Car Insurance - Personalized",
      description:
        "Based on your profile, we recommend the following RGF car insurance coverage",
      recommendedCoverages: recommendedCoverages,
      estimatedPremium: calculateEstimatedPremium(profile, riskScore),
      highlights: [
        `Tailored for ${profile.vehicleType || "your vehicle"} owners`,
        `Suitable for ${profile.drivingHabits || "your"} driving habits`,
        `Comprehensive protection for your needs`,
        `24/7 customer support and assistance`,
      ],
    },
    nextSteps: [
      "Review the recommended coverages above",
      "Contact our team for a detailed quote",
      "Compare with other options if desired",
      "Complete your online application",
    ],
  };

  return JSON.stringify(recommendation, null, 2);
}

function calculateEstimatedPremium(profile: UserProfile, riskScore: number): string {
  let basePrice = 80;

  // Adjust based on risk score
  basePrice += riskScore * 15;

  // Adjust based on vehicle value
  if (profile.vehicleValue) {
    basePrice += profile.vehicleValue / 1000;
  }

  // Adjust based on mileage
  if (profile.annualMileage) {
    if (profile.annualMileage > 30000) basePrice += 20;
  }

  // Apply budget range multiplier
  if (profile.budgetRange === "€50-100") {
    basePrice = Math.min(basePrice, 100);
  } else if (profile.budgetRange === "€100-150") {
    basePrice = Math.min(basePrice, 150);
  }

  const estimatedMonthly = Math.round(basePrice);
  const estimatedAnnual = Math.round(basePrice * 12);

  return `€${estimatedMonthly}/month (approximately €${estimatedAnnual}/year)`;
}

// Setup request handlers
function setupRequestHandlers() {
  // Request handler for listing tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools,
    };
  });

  // Request handler for calling tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const toolInput = (request.params.arguments as Record<string, unknown>) || {};

    try {
      let result: string;

      switch (toolName) {
        case "browse_page":
          result = await browsePage((toolInput.include_html as boolean) || false);
          break;

        case "extract_text":
          result = await extractText();
          break;

        case "get_page_metadata":
          result = await getPageMetadata();
          break;

        case "get_rgf_policy_info":
          result = await getRGFPolicyInfo();
          break;

        case "get_policy_questionnaire":
          result = getPolicyQuestionnaire();
          break;

        case "recommend_policy": {
          const profile: UserProfile = {
            age: toolInput.age as number | undefined,
            drivingExperience: toolInput.driving_experience as number | undefined,
            vehicleType: toolInput.vehicle_type as string | undefined,
            annualMileage: toolInput.annual_mileage as number | undefined,
            drivingHabits: toolInput.driving_habits as string | undefined,
            hasAccidents: toolInput.has_accidents as boolean | undefined,
            accidentCount: toolInput.accident_count as number | undefined,
            vehicleValue: toolInput.vehicle_value as number | undefined,
            budgetRange: toolInput.budget_range as string | undefined,
          };
          result = recommendPolicy(profile);
          break;
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
      }

      return {
        content: [
          {
            type: "text",
            text: result,
          } as TextContent,
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
            isError: true,
          } as TextContent,
        ],
      };
    }
  });
}

// Setup HTTP server with Express
function setupHttpServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "NN Insurance MCP Server is running" });
  });

  // List all available tools
  app.get("/api/tools", (_req: Request, res: Response) => {
    res.json({ tools });
  });

  // Browse page endpoint
  app.post("/api/tools/browse_page", async (req: Request, res: Response) => {
    try {
      const includeHtml = req.body.include_html || false;
      const result = await browsePage(includeHtml);
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  // Extract text endpoint
  app.post("/api/tools/extract_text", async (_req: Request, res: Response) => {
    try {
      const result = await extractText();
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  // Get page metadata endpoint
  app.post("/api/tools/get_page_metadata", async (_req: Request, res: Response) => {
    try {
      const result = await getPageMetadata();
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  // Get RGF policy info endpoint
  app.post("/api/tools/get_rgf_policy_info", async (_req: Request, res: Response) => {
    try {
      const result = await getRGFPolicyInfo();
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  // Get policy questionnaire endpoint
  app.post("/api/tools/get_policy_questionnaire", (_req: Request, res: Response) => {
    try {
      const result = getPolicyQuestionnaire();
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  // Recommend policy endpoint
  app.post("/api/tools/recommend_policy", (req: Request, res: Response) => {
    try {
      const profile: UserProfile = {
        age: req.body.age,
        drivingExperience: req.body.driving_experience,
        vehicleType: req.body.vehicle_type,
        annualMileage: req.body.annual_mileage,
        drivingHabits: req.body.driving_habits,
        hasAccidents: req.body.has_accidents,
        accidentCount: req.body.accident_count,
        vehicleValue: req.body.vehicle_value,
        budgetRange: req.body.budget_range,
      };
      const result = recommendPolicy(profile);
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  // Generic tool caller endpoint
  app.post("/api/call", async (req: Request, res: Response) => {
    try {
      const { tool, args } = req.body;
      if (!tool) {
        res.status(400).json({ success: false, error: "Tool name is required" });
        return;
      }

      let result: string;
      switch (tool) {
        case "browse_page":
          result = await browsePage((args?.include_html as boolean) || false);
          break;
        case "extract_text":
          result = await extractText();
          break;
        case "get_page_metadata":
          result = await getPageMetadata();
          break;
        case "get_rgf_policy_info":
          result = await getRGFPolicyInfo();
          break;
        case "get_policy_questionnaire":
          result = getPolicyQuestionnaire();
          break;
        case "recommend_policy": {
          const profile: UserProfile = {
            age: args?.age,
            drivingExperience: args?.driving_experience,
            vehicleType: args?.vehicle_type,
            annualMileage: args?.annual_mileage,
            drivingHabits: args?.driving_habits,
            hasAccidents: args?.has_accidents,
            accidentCount: args?.accident_count,
            vehicleValue: args?.vehicle_value,
            budgetRange: args?.budget_range,
          };
          result = recommendPolicy(profile);
          break;
        }
        default:
          res.status(400).json({ success: false, error: `Unknown tool: ${tool}` });
          return;
      }

      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message });
    }
  });

  app.listen(HTTP_PORT, () => {
    console.error(`HTTP Server running on http://localhost:${HTTP_PORT}`);
    console.error(`API Endpoints available at http://localhost:${HTTP_PORT}/api/`);
  });

  return app;
}

// Start both HTTP and MCP servers
async function main() {
  // Start HTTP server
  setupHttpServer();

  // Optionally start MCP stdio server if in MCP mode
  if (process.env.MCP_MODE === "true") {
    const transport = new StdioServerTransport();
    setupRequestHandlers();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
  } else {
    console.error("HTTP Server is primary interface");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
