"use client"

import VoiceService from "./voice-service"

export interface CommandPattern {
  pattern: RegExp | string
  action: (matches: string[]) => Promise<void> | void
  description: string
  examples: string[]
}

export class VoiceCommandProcessor {
  private static instance: VoiceCommandProcessor
  private voiceService: VoiceService
  private commands: CommandPattern[] = []
  private isProcessing = false
  private confidenceThreshold = 0.7

  private constructor() {
    this.voiceService = VoiceService.getInstance()
  }

  static getInstance(): VoiceCommandProcessor {
    if (!VoiceCommandProcessor.instance) {
      VoiceCommandProcessor.instance = new VoiceCommandProcessor()
    }
    return VoiceCommandProcessor.instance
  }

  // Register a new command pattern
  registerCommand(command: CommandPattern): void {
    this.commands.push(command)
  }

  // Register multiple command patterns
  registerCommands(commands: CommandPattern[]): void {
    this.commands.push(...commands)
  }

  // Remove a command pattern
  removeCommand(pattern: RegExp | string): void {
    const patternString = pattern instanceof RegExp ? pattern.toString() : pattern
    this.commands = this.commands.filter((cmd) => {
      const cmdPattern = cmd.pattern instanceof RegExp ? cmd.pattern.toString() : cmd.pattern
      return cmdPattern !== patternString
    })
  }

  // Clear all command patterns
  clearCommands(): void {
    this.commands = []
  }

  // Get all registered commands
  getCommands(): CommandPattern[] {
    return [...this.commands]
  }

  // Process a voice input against registered commands
  async processInput(input: string): Promise<boolean> {
    if (this.isProcessing) return false

    this.isProcessing = true
    let matched = false

    try {
      // Normalize input
      const normalizedInput = input.toLowerCase().trim()

      // Try to match against commands
      for (const command of this.commands) {
        const pattern = command.pattern
        let matches: string[] | null = null

        if (pattern instanceof RegExp) {
          matches = normalizedInput.match(pattern)
        } else {
          // For string patterns, do a simple includes check
          if (normalizedInput.includes(pattern.toLowerCase())) {
            matches = [normalizedInput]
          }
        }

        if (matches) {
          await command.action(matches)
          matched = true
          break
        }
      }

      return matched
    } finally {
      this.isProcessing = false
    }
  }

  // Start listening for voice commands
  startListening(
    options: {
      onCommandDetected?: (command: string, matched: boolean) => void
      onListeningStart?: () => void
      onListeningEnd?: () => void
      continuous?: boolean
    } = {},
  ): void {
    if (!this.voiceService.isRecognitionSupported()) {
      throw new Error("Speech recognition not supported")
    }

    const { onCommandDetected, onListeningStart, onListeningEnd, continuous = true } = options

    if (onListeningStart) {
      onListeningStart()
    }

    this.voiceService.startListening({
      continuous,
      interimResults: false,
      onResult: async (transcript, isFinal) => {
        if (isFinal) {
          console.log("Command detected:", transcript)
          const matched = await this.processInput(transcript)

          if (onCommandDetected) {
            onCommandDetected(transcript, matched)
          }

          // Provide feedback if no command matched
          if (!matched) {
            this.voiceService.speak("Sorry, I didn't understand that command.", {
              priority: "low",
            })
          }
        }
      },
      onError: (error) => {
        console.error("Speech recognition error:", error)
      },
      onEnd: () => {
        if (onListeningEnd) {
          onListeningEnd()
        }
      },
    })
  }

  // Stop listening for voice commands
  stopListening(): void {
    this.voiceService.stopListening()
  }

  // Set confidence threshold for command matching
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold))
  }

  // Get help information about available commands
  getCommandHelp(): { command: string; description: string; examples: string[] }[] {
    return this.commands.map((cmd) => ({
      command: cmd.pattern instanceof RegExp ? cmd.pattern.toString() : cmd.pattern,
      description: cmd.description,
      examples: cmd.examples,
    }))
  }
}

// Default commands for the SafeDriver system
export const defaultCommands: CommandPattern[] = [
  {
    pattern: /^show (alerts|notifications)$/i,
    action: async () => {
      window.location.href = "/alerts"
    },
    description: "Navigate to the alerts page",
    examples: ["show alerts", "show notifications"],
  },
  {
    pattern: /^show drivers$/i,
    action: async () => {
      window.location.href = "/drivers"
    },
    description: "Navigate to the drivers page",
    examples: ["show drivers"],
  },
  {
    pattern: /^show fleet$/i,
    action: async () => {
      window.location.href = "/fleet"
    },
    description: "Navigate to the fleet page",
    examples: ["show fleet"],
  },
  {
    pattern: /^show routes$/i,
    action: async () => {
      window.location.href = "/routes"
    },
    description: "Navigate to the routes page",
    examples: ["show routes"],
  },
  {
    pattern: /^show analytics$/i,
    action: async () => {
      window.location.href = "/analytics"
    },
    description: "Navigate to the analytics page",
    examples: ["show analytics"],
  },
  {
    pattern: /^go (home|back|to dashboard)$/i,
    action: async () => {
      window.location.href = "/"
    },
    description: "Navigate to the dashboard",
    examples: ["go home", "go back", "go to dashboard"],
  },
  {
    pattern: /^refresh( data)?$/i,
    action: async () => {
      window.location.reload()
    },
    description: "Refresh the current page",
    examples: ["refresh", "refresh data"],
  },
  {
    pattern: /^acknowledge alert$/i,
    action: async () => {
      // This would need to be implemented based on the current alert context
      const voiceService = VoiceService.getInstance()
      voiceService.speak("Acknowledging current alert", { priority: "normal" })

      // Trigger a custom event that alert components can listen for
      const event = new CustomEvent("voice-acknowledge-alert")
      document.dispatchEvent(event)
    },
    description: "Acknowledge the current alert",
    examples: ["acknowledge alert"],
  },
  {
    pattern: /^contact driver$/i,
    action: async () => {
      // This would need to be implemented based on the current driver context
      const voiceService = VoiceService.getInstance()
      voiceService.speak("Contacting the driver", { priority: "normal" })

      // Trigger a custom event that driver components can listen for
      const event = new CustomEvent("voice-contact-driver")
      document.dispatchEvent(event)
    },
    description: "Contact the current driver",
    examples: ["contact driver"],
  },
  {
    pattern: /^help$/i,
    action: async () => {
      const voiceService = VoiceService.getInstance()
      const commandProcessor = VoiceCommandProcessor.getInstance()
      const commands = commandProcessor.getCommandHelp()

      await voiceService.speak(
        "Available commands include: show alerts, show drivers, go home, refresh, acknowledge alert, and contact driver. Say help commands for more details.",
        {
          priority: "normal",
        },
      )
    },
    description: "Get help with voice commands",
    examples: ["help"],
  },
  {
    pattern: /^help commands$/i,
    action: async () => {
      const voiceService = VoiceService.getInstance()
      const commandProcessor = VoiceCommandProcessor.getInstance()
      const commands = commandProcessor.getCommandHelp()

      let helpText = "Here are the available commands: "
      commands.forEach((cmd, index) => {
        helpText += `${cmd.examples[0]}${index < commands.length - 1 ? ", " : "."}`
      })

      await voiceService.speak(helpText, { priority: "normal" })
    },
    description: "List all available voice commands",
    examples: ["help commands"],
  },
]
