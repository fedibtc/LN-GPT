import { satsForTokens, tokensForSats } from "@/lib/sats";
import { getBalance } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { openai } from "./openai";

export async function POST(req: Request) {
  try {
    const bal = await getBalance();
    const { messages, conversationId } = await req.json();

    if (!bal) {
      throw new Error("No balance found");
    }

    if (typeof conversationId !== "number") {
      throw new Error("Invalid Conversation ID");
    }

    if (!Array.isArray(messages)) {
      throw new Error("Messages must be an array");
    }

    if (messages.length < 1) {
      throw new Error("No messages provided");
    }

    if (bal.balance.balance < 1) {
      throw new Error("Insufficient balance");
    }

    let completionTokens =
      tokensForSats(bal.balance.balance) - messages.at(-1).length;

    if (completionTokens <= 0) {
      throw new Error("Insufficient balance");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      stream: true,
      messages,
      max_tokens: completionTokens,
    });

    const last = messages.at(-1);

    let tokens = 0;

    const stream = OpenAIStream(response, {
      async onFinal(completion) {
        await prisma.message.createMany({
          data: [
            {
              content: last.content,
              role: "USER",
              conversationID: conversationId,
            },
            {
              content: completion,
              role: "SYSTEM",
              conversationID: conversationId,
            },
          ],
        });

        await prisma.balance.update({
          where: {
            id: bal.balance.id,
          },
          data: {
            balance: Math.max(bal.balance.balance - satsForTokens(tokens), 0),
          },
        });
      },
      onToken: () => {
        tokens++;
      },
    });

    return new StreamingTextResponse(stream);
  } catch (err) {
    return new Response((err as Error).message);
  }
}
