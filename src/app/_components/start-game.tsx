"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useRoom } from "@/hooks/useRoom"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

const roomId = uuidv4()

export default function CreateGame() {
  const router = useRouter()
  const { toast } = useToast()
  const [teamName, setTeamName] = useState("")
  const [scrumMasterName, setScrumMasterName] = useState("")
  const [votingSystem, setVotingSystem] = useState("fibonacci")
  const { createRoom, room, error, isConnected, isConnecting } = useRoom(roomId)

  useEffect(() => {
    if (room) {
      console.log('Room created, redirecting to:', `/plan/${roomId}?teamName=${teamName}&userName=${scrumMasterName}`);
      sessionStorage.setItem("isScrumMaster", "true")
      sessionStorage.setItem("roomId", roomId)
      sessionStorage.setItem("userName", scrumMasterName)
      router.push(`/plan/${roomId}?teamName=${teamName}&userName=${scrumMasterName}`)
    }
  }, [room, router, roomId, teamName, scrumMasterName])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isConnecting) {
      toast.error("Still connecting to server, please wait...")
      return
    }

    if (!isConnected) {
      toast.error("Not connected to server. Please try again.")
      return
    }

    if (!teamName || !scrumMasterName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      console.log('Creating room with data:', {
        userName: scrumMasterName,
        teamName,
        isScrumMaster: true
      });

      createRoom({
        userName: scrumMasterName,
        teamName,
        isScrumMaster: true
      })
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error("Failed to create room. Please try again.")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Scrum Poker Game</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                  disabled={isConnecting}
                />
              </div>
              <div>
                <Label htmlFor="scrumMasterName">Your Name</Label>
                <Input
                  id="scrumMasterName"
                  value={scrumMasterName}
                  onChange={(e) => setScrumMasterName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={isConnecting}
                />
              </div>
              <div>
                <Label>Voting System</Label>
                <RadioGroup
                  value={votingSystem}
                  onValueChange={setVotingSystem}
                  className="flex flex-col space-y-1 mt-2"
                  disabled={isConnecting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fibonacci" id="fibonacci" />
                    <Label htmlFor="fibonacci">Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tshirt" id="tshirt" />
                    <Label htmlFor="tshirt">T-Shirt Sizes (XS, S, M, L, XL, XXL)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={!isConnected || !teamName || !scrumMasterName || isConnecting}
          >
            {isConnecting ? "Connecting..." : !isConnected ? "Not Connected" : "Create Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 