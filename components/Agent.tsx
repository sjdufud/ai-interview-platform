"use client"
import Image from "next/image"
import { useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED'
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const Agent = ({ userName, userId, interviewId, questions, type, role, techstack, language }: AgentProps) => {
  const speechLang = language === "zh" ? "zh-CN" : "en-US"
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finalTranscriptRef = useRef("")
  const isProcessingRef = useRef(false)

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      //获取并设定话语的语言
      utterance.lang = speechLang
      //获取并设定话语的音高
      utterance.rate = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }
      speechSynthesis.speak(utterance)
    })
  }, [speechLang])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return
      isListeningRef.current = true
    try {
      recognitionRef.current.start() //重新启动监听
    } catch {
      isListeningRef.current = false
    }
  }, [])

  const sendToAI = useCallback(async (allMessages: ChatMessage[]) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, questions, language }),
      })
      const data = await res.json()
      if (data.success && data.text) {
        const aiMsg: ChatMessage = { role: 'assistant', content: data.text }
        setMessages(prev => [...prev, aiMsg])
        await speak(data.text)
        startListening()
      }
    } catch (e) {
      console.error('AI error:', e)
    } finally {
      isProcessingRef.current = false
    }
  }, [questions, speak, startListening, language])

  const handleCall = useCallback(async () => {
    setCallStatus(CallStatus.CONNECTING)
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert('Your browser does not support speech recognition.')
      setCallStatus(CallStatus.INACTIVE)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = speechLang
    recognition.interimResults = true //返回临时结果，文字会在用户边说话时边出现
    recognition.continuous = true
    
    recognition.onresult = (event: any) => {
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }

      // Build full transcript from all final results
      let finalText = ""
      let hasInterim = false
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript
        } else {
          hasInterim = true
        }
      }
      finalTranscriptRef.current = finalText

      // 如果已获得最终文本且不再有中间结果，启动静音计时器
      // 如果仍在获取中间结果，则等待更长时间
      if (finalText.trim()) {
        const delay = hasInterim ? 3000 : 2000
        silenceTimerRef.current = setTimeout(() => {
          if (isProcessingRef.current) return
          const transcript = finalTranscriptRef.current.trim()
          if (transcript) {
            recognition.stop()
            isListeningRef.current = false
            finalTranscriptRef.current = ""

            const userMsg: ChatMessage = { role: 'user', content: transcript }
            setMessages(prev => {
              const updated = [...prev, userMsg]
              sendToAI(updated)
              return updated
            })
          }
        }, delay)
      }
    }

    recognition.onend = () => {
      isListeningRef.current = false
    }

    recognition.onerror = (e: any) => {
      // "no-speech" is normal, just restart
      if (e.error === 'no-speech') {
        isListeningRef.current = false
        startListening()
        return
      }
      isListeningRef.current = false
    }

    recognitionRef.current = recognition
    setCallStatus(CallStatus.ACTIVE)

    const greeting: ChatMessage = { role: 'user', content: language === 'zh' ? '你好，我准备好面试了，请开始吧。' : 'Hello, I am ready for the interview. Please start.' }
    const initialMessages = [greeting]
    setMessages(initialMessages)
    await sendToAI(initialMessages)
  }, [sendToAI, speechLang, startListening, language])

  //它是 messages state 的"影子副本"，专门给 handleDisconnect 用的。
  //因为 handleDisconnect 是 useCallback 的依赖项，而 messages 又是依赖项，所以需要这个 ref 来避免无限循环。
  const messagesRef = useRef<ChatMessage[]>([])

  const handleDisconnect = useCallback(() => {
    speechSynthesis.cancel()  //正在说的立刻打断，排队等着说的全部丢弃。

    //清楚副作用：静默检测，语音识别实例，监听状态锁，最终识别文本，AI 请求互斥锁
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }
    isListeningRef.current = false
    finalTranscriptRef.current = ""
    isProcessingRef.current = false
    setCallStatus(CallStatus.FINISHED)
    setIsSpeaking(false)

    //在用户结束通话后，将对话记录发送到 feedback 页面
    const params = new URLSearchParams({
      transcript: JSON.stringify(messagesRef.current),
      questions: JSON.stringify(questions || []),
      role: role || "Developer",
      type: type || "technical",
      techstack: JSON.stringify(techstack ? techstack.split(",") : ["General"]),
      userId: userId || "",
      interviewId: interviewId || "",
      language: language || "en",
    })
    //跳转到 feedback 页面并带上参数
    window.location.href = `/interview/feedback?${params.toString()}`
  }, [questions, role, type, techstack, userId, interviewId, language])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  //组件卸载时的资源清理函数。组件卸载：用户通过浏览器后退按钮离开面试页面，父组件条件渲染把Agent移除
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const lastMessage = messages[messages.length - 1]

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="AI Interviewer" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p key={lastMessage?.content} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
              {lastMessage?.role === 'assistant' ? '🤖 ' : '🧑 '}{lastMessage?.content}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        {callStatus !== 'ACTIVE' ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span className={cn('absolute animate-ping rounded opacity-75', callStatus !== 'CONNECTING' && 'hidden')} />
            <span>
              {callStatus === 'INACTIVE' || callStatus === 'FINISHED' ? 'Call' : '...'}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  )
}

export default Agent
