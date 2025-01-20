import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ToolNode} from "@langchain/langgraph/prebuilt"
import wxClient from "@wxflows/sdk/langchain"

const toolClient = new wxClient({
    apikey: process.env.WX_API_KEY,
    endpoint: process.env.WX_ENDPOINT!,
})

const tools = await toolClient.lcTools
const toolNode = new ToolNode(tools)

const initializeModel = () => {
    const AImodel = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.7,
      maxOutputTokens: 4096,
      streaming: true,
      cache: true,
      callbacks: [
        {
            handleLLMStart: async () => {
                console.log("LLM started");
            },
            handleLLMEnd: async (output) => {
                console.log("LLM ended", output);
                const usage = output.llmOutput?.usage
                if (usage) {
                    console.log("Usage:", usage)
                }
            }
        }
      ]
    });
    return AImodel;
}