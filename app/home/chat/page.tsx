'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from '../ChatContext';
import { useFileUpload } from '../FileUploadContext';
import { Loader2, MessageCircle, Trash2 } from 'lucide-react';
import { useQuizSettings } from '../settings/settingsStorage';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ChatPage() {
  const { messages, isLoading, sendMessage, clearChat, error } = useChat();
  const { files } = useFileUpload();
  const { settings } = useQuizSettings();
  const [input, setInput] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll the Radix viewport to the latest message.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [messages.length, isLoading]);

  // Extract PDF context from uploaded files
  useEffect(() => {
    const extractPdfContext = async () => {
      if (files.length === 0) {
        setPdfContent('');
        return;
      }

      try {
        const contents: string[] = [];
        for (const fileObj of files) {
          const formData = new FormData();
          formData.append('file', fileObj.file);

          const response = await fetch('/api/parsePdf', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            contents.push(data.content);
          }
        }

        setPdfContent(
          contents.length > 0
            ? `Document context:\n${contents.join('\n---\n')}\n\n`
            : ''
        );
      } catch (err) {
        console.error('Error extracting PDF context:', err);
      }
    };

    extractPdfContext();
  }, [files]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!settings?.groqApiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    const messageToSend = input;
    setInput('');
    await sendMessage(messageToSend, pdfContent, settings.groqApiKey);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Academic ChatBot</h1>
        <p className="text-muted-foreground">
          Ask questions about your uploaded documents or general academic topics
        </p>
      </div>

      {!settings?.groqApiKey && (
        <Alert variant="destructive">
          <AlertTitle>Groq API Key Missing</AlertTitle>
          <AlertDescription>
            Please set up your Groq API key in the{' '}
            <Link href="/home/settings" className="font-medium underline hover:no-underline">
              settings
            </Link>{' '}
            to use the chatbot.
          </AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <Alert>
          <MessageCircle className="h-4 w-4" />
          <AlertTitle>Document Context Available</AlertTitle>
          <AlertDescription>
            {files.length} document(s) loaded. The chatbot can answer questions about your documents.
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex-1 flex flex-col bg-card/50">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold mb-2">Start Your Academic Conversation</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Ask questions about your documents or any academic topic. The chatbot is here to help you learn!
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary text-secondary-foreground rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg flex items-center gap-2 rounded-bl-none">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chatbot is thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-6 space-y-4">
          {messages.length > 0 && (
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Conversation
            </Button>
          )}
          <div className="flex gap-3">
            <Input
              placeholder="Ask anything... (Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !settings?.groqApiKey}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !settings?.groqApiKey}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Groq API Key Required</DialogTitle>
            <DialogDescription>
              To use the chatbot, please configure your Groq API key in settings.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/home/settings">Go to Settings</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
