import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name: string
  imageUrl?: string
  className?: string
}

export function UserAvatar({ name, imageUrl, className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
