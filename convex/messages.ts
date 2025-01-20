import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SHOW_COMMENTS = true;

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();

    // if(SHOW_COMMENTS) {
    //   console.log("Retreived messages", {
    //     chatId: args.chatId,
    //     count: messages.length
    //   })
    // }
    return messages;
  },
});

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // if(SHOW_COMMENTS) {
    //     console.log("Sending message", {
    //         chatId: args.chatId,
    //         content: args.content,
    //     });
    // }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "user",
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const store = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    // if(SHOW_COMMENTS) {
    //     console.log("Sending message", {
    //         chatId: args.chatId,
    //         content: args.content,
    //     });
    // }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n").replace(/\\/g, "\\\\"),
      role: args.role,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getLastMessage = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const indetity = await ctx.auth.getUserIdentity();
    if (!indetity) {
      throw new Error("User not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== indetity.subject) {
      throw new Error("Chat not found");
    }

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    return lastMessage;
  },
});
