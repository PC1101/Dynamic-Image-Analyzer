import { readFile, writeFile } from "fs/promises";
import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });
// Use this pre-prompt to customize what you want GPT4-Vision todo
const PRE_PROMPT = `What is in this image?`;
const MODEL = process.env.MODEL || "gpt-4-vision-preview";
const COMPLETIONS_ENDPOINT = process.env.COMPLETIONS_ENDPOINT || "https://api.openai.com/v1/chat/completions";
const SAVED_DATA = "./public/data.json";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

//Facebook Messenger whitelists this localhost port so is the only one you can currently use
const PORT = 3103;

const CORS_HEADERS = {
  headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
  },
};

const server = Bun.serve({
  port: PORT,
  fetch(request) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      const res = new Response("Departed", CORS_HEADERS);
      return res;
    }
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/api/gpt-4-vision":
        console.log("GPT4 Vision Request");
        return handleVisionRequest(request);
      case "/api/status":
        console.log("API Status Request");
        return new Response("Server Up!", { status: 200 });
      default:
        console.log("Not Found Request");
        return new Response("Not Found", { status: 404 });
    }
  },
});

async function handleVisionRequest(request: Request) {
  if (request.method !== "POST" || request.headers.get("Content-Type") !== "application/json") {
    console.log("Invalid request", request.method, request.headers.get("Content-Type"));
    return new Response("Invalid request", { status: 400 });
  }

  try {
    const { imageUrl } = await request.json() as { imageUrl: string };
    const responseContent = await analyzeImage(imageUrl);
    await saveData(imageUrl, responseContent);
    return new Response(JSON.stringify(responseContent), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function analyzeImage(imageUrl: string) {
  const token = process.env.OPENAI_API_KEY;
  if (!token) {
    throw new Error("OPENAI_API_KEY is not set or is empty.");
  }

  const body = {
    model: process.env.MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PRE_PROMPT },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    store: true,
  };

  console.log("Sending request to GPT4");
  const completionsEndpoint = process.env.COMPLETIONS_ENDPOINT;
  if (!completionsEndpoint) {
    throw new Error("COMPLETIONS_ENDPOINT is not set or is empty.");
  }
  const response = await fetch(completionsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log("Request Failed");
    throw new Error(`API request failed with status: ${response.status}`);
  }
  
  console.log("Request Successful");
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

// Pseudo database via a JSON file
async function saveData(imageUrl: string, description: string) {
  console.log("Saving data");
  const createdObject = { time: new Date().toISOString(), imageDescription: description, imageUrl };
  try {
    let data = [];
    try {
      console.log("Reading stored data");
      const storedData = await readFile(SAVED_DATA, "utf8");
      data = JSON.parse(storedData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
      console.log("Creating new data file.");
    }
    data.push(createdObject);
    console.log("Writing new data");
    await writeFile(SAVED_DATA, JSON.stringify(data));
  } catch (writeError) {
    throw new Error(`Failed to write to file: ${writeError}`);
  }
}

console.log(`Listening on localhost:${server.port}`);