"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Copy, Eye, EyeOff } from 'lucide-react'
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

interface User {
  id: string
  name: string
  avatar: string
  vote?: string
  isScrumMaster?: boolean
}

interface GameState {
  currentStory: string
  participants: User[]
  showVotes: boolean
  teamName?: string
}

export default function GameScreen() {
  const query = useSearchParams()
  const teamName = query.get("teamName")
  const userName = query.get("userName")
  const params = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentStory: "",
    participants: [],
    showVotes: false
  })
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [taskInput, setTaskInput] = useState("")
  const isScrumMaster = sessionStorage.getItem("isScrumMaster") === "true"
  const [joined, setJoined] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!params.id|| !userName || joined) return
    console.log("osman");

    const socket = io(process.env.NEXT_PUBLIC_API_URL)
    setSocket(socket)
    

    socket.on('connect', () => {
      console.log("osman2");
      socket.emit('joinRoom', {
        roomId: params.id,
        userName:userName,
        isScrumMaster: isScrumMaster
      })
      setJoined(true)
    })

    // Oda güncellemelerini dinle
    socket.on('roomUpdate', (data) => {
      console.log('Room update:', data)
      setGameState({
        currentStory: data.currentTask || "",
        participants: data.users.map((user: User) => ({
          id: user.id,
          name: user.name,
          avatar: "",
          vote: user.vote,
          isScrumMaster: user.isScrumMaster
        })),
        showVotes: data.showVotes,
        teamName: data.teamName
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [params.id, userName])

  const handleVote = (value: string) => {
    setSelectedVote(value)
    socket?.emit("vote", { roomId: params.id, vote: value })
  }

  const toggleShowVotes = () => {
    socket?.emit("toggleVotes", { roomId: params.id })
  }

  const startNewTask = () => {
    if (!taskInput.trim()) return
    socket?.emit("startNewTask", {
      roomId: params.id,
      taskName: taskInput
    })
    setTaskInput("")
  }

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/member/${params.id}?teamName=${teamName}`
    navigator.clipboard.writeText(inviteUrl)
    toast({
      description: "Invite link copied to clipboard!",
      duration: 2000
    })
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          {teamName && (
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <div>Team: {teamName}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyInviteLink}
                className="h-8 w-8"
                title="Copy invite link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          <CardTitle className="text-2xl font-bold">
            {gameState.currentStory || "No active task"}
          </CardTitle>
          {/* Task input alanı eklendi */}
          <div className="flex gap-2 mt-4">
            <Input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter task description"
            />
            <Button onClick={startNewTask}>Start New Task</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Participants</h3>
              <div className="flex flex-wrap gap-2">
                {gameState.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback>{participant.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{participant.name}</span>
                    {participant.vote && (
                      <Badge variant={gameState.showVotes ? "default" : "secondary"}>
                        {gameState.showVotes ? participant.vote : "Voted"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Vote</h3>
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"]. map((option) => (
                  <Button
                    key={option}
                    variant={selectedVote === option ? "default" : "outline"}
                    onClick={() => handleVote(option)}
                    className={!gameState.currentStory ? "opacity-50 cursor-not-allowed" : ""}
                    /* disabled={!gameState.currentStory} */
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={toggleShowVotes} className="flex items-center">
            {gameState.showVotes ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {gameState.showVotes ? "Hide Votes" : "Reveal Votes"}
          </Button>
          <Button onClick={() => startNewTask()} variant="outline">
            Reset Votes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

