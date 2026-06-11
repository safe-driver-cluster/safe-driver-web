"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, ChevronUp, ChevronDown, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for drivers
const mockDrivers = [
  {
    id: "d1",
    name: "Kamal Perera",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastMessage: "I'll be at the depot in 10 minutes",
    unread: 2,
    lastActive: "2 min ago",
  },
  {
    id: "d2",
    name: "Sunil Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "driving",
    lastMessage: "Traffic is heavy on Main Street",
    unread: 0,
    lastActive: "15 min ago",
  },
  {
    id: "d3",
    name: "Nimal Jayawardena",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastMessage: "Completed my route for today",
    unread: 0,
    lastActive: "1 hour ago",
  },
]

// Mock messages for a conversation
const mockMessages = [
  {
    id: "m1",
    senderId: "admin",
    text: "How's your route going today?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "read",
  },
  {
    id: "m2",
    senderId: "d1",
    text: "All good so far. Traffic is normal.",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    status: "read",
  },
  {
    id: "m3",
    senderId: "admin",
    text: "Great! Remember to take your break at 2pm.",
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    status: "read",
  },
  {
    id: "m4",
    senderId: "d1",
    text: "Will do. I'll be at the depot in 10 minutes.",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    status: "delivered",
  },
]

export function QuickChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const totalUnread = mockDrivers.reduce((sum, driver) => sum + driver.unread, 0)

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message via the chat service
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-16 sm:bottom-4 right-4 z-40 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 sm:w-96 mb-2 shadow-lg border-gray-200 overflow-hidden">
          <CardHeader className="p-3 border-b bg-gray-50 flex flex-row items-center justify-between">
            {activeChat ? (
              <>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveChat(null)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={mockDrivers.find((d) => d.id === activeChat)?.avatar || "/placeholder.svg"}
                        alt={mockDrivers.find((d) => d.id === activeChat)?.name || ""}
                      />
                      <AvatarFallback>
                        {mockDrivers.find((d) => d.id === activeChat)?.name.substring(0, 2) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{mockDrivers.find((d) => d.id === activeChat)?.name}</p>
                      <p className="text-xs text-gray-500">
                        {mockDrivers.find((d) => d.id === activeChat)?.status === "online"
                          ? "Online"
                          : mockDrivers.find((d) => d.id === activeChat)?.status === "driving"
                            ? "Driving"
                            : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-sm">Driver Messages</span>
                  {totalUnread > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1">
                      {totalUnread}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardHeader>

          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {activeChat ? (
              <div className="flex flex-col gap-2 p-3">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === "admin" ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {msg.senderId !== "admin" && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={mockDrivers.find((d) => d.id === msg.senderId)?.avatar || "/placeholder.svg"}
                          alt={mockDrivers.find((d) => d.id === msg.senderId)?.name || ""}
                        />
                        <AvatarFallback>
                          {mockDrivers.find((d) => d.id === msg.senderId)?.name.substring(0, 2) || ""}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[75%] ${
                        msg.senderId === "admin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.senderId === "admin" && (
                      <div className="text-xs text-gray-500">{msg.status === "read" ? "Read" : "Sent"}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${isExpanded ? "block" : "hidden"}`}>
                {mockDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => setActiveChat(driver.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                        <AvatarFallback>{driver.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{driver.name}</p>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              driver.status === "online"
                                ? "bg-green-500"
                                : driver.status === "driving"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                            }`}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{driver.lastMessage}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">{driver.lastActive}</span>
                      {driver.unread > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] px-1 mt-1">
                          {driver.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {activeChat && (
            <CardFooter className="p-2 border-t">
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-12 w-12 shadow-lg flex items-center justify-center relative"
      >
        <MessageCircle className="h-6 w-6" />
        {!isOpen && totalUnread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center"
          >
            {totalUnread}
          </Badge>
        )}
      </Button>
    </div>
  )
}
