"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Eye, EyeOff } from 'lucide-react'
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useToast } from "@/hooks/use-toast"

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
  const params = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentStory: "",
    participants: [],
    showVotes: false
  })
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const { toast } = useToast()

  const handleVote = (value: string) => {
    setSelectedVote(value)
    socket?.emit("vote", { roomId: params.id, vote: value })
  }

  const toggleShowVotes = () => {
    socket?.emit("toggleVotes", { roomId: params.id })
  }

  const resetVotes = () => {
    socket?.emit("startNewTask", { 
      roomId: params.id,
      taskName: "x"
    })
  }

  const copyInviteLink = () => {
    const inviteUrl = `${process.env.NEXT_PUBLIC_URL}/member/${params.id}?teamName=${teamName}`
    navigator.clipboard.writeText(inviteUrl)
    toast({
      description: "Invite link copied to clipboard!",
      duration: 2000
    })
  }

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL)
    setSocket(newSocket)

    newSocket.on('roomUpdate', (data) => {
      setGameState({
        currentStory: data.currentTask || '',
        teamName: data.teamName,
        participants: data.users.map((user:User) => ({
          id: user.id,
          name: user.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          vote: user.vote,
          isScrumMaster: user.isScrumMaster
        })),
        showVotes: data.showVotes
      })
    })

    newSocket.on('newTaskStarted', (data) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New task started: ${data.taskName}`)
      }
    })

    if ('Notification' in window) {
      Notification.requestPermission()
    }

    return () => {
      newSocket.disconnect()
    }
  }, [])

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
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
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
                {["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89"].map((option) => (
                  <Button
                    key={option}
                    variant={selectedVote === option ? "default" : "outline"}
                    onClick={() => handleVote(option)}
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
          <Button onClick={resetVotes} variant="outline">
            Reset Votes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

