'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Sparkles, X } from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const IRIS_KNOWLEDGE_BASE: Record<string, { response: string; keywords: string[] }> = {
    agents: {
        response:
            'We offer 6 pre-built AI agents: Cybersecurity Threat Agent, Contract Analysis Agent, Lead Scoring Agent, Regulatory Compliance Agent, Recruitment Screening Agent, and Fraud Detection Agent. Each is optimized for a specific business workflow.',
        keywords: ['agents', 'agent', 'available', 'which', 'what agents', 'types'],
    },
    'run agent': {
        response:
            'Select an agent, enter your input data, and it will analyze the content and return structured results. Authenticated runs are logged to your workspace history.',
        keywords: ['run', 'execute', 'use', 'how to', 'start', 'process'],
    },
    cybersecurity: {
        response:
            'Our Cybersecurity Threat Agent analyzes incidents and system logs to surface severity, likely attack vectors, indicators of compromise, and remediation steps.',
        keywords: ['cybersecurity', 'security', 'vulnerabilities', 'threats', 'risk'],
    },
    contracts: {
        response:
            'The Contract Analysis Agent reviews legal documents, identifies key clauses, flags risks, and summarizes obligations automatically.',
        keywords: ['contract', 'legal', 'agreements', 'clauses', 'terms', 'document'],
    },
    'lead scoring': {
        response:
            'The Lead Scoring Agent ranks prospects by fit and conversion likelihood so your sales team can focus on the best opportunities first.',
        keywords: ['lead', 'scoring', 'qualifier', 'prospects'],
    },
    compliance: {
        response:
            'The Compliance Agent checks policies and documents against regulations such as GDPR, HIPAA, and SOX to highlight gaps quickly.',
        keywords: ['compliance', 'regulation', 'audit', 'standards'],
    },
    'hr screening': {
        response:
            'The Recruitment Screening Agent analyzes candidate profiles and resumes to identify top-fit applicants and summarize reasoning.',
        keywords: ['hr', 'hiring', 'screening', 'candidates', 'resume'],
    },
    'fraud detection': {
        response:
            'The Fraud Detection Agent reviews transactions and suspicious patterns to surface anomalies, risk scores, and investigation guidance.',
        keywords: ['fraud', 'detection', 'suspicious', 'transactions', 'anomaly'],
    },
    pricing: {
        response:
            'Pricing is based on usage and agent runs. Visit our pricing page for details — free credits are included when you sign up.',
        keywords: ['pricing', 'price', 'cost', 'pay', 'subscription'],
    },
    support: {
        response:
            'Support is available via email and chat. If you need help using the Agent Store, I can also point you to the right area.',
        keywords: ['support', 'help', 'contact', 'error', 'problem'],
    },
}

const GREETINGS = ['hi', 'hello', 'hey', 'howdy', 'greetings', 'sup', 'yo', "what's up", 'how are you', "how's it going"]

function isGreeting(message: string): boolean {
    const lower = message.toLowerCase().trim()
    const words = lower.split(/\s+/).filter((word) => word.length > 0)

    if (words.length <= 2) {
        return GREETINGS.some((greeting) => lower.includes(greeting))
    }

    return false
}

function findBestResponse(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase()

    if (isGreeting(userMessage)) {
        return 'greeting'
    }

    let bestScore = 0
    let bestResponse: string | null = null

    for (const { response, keywords } of Object.values(IRIS_KNOWLEDGE_BASE)) {
        let score = 0

        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                score += keyword.length
            }
        }

        if (score > bestScore) {
            bestScore = score
            bestResponse = response
        }
    }

    return bestResponse
}

