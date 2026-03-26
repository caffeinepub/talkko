import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "../utils/helpers";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
};

export function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const colorClass = getAvatarColor(username);
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
      <AvatarFallback className={cn(colorClass, "text-white font-semibold")}>
        {getInitials(username)}
      </AvatarFallback>
    </Avatar>
  );
}
