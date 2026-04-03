# LangChain Patterns

description: LangChain patterns for building LLM applications — chains, agents, memory, tools, and embeddings

## When to use
- Building LLM-powered applications
- Working with chains, agents, and tools
- Implementing memory and retrieval

## Key Concepts
- Chains: Sequential LLM calls
- Agents: Autonomous LLM with tools
- Memory: Conversation context
- Embeddings: Vector search

## Common Patterns
\`\`\`typescript
import { ChatOpenAI } from "langchain/chat_models";
import { ComposableChain } from "langchain/chains";
import { ConversationMemory } from "langchain/memory";

const chain = new ComposableChain({
  llm: new ChatOpenAI(),
  memory: new ConversationMemory(),
});
\`\`\`
