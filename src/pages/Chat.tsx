import { useEffect, useState, useRef } from 'react';
import { SalesAgent } from '@/lib/gemini';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'agent';
  text: string;
};

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [agent, setAgent] = useState<SalesAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Initialize the agent
    const newAgent = new SalesAgent(user.uid, () => {
      console.log("Lead submitted successfully!");
    });
    setAgent(newAgent);
    
    // Initial greeting
    setMessages([{ 
      id: Date.now().toString(), 
      role: 'agent', 
      text: "Hi there! Welcome to CV CREATION CRM. I'm here to help you find the perfect vehicle. To get started, what's your full name?" 
    }]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !agent || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const responseText = await agent.sendMessage(userMessage);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', text: responseText }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', text: "Sorry, something went wrong on my end." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)]">
      <Card className="h-full flex flex-col shadow-md border-0 ring-1 ring-gray-200">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            CV CREATION CRM AI Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex items-start gap-3 w-full", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>
                {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm", msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-900 rounded-tl-none")}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 w-16 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="border-t p-4 bg-white rounded-b-xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex w-full items-center gap-2"
          >
            <Input 
              type="text" 
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || loading} size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
