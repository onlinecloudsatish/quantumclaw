# Vercel AI SDK

description: Vercel AI SDK — streaming responses, tool calls, and multi-model support

## When to use
- Building AI-powered React apps
- Need streaming responses
- Tool calling with LLMs

## Key Concepts
- useChat: Chat UI hook
- useCompletion: Simple completion
- AIStream: Response streaming
- generateText: Direct LLM calls

## Common Patterns
\`\`\`typescript
import { useChat } from "ai/react";

const { messages, input, handleInputChange, handleSubmit } = useChat();

<form onSubmit={handleSubmit}>
  <input value={input} onChange={handleInputChange} />
</form>
\`\`\`
