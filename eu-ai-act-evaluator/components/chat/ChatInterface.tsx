'use client';

/**
 * Chat Interface Component
 *
 * AI-powered chat interface using AI Elements components
 */

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';

interface ChatInterfaceProps {
  sessionId: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { sessionId },
    }),
  });

  // Debug: log messages to see structure
  useEffect(() => {
    console.log('All messages:', messages);
    messages.forEach(msg => {
      console.log(`Message ${msg.id} parts:`, msg.parts);
    });
  }, [messages]);

  const toggleToolExpanded = (toolId: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                EU AI Act Compliance Assistant
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                I can help you document AI systems, trigger compliance evaluations,
                and interpret results. What would you like to evaluate?
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-50 text-neutral-900 border border-neutral-200'
                  }`}
                >
                  <div className="text-sm leading-relaxed space-y-3">
                    {message.parts?.map((part: any, idx) => {
                      // Handle text parts
                      if (part.type === 'text') {
                        return (
                          <div key={idx} className="whitespace-pre-wrap">
                            {part.text}
                          </div>
                        );
                      }

                      // Handle tool parts (typed as tool-{toolName})
                      if (part.type?.startsWith('tool-')) {
                        const toolName = part.type.replace('tool-', '');
                        const displayName = toolName.replace(/_/g, ' ').toUpperCase();
                        const toolId = `${message.id}-${idx}`;
                        const isExpanded = expandedTools.has(toolId);

                        // Render based on state
                        if (part.state === 'input-streaming') {
                          return (
                            <div
                              key={idx}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="font-semibold text-blue-900">
                                  {displayName}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (part.state === 'input-available' || part.state === 'output-available') {
                          const hasOutput = part.state === 'output-available';

                          return (
                            <div
                              key={idx}
                              className={`${
                                hasOutput
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-blue-50 border-blue-200'
                              } border rounded-lg text-xs overflow-hidden`}
                            >
                              <button
                                onClick={() => toggleToolExpanded(toolId)}
                                className="w-full p-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      hasOutput ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                  ></div>
                                  <div
                                    className={`font-semibold ${
                                      hasOutput ? 'text-green-900' : 'text-blue-900'
                                    }`}
                                  >
                                    {displayName}
                                  </div>
                                </div>
                                <svg
                                  className={`w-4 h-4 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  } ${hasOutput ? 'text-green-700' : 'text-blue-700'}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {isExpanded && (
                                <div className="px-3 pb-3 space-y-3">
                                  {/* Input */}
                                  {part.input && (
                                    <div>
                                      <div
                                        className={`mb-1 font-medium ${
                                          hasOutput ? 'text-green-700' : 'text-blue-700'
                                        }`}
                                      >
                                        Input:
                                      </div>
                                      <div
                                        className={`font-mono ${
                                          hasOutput
                                            ? 'text-green-800 bg-green-100'
                                            : 'text-blue-800 bg-blue-100'
                                        } rounded p-2 overflow-x-auto`}
                                      >
                                        <pre>{JSON.stringify(part.input, null, 2)}</pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* Output */}
                                  {hasOutput && (
                                    <div>
                                      <div className="text-green-700 mb-1 font-medium">
                                        Output:
                                      </div>
                                      {part.output?.success ? (
                                        <div className="text-green-800">
                                          <div className="font-medium mb-1">
                                            {part.output.message}
                                          </div>
                                          {part.output.use_case && (
                                            <div className="font-mono text-xs text-green-700 bg-green-100 rounded p-2 mt-2">
                                              ID: {part.output.use_case.id}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="font-mono text-green-800 bg-green-100 rounded p-2 overflow-x-auto">
                                          <pre>{JSON.stringify(part.output, null, 2)}</pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (part.state === 'output-error') {
                          return (
                            <div
                              key={idx}
                              className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <div className="font-semibold text-red-900">
                                  {displayName} Error
                                </div>
                              </div>
                              <div className="text-red-800">{part.errorText}</div>
                            </div>
                          );
                        }
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>
            ))}
            {status === 'streaming' && (
              <div className="flex justify-start">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage({ text: input });
              setInput('');
            }
          }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AI Act compliance..."
              className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
              disabled={status !== 'ready'}
            />
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
