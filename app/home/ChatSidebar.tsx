'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useChat } from './ChatContext';
import { MessageCircle, Loader2, X } from 'lucide-react';
import { useQuizSettings } from './settings/settingsStorage';
import Link from 'next/link';

export function ChatSidebar({ pdfContext }: { pdfContext?: string }) {
  const { messages, isLoading, sendMessage, clearChat, error } = useChat();
  const [input, setInput] = useState('');
  const { settings } = useQuizSettings();
  const [open, setOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll the Radix viewport to the latest message.
  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [open, messages.length, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!settings?.groqApiKey) {
      alert('Please configure your Groq API key in settings first');
      return;
    }

    const messageToSend = input;
    setInput('');
    await sendMessage(messageToSend, pdfContext, settings.groqApiKey);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow"
          title="Open chat"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Academic ChatBot</SheetTitle>
          <p className="text-xs text-muted-foreground mt-2">Ask questions about your documents or general academic topics</p>
        </SheetHeader>

        {!settings?.groqApiKey ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Groq API Key Not Set</p>
              <p className="text-xs text-muted-foreground mb-4">Configure your API key in settings to use the chatbot</p>
              <Button size="sm" asChild>
                <Link href="/home/settings">Go to Settings</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <p>No messages yet. Ask a question to get started!</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="sm"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </Button>
              {messages.length > 0 && (
                <Button
                  onClick={clearChat}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  title="Clear chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
