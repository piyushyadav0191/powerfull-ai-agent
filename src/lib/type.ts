import { Id } from "../../convex/_generated/dataModel";

export type MessageRole = "user" | "assistant"

export interface Message {
    role: MessageRole
    content : string
}

export interface ChatRequestBody {
    messages: Message[];
    newMessage: string;
    chatId: Id<"chats">;
}

export enum StreamMessageType {
    Token = "token",
    Error = "error",
    Connected = "connected",
    Done = "done",
    ToolStart = "tool_start",
    ToolEnd = "tool_end"
}

export interface BaseStreaMessage {
    type: StreamMessageType
}

export interface TokenMessage extends BaseStreaMessage {
    type: StreamMessageType.Token
    token: string
}

export interface ErrorMessage extends BaseStreaMessage {
    type: StreamMessageType.Error
    error: string
}

export interface ConnectedMessage extends BaseStreaMessage {
    type: StreamMessageType.Connected
}

export interface DoneMessage extends BaseStreaMessage {
    type: StreamMessageType.Done
}

export interface ToolStartMessage extends BaseStreaMessage {
    type: StreamMessageType.ToolStart
    tool: string
    input: unknown
}

export interface ToolEndMessage extends BaseStreaMessage {
    type: StreamMessageType.ToolEnd
    tool: string
    output: unknown
}

export type StreamMessage = 
| TokenMessage
|ErrorMessage
| ConnectedMessage
| DoneMessage
|ToolStartMessage
| ToolEndMessage