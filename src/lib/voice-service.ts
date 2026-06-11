"use client"

export interface VoiceOptions {
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

export interface SpeakOptions extends VoiceOptions {
  priority?: "low" | "normal" | "high" | "critical"
  interruptible?: boolean
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: any) => void
}

export interface RecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: any) => void
  onEnd?: () => void
}

// Queue for managing speech synthesis
interface SpeechQueueItem {
  text: string
  options: SpeakOptions
  resolve: () => void
  reject: (error: any) => void
}

class VoiceService {
  private static instance: VoiceService
  private synthesis: SpeechSynthesis | null = null
  private recognition: any = null // SpeechRecognition is not in standard TS types
  private voices: SpeechSynthesisVoice[] = []
  private defaultVoice: SpeechSynthesisVoice | null = null
  private defaultOptions: VoiceOptions = {
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: "en-US",
  }
  private isInitialized = false
  private isListening = false
  private speechQueue: SpeechQueueItem[] = []
  private isSpeaking = false
  private currentUtterance: SpeechSynthesisUtterance | null = null

  private constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis

      // Initialize SpeechRecognition with browser prefixes
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
      }

      this.loadVoices()
    }
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService()
    }
    return VoiceService.instance
  }

  // Initialize the voice service
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    if (!this.synthesis || !this.recognition) {
      console.error("Speech synthesis or recognition not supported")
      return false
    }

    await this.loadVoices()
    this.isInitialized = true
    return true
  }

  // Load available voices
  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synthesis) return []

    // If voices are already loaded
    if (this.synthesis.getVoices().length > 0) {
      this.voices = this.synthesis.getVoices()
      this.setDefaultVoice()
      return this.voices
    }

    // Wait for voices to be loaded
    return new Promise((resolve) => {
      const voicesChangedHandler = () => {
        this.voices = this.synthesis!.getVoices()
        this.setDefaultVoice()
        this.synthesis!.removeEventListener("voiceschanged", voicesChangedHandler)
        resolve(this.voices)
      }

      this.synthesis!.addEventListener("voiceschanged", voicesChangedHandler)

      // Fallback in case the event doesn't fire
      setTimeout(() => {
        if (this.voices.length === 0) {
          this.voices = this.synthesis!.getVoices()
          this.setDefaultVoice()
          resolve(this.voices)
        }
      }, 1000)
    })
  }

  // Set default voice (preferring English)
  private setDefaultVoice(): void {
    if (this.voices.length === 0) return

    // Try to find a good English voice
    const preferredVoice = this.voices.find((voice) => voice.lang.includes("en-US") && voice.localService)

    // Fallback to any English voice
    const englishVoice = this.voices.find((voice) => voice.lang.includes("en"))

    // Fallback to any voice
    this.defaultVoice = preferredVoice || englishVoice || this.voices[0]
  }

  // Get all available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  // Set default options
  setDefaultOptions(options: VoiceOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  // Speak text with options
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.synthesis) {
      throw new Error("Speech synthesis not supported")
    }

    if (!this.isInitialized) {
      await this.initialize()
    }

    const mergedOptions = { ...this.defaultOptions, ...options }
    const priority = options.priority || "normal"

    return new Promise((resolve, reject) => {
      const queueItem: SpeechQueueItem = {
        text,
        options: mergedOptions,
        resolve,
        reject,
      }

      // Handle different priorities
      if (priority === "critical") {
        // Cancel current speech and clear queue for critical messages
        this.cancelSpeech()
        this.speechQueue = []
        this.speechQueue.unshift(queueItem)
      } else if (priority === "high") {
        // Add to front of queue but don't cancel current speech
        this.speechQueue.unshift(queueItem)
      } else {
        // Add to end of queue
        this.speechQueue.push(queueItem)
      }

      this.processQueue()
    })
  }

  // Process the speech queue
  private processQueue(): void {
    if (this.isSpeaking || this.speechQueue.length === 0) return

    const item = this.speechQueue.shift()
    if (!item) return

    this.isSpeaking = true
    const utterance = new SpeechSynthesisUtterance(item.text)

    // Apply options
    utterance.voice = item.options.voice || this.defaultVoice
    utterance.rate = item.options.rate || this.defaultOptions.rate || 1
    utterance.pitch = item.options.pitch || this.defaultOptions.pitch || 1
    utterance.volume = item.options.volume || this.defaultOptions.volume || 1
    utterance.lang = item.options.lang || this.defaultOptions.lang || "en-US"

    // Set event handlers
    utterance.onstart = () => {
      if (item.options.onStart) item.options.onStart()
    }

    utterance.onend = () => {
      if (item.options.onEnd) item.options.onEnd()
      this.isSpeaking = false
      this.currentUtterance = null
      item.resolve()
      this.processQueue() // Process next item in queue
    }

    utterance.onerror = (event) => {
      if (item.options.onError) item.options.onError(event)
      this.isSpeaking = false
      this.currentUtterance = null
      item.reject(event)
      this.processQueue() // Process next item in queue
    }

    // Store current utterance and speak
    this.currentUtterance = utterance
    this.synthesis!.speak(utterance)
  }

  // Cancel current speech
  cancelSpeech(): void {
    if (!this.synthesis) return

    this.synthesis.cancel()
    this.isSpeaking = false
    this.currentUtterance = null
  }

  // Clear speech queue
  clearQueue(): void {
    this.speechQueue = []
  }

  // Start listening for voice commands
  startListening(options: RecognitionOptions = {}): void {
    if (!this.recognition) {
      throw new Error("Speech recognition not supported")
    }

    if (this.isListening) {
      this.stopListening()
    }

    // Configure recognition
    this.recognition.continuous = options.continuous !== undefined ? options.continuous : true
    this.recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true
    this.recognition.maxAlternatives = options.maxAlternatives || 1
    this.recognition.lang = options.lang || this.defaultOptions.lang || "en-US"

    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.resultIndex]
      const transcript = result[0].transcript
      const isFinal = result.isFinal

      if (options.onResult) {
        options.onResult(transcript, isFinal)
      }
    }

    this.recognition.onerror = (event: any) => {
      if (options.onError) {
        options.onError(event)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (options.onEnd) {
        options.onEnd()
      }
    }

    // Start listening
    this.recognition.start()
    this.isListening = true
  }

  // Stop listening
  stopListening(): void {
    if (!this.recognition || !this.isListening) return

    this.recognition.stop()
    this.isListening = false
  }

  // Check if the browser supports speech synthesis
  isSpeechSupported(): boolean {
    return !!this.synthesis
  }

  // Check if the browser supports speech recognition
  isRecognitionSupported(): boolean {
    return !!this.recognition
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening
  }
}

export default VoiceService