function extractName(message: string): string | null {
    const patterns = [
        /(?:my name is|i'm|im|call me)\s+([a-zA-Z]+)/i,
        /(?:the name is|you can call me)\s+([a-zA-Z]+)/i,
    ]

    for (const pattern of patterns) {
        const match = message.match(pattern)
        if (match?.[1]) {
            return match[1].charAt(0).toUpperCase() + match[1].slice(1)
        }
    }

    return null
}

export function IrisGlobalChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [userName, setUserName] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm Iris, your AI guide. How can I help you today?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [characterExpression, setCharacterExpression] = useState<'neutral' | 'happy' | 'thinking'>('neutral')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (text?: string) => {
        const messageText = text || input.trim()
        if (!messageText) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')

        const extractedName = extractName(messageText)
        if (extractedName && !extractedName.toLowerCase().includes('iris')) {
            setUserName(extractedName)
            setCharacterExpression('happy')
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-welcome`,
                    role: 'assistant',
                    content: `Nice to meet you, ${extractedName}! 😊 Feel free to ask me anything about this platform.`,
                    timestamp: new Date(),
                },
            ])
            setTimeout(() => setCharacterExpression('neutral'), 2000)
            return
        }

        setCharacterExpression('thinking')
        setIsLoading(true)

        setTimeout(() => {
            const response = findBestResponse(messageText)

            if (response) {
                let assistantContent = ''

                if (response === 'greeting') {
                    assistantContent = userName ? `Hey ${userName}! How can I help you today?` : 'Hey there! How can I help you today?'
                } else {
                    assistantContent = userName
                        ? `${userName}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`
                        : response
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        id: `${Date.now()}-assistant`,
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: new Date(),
                    },
                ])
                setCharacterExpression('happy')
            } else {
                setCharacterExpression('neutral')
            }

            setIsLoading(false)
            setTimeout(() => setCharacterExpression('neutral'), 2000)
        }, 300)
    }

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 20, y: 10 }}
                        transition={{ duration: 0.5 }}
                        className="fixed bottom-24 right-6 z-30"
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30"
                        >
                            <span>✨ Need help?</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="group fixed bottom-6 right-6 z-40 flex items-center justify-center"
                aria-label={isOpen ? 'Close Iris chatbot' : 'Open Iris chatbot'}
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 opacity-60 blur-xl"
                />

                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/60 bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50">
                    <div className="absolute left-3 top-2 h-4 w-4 rounded-full bg-white/40 blur-sm" />

                    {!isOpen ? (
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <div className="mb-1 flex gap-2">
                                <motion.div
                                    animate={characterExpression === 'thinking' ? { scaleY: [1, 0.3, 1] } : {}}
                                    transition={characterExpression === 'thinking' ? { duration: 0.6, repeat: Infinity } : {}}
                                    className="h-2.5 w-2 rounded-full bg-slate-900"
                                />
                                <motion.div
                                    animate={characterExpression === 'thinking' ? { scaleY: [1, 0.3, 1] } : {}}
                                    transition={characterExpression === 'thinking' ? { duration: 0.6, repeat: Infinity, delay: 0.1 } : {}}
                                    className="h-2.5 w-2 rounded-full bg-slate-900"
                                />
                            </div>

                            {characterExpression === 'happy' ? (
                                <motion.svg width="14" height="8" viewBox="0 0 14 8" className="text-slate-900" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.3 }}>
                                    <path d="M 2 2 Q 7 6 12 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                </motion.svg>
                            ) : characterExpression === 'thinking' ? (
                                <motion.svg width="12" height="8" viewBox="0 0 12 8" className="text-slate-900">
                                    <circle cx="6" cy="4" r="1.5" fill="currentColor" />
                                </motion.svg>
                            ) : (
                                <svg width="12" height="6" viewBox="0 0 12 6" className="text-slate-900">
                                    <path d="M 2 2 Q 6 5 10 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                </svg>
                            )}
                        </motion.div>
                    ) : (
                        <X className="h-6 w-6 text-white" />
                    )}

                    <motion.div
                        animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-cyan-300"
                    />
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 z-40 flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl"
                    >
                        <div className="relative flex items-center justify-between overflow-hidden border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-cyan-500/20 px-6 py-5">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent" />

                            <div className="relative z-10 flex items-center gap-3">
                                <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-cyan-300/60 bg-gradient-to-br from-cyan-400 to-cyan-600"
                                >
                                    <Sparkles className="h-5 w-5 text-white" />
                                </motion.div>
                                <div>
                                    <h2 className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-sm font-bold uppercase tracking-widest text-transparent">
                                        Iris
                                    </h2>
                                    <p className="text-[10px] font-medium text-cyan-300/70">
                                        {userName ? `Hi, ${userName}!` : 'Your AI Guide'}
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOpen(false)}
                                className="relative z-10 rounded-full p-2 transition-colors hover:bg-white/10"
                            >
                                <X className="h-5 w-5 text-cyan-300" />
                            </motion.button>
                        </div>

                        <div className="min-h-[280px] flex-1 space-y-4 overflow-y-auto bg-slate-900/50 p-5">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/20">
                                            <Sparkles className="h-3 w-3 text-cyan-400" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed transition-colors ${msg.role === 'user'
                                                ? 'rounded-br-none bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-600/20'
                                                : 'rounded-bl-none border border-white/10 bg-white/10 text-slate-100 hover:bg-white/15'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="flex gap-2 px-4 py-3">
                                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="h-2 w-2 rounded-full bg-cyan-400" />
                                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} className="h-2 w-2 rounded-full bg-cyan-400" />
                                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="h-2 w-2 rounded-full bg-cyan-400" />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                handleSendMessage()
                            }}
                            className="border-t border-cyan-500/20 bg-gradient-to-t from-slate-950 to-slate-900/80 px-5 py-4"
                        >
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder="Ask me anything..."
                                    className="flex-1 rounded-full border border-cyan-500/30 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-500/50 focus:border-cyan-400 focus:outline-none"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 p-3 text-white shadow-lg shadow-cyan-500/40 transition-all duration-300 hover:from-cyan-400 hover:to-cyan-500"
                                >
                                    <Send className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
