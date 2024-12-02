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
import { useRoom } from "@/hooks/useRoom"
import { Room, User } from "@/types/room"

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
  const [gameState, setGameState] = useState<GameState>({
    currentStory: "",
    participants: [],
    showVotes: false
  })
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [taskInput, setTaskInput] = useState("")
  const isScrumMaster = sessionStorage.getItem("isScrumMaster") === "true"
  const { joinRoom, room, error, isConnected, submitVote, startNewTask, toggleVotes } = useRoom(params.id as string)
  const { toast } = useToast()

  useEffect(() => {
    if (!params.id || !userName || !isConnected) return;

    joinRoom({
      userName,
      isScrumMaster: isScrumMaster
    });
  }, [params.id, userName, isConnected, joinRoom, isScrumMaster]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        description: error,
        duration: 3000
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (room) {
      console.log('Room updated:', room);
      setGameState({
        currentStory: room.currentTask || "",
        participants: room.users.map((user) => ({
          ...user,
          avatar: ""
        })),
        showVotes: room.showVotes,
        teamName: room.teamName
      });
    }
  }, [room]);

  const handleVote = (value: string) => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        description: "Not connected to server",
        duration: 3000
      });
      return;
    }
    setSelectedVote(value);
    submitVote(value);
  };

  const handleToggleVotes = () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        description: "Not connected to server",
        duration: 3000
      });
      return;
    }
    toggleVotes();
  };

  const handleStartNewTask = () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        description: "Not connected to server",
        duration: 3000
      });
      return;
    }
    if (!taskInput.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a task description",
        duration: 3000
      });
      return;
    }
    startNewTask(taskInput);
    setTaskInput("");
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/member/${params.id}?teamName=${teamName}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      description: "Invite link copied to clipboard!",
      duration: 2000
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <p>Connecting to server...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          {teamName && (
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-2">
                <span className="flex items-center">
                  <span>Team:</span>
                  <span className="font-medium ml-1">{teamName.toUpperCase()}</span>
                </span>
                <span className="text-muted-foreground mx-2">/</span>
                <span className="flex items-center">
                  <span className="font-medium">{userName?.toUpperCase()}</span>
                </span>
              </span>
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
          {isScrumMaster && (
            <div className="flex gap-2 mt-4">
              <Input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Enter task description"
              />
              <Button onClick={handleStartNewTask}>Start New Task</Button>
            </div>
          )}
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
                    disabled={!gameState.currentStory}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        {isScrumMaster && (
          <CardFooter className="flex justify-between">
            <Button onClick={handleToggleVotes} className="flex items-center">
              {gameState.showVotes ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {gameState.showVotes ? "Hide Votes" : "Reveal Votes"}
            </Button>
            <Button onClick={handleStartNewTask} variant="outline">
              Reset Votes
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

