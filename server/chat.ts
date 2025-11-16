import OpenAI from "openai";
import { availableTools, toolDefinitions } from "./tools";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runConversation = async (userMessage: string) => {
  const messages: any[] = [
    {
      role: "system",
      content: "You are a helpful research assistant. When users ask about authors, first search for them, then get their works. When users ask about a specific paper or book, search for the work by title first. If they want citations, use the work ID to fetch citing papers."
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  // Initial call to OpenAI with tools
  let response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: toolDefinitions,
    tool_choice: "auto"
  });

  // Keep looping while OpenAI wants to call tools
  while (response.choices[0]?.finish_reason === "tool_calls") {
    const toolCalls = response.choices[0]?.message?.tool_calls;

    if (!toolCalls) break;

    // Add assistant's response to conversation
    messages.push(response.choices[0].message);

    // Execute each tool call
    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") continue;

      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log(`🔧 Calling ${functionName} with:`, functionArgs);

      // Call the actual function
      const functionToCall = availableTools[functionName];
      if (!functionToCall) {
        console.error(`❌ Function ${functionName} not found`);
        continue;
      }

      const functionResponse = await functionToCall(...Object.values(functionArgs));

      console.log(`✅ Result:`, functionResponse);

      // Send result back to OpenAI
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(functionResponse)
      });
    }

    // Get next response from OpenAI
    response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: toolDefinitions
    });
  }

  // Return final answer
  return response.choices[0]?.message?.content || "No response";
};
