
"use client";

import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { ChatMessage } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare } from 'lucide-react';

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Initialize with empty array
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('User');
  const [isMounted, setIsMounted] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial messages that depend on Date.now() only on the client
    const initialClientMessages: ChatMessage[] = [
      { id: 'msg1', user: 'Alice', text: 'Hey team, how is the sprint going?', timestamp: Date.now() - 60000 * 5 },
      { id: 'msg2', user: 'Bob', text: 'Making good progress on the login feature!', timestamp: Date.now() - 60000 * 3 },
      { id: 'msg3', user: 'KanbanAI', text: 'Welcome to the team chat!', timestamp: Date.now() - 60000 * 10 },
    ];
    initialClientMessages.sort((a,b) => a.timestamp - b.timestamp);
    setMessages(initialClientMessages);

    // For time formatting, ensure it runs after mount
    setIsMounted(true);
    
    // Prompt for user name
    const name = prompt("Enter your name for chat:", "User");
    if (name) setCurrentUser(name);
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: currentUser,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <Card className="flex flex-col h-full shadow-lg bg-card text-card-foreground">
      <CardHeader className="p-4 border-b border-border">
        <CardTitle className="text-lg font-semibold font-headline flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-primary" /> Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.user.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-sm text-card-foreground">{msg.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {isMounted ? formatTime(msg.timestamp) : '...'}
                  </p>
                </div>
                <p className="text-sm bg-secondary p-2 rounded-lg inline-block max-w-full break-words text-secondary-foreground">{msg.text}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            aria-label="Chat message input"
          />
          <Button type="submit" size="icon" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground" aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
