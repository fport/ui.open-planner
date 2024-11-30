"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { io } from "socket.io-client"
import { v4 as uuidv4 } from "uuid"

export default function CreateGame() {
  const router = useRouter()
  const [teamName, setTeamName] = useState("")
  const [scrumMasterName, setScrumMasterName] = useState("")
  const [votingSystem, setVotingSystem] = useState("fibonacci")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const socket = io(process.env.NEXT_PUBLIC_API_URL)
    const roomId = uuidv4()

    socket.emit("createRoom", {
      roomId,
      userName: scrumMasterName,
      teamName,
      isScrumMaster: true
    })


    socket.on("roomUpdate", () => {
      router.push(`/plan/${roomId}?teamName=${teamName}`)
    })
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
                <Label htmlFor="sessionName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="scrumMasterName">Your Name</Label>
                <Input
                  id="scrumMasterName"
                  value={scrumMasterName}
                  onChange={(e) => setScrumMasterName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <Label>Voting System</Label>
                <RadioGroup
                  value={votingSystem}
                  onValueChange={setVotingSystem}
                  className="flex flex-col space-y-1 mt-2"
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
          <Button className="w-full" onClick={handleSubmit}>Create Game</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

