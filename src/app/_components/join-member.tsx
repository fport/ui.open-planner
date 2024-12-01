"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { io } from "socket.io-client"

export default function JoinMember({ id }: { id: string }) {
    const router = useRouter()
    const query = useSearchParams()
    const teamName = query.get("teamName")
  const [userName, setUserName] = useState("")

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) return

    router.push(`/plan/${id}?teamName=${teamName}&userName=${userName}`)
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
    <Card>
      <CardHeader>
        <CardTitle>Join Planning Room</CardTitle>
      </CardHeader>
      <form onSubmit={handleJoinRoom}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Join Room
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
  )
}

