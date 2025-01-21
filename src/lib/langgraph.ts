import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxClient from "@wxflows/sdk/langchain";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { SYSTEM_MESSAGE } from "./constant";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const toolClient = new wxClient({
  apikey: process.env.WX_API_KEY,
  endpoint: process.env.WX_ENDPOINT!,
});

const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

const initializeModel = () => {
  const AImodel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
    maxOutputTokens: 4096,
    streaming: true,
    // cache: true,
    callbacks: [
      {
        handleLLMStart: async () => {
          console.log("LLM started");
        },
        handleLLMNewToken: async (token) => {
          console.log("New token:", token); // Add token logging
        },
        handleLLMEnd: async (output) => {
          console.log("LLM ended", output);
          const usage = output.llmOutput?.usage;
          if (usage) {
            console.log("Usage:", usage);
          }
        },
        handleLLMError: async (error) => {
          console.error("LLM error:", error); // Add error logging
        },
      },
    ],
  }).bindTools(tools);
  return AImodel;
};

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent";
  }

  return END;
}

const createWorkflow = async () => {
  const model = initializeModel();
  const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      const systemContent = SYSTEM_MESSAGE;

      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_controls: { type: "ephemeral" },
        }),
        new MessagesPlaceholder("messages"),
      ]);

      const trimmedMessages = await trimmer.invoke(state.messages);

      const prompt = await promptTemplate.invoke({ messages: trimmedMessages });

      const response = await model.invoke(prompt);

      return { messages: [response] };
    })
    .addEdge(START, "agent")
    .addNode("tools", toolNode)
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return stateGraph;
};

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
    if(!messages.length) return messages

    const cachedMessages = [...messages]

    const addCache = (messages: BaseMessage) => {
        messages.content = [
            {
                type: "text",
                text: messages.content,
                cache_control: {type: "ephemeral"}
            }
        ]
    }

    addCache(cachedMessages.at(-1)!)

    let humanCount = 0;
    for (let i = cachedMessages.length - 1; i >= 0; i--) {
        if (cachedMessages[i] instanceof HumanMessage) {
            humanCount++
            if(humanCount ===2){
                addCache(cachedMessages[i])
                break
            }
        } 
    }

    return cachedMessages
}

export async function submitQuestion(messages: BaseMessage[], chatId: string){

    const cachedMessages = addCachingHeaders(messages)

    const workflow = createWorkflow()
    const checkpointer = new MemorySaver()

    const app = (await workflow).compile({checkpointer})

    console.log('messages', messages)

    const stream =  app.streamEvents({messages}, {
        version: "v2",
        configurable: {
            thread_id: chatId
        },
        streamMode: 'messages',
        runId: chatId
    })

    return stream
}