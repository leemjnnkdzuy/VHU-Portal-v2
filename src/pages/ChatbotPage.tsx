import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Send,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Sparkles,
    PenLine,
} from "lucide-react";
import assets from "@/assets";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
}

function ChatbotPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConversation?.messages]);

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    const generateId = () => Math.random().toString(36).substring(2, 15);

    const createNewConversation = () => {
        const newConversation: Conversation = {
            id: generateId(),
            title: "Cuộc trò chuyện mới",
            messages: [],
            createdAt: new Date(),
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setInputValue("");
    };



    const handleSend = async () => {
        if (!inputValue.trim()) return;

        let conversationId = activeConversationId;

        // Create new conversation if none exists
        if (!conversationId) {
            const newConversation: Conversation = {
                id: generateId(),
                title: inputValue.slice(0, 30) + (inputValue.length > 30 ? "..." : ""),
                messages: [],
                createdAt: new Date(),
            };
            setConversations(prev => [newConversation, ...prev]);
            conversationId = newConversation.id;
            setActiveConversationId(conversationId);
        }

        // Add user message
        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: inputValue,
            timestamp: new Date(),
        };

        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        title: c.messages.length === 0 ? inputValue.slice(0, 30) + (inputValue.length > 30 ? "..." : "") : c.title,
                        messages: [...c.messages, userMessage],
                    }
                    : c
            )
        );

        setInputValue("");
        setIsTyping(true);

        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const responses = [
            "Xin chào! Tôi là trợ lý ảo của VHU Portal. Tôi có thể giúp bạn tra cứu thông tin về lịch học, điểm số, học phí và các thông tin khác liên quan đến việc học tập của bạn.",
            "Dựa trên thông tin bạn cung cấp, tôi có thể hỗ trợ bạn một số việc như:\n\n1. **Tra cứu lịch học** - Xem lịch học theo tuần hoặc tháng\n2. **Xem điểm số** - Kiểm tra kết quả học tập\n3. **Thông tin học phí** - Tra cứu công nợ và lịch sử đóng phí\n4. **Đăng ký môn học** - Hỗ trợ đăng ký và rút môn\n\nBạn cần hỗ trợ vấn đề gì cụ thể?",
            "Đây là một tính năng thử nghiệm. Trong tương lai, tôi sẽ có thể kết nối trực tiếp với hệ thống của trường để cung cấp thông tin chính xác và cập nhật nhất cho bạn.",
            "Cảm ơn bạn đã sử dụng VHU Chatbot! Nếu có bất kỳ câu hỏi nào khác, đừng ngần ngại hỏi nhé.",
        ];

        const assistantMessage: Message = {
            id: generateId(),
            role: "assistant",
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
        };

        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? { ...c, messages: [...c.messages, assistantMessage] }
                    : c
            )
        );

        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-4 md:-m-6 overflow-hidden">


            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold">VHU Assistant</h1>
                                <p className="text-xs text-muted-foreground">Trợ lý ảo thông minh</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={createNewConversation}
                        className="h-8 w-8"
                    >
                        <PenLine className="w-4 h-4" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    {!activeConversation || activeConversation.messages.length === 0 ? (
                        /* Welcome Screen */
                        <div className="h-full flex flex-col items-center justify-center px-4 py-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6">
                                <Sparkles className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Xin chào!</h2>
                            <p className="text-muted-foreground text-center max-w-md mb-8">
                                Tôi là trợ lý ảo của VHU Portal. Hãy hỏi tôi bất cứ điều gì về lịch học, điểm số, học phí hoặc các thông tin khác.
                            </p>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                                {[
                                    "Lịch học tuần này của tôi?",
                                    "Điểm tích lũy hiện tại là bao nhiêu?",
                                    "Tôi còn nợ học phí không?",
                                    "Hướng dẫn đăng ký môn học",
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputValue(suggestion)}
                                        className="px-4 py-3 text-left text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Messages */
                        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                            {activeConversation.messages.map(message => (
                                <div key={message.id} className="group">
                                    <div className={cn(
                                        "flex gap-3",
                                        message.role === "user" ? "flex-row-reverse" : ""
                                    )}>
                                        {/* Avatar */}
                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                            {message.role === "assistant" ? (
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                                                    <Sparkles className="w-4 h-4" />
                                                </AvatarFallback>
                                            ) : (
                                                <AvatarFallback className="bg-accent">
                                                    <img src={assets.imageLogo} className="w-5 h-5" alt="User" />
                                                </AvatarFallback>
                                            )}
                                        </Avatar>

                                        {/* Message Content */}
                                        <div className={cn(
                                            "flex-1 min-w-0",
                                            message.role === "user" ? "text-right" : ""
                                        )}>
                                            <div
                                                className={cn(
                                                    "inline-block px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap",
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-tr-md"
                                                        : "bg-card border border-border rounded-tl-md"
                                                )}
                                            >
                                                {message.content}
                                            </div>

                                            {/* Message Actions */}
                                            <div className={cn(
                                                "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                                message.role === "user" ? "justify-end" : "justify-start"
                                            )}>
                                                <span className="text-xs text-muted-foreground mr-2">
                                                    {formatTime(message.timestamp)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => copyToClipboard(message.content)}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                                {message.role === "assistant" && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <ThumbsUp className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <ThumbsDown className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <RotateCcw className="w-3 h-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                                            <Sparkles className="w-4 h-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-md">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                rows={1}
                                className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm min-h-[24px] max-h-[200px] py-0"
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className="h-8 w-8 rounded-lg flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            VHU Assistant có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatbotPage;
