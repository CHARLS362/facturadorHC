import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils";

const activities = [
  { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+S/1,999.00", type: "Venta", avatarInitials: "OM" },
  { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "Registro", type: "Nuevo Cliente", avatarInitials: "SD" },
  { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+S/39.00", type: "Venta", avatarInitials: "JL" },
  { name: "Liam Smith", email: "liam@email.com", amount: "-S/85.00", type: "Devolución", avatarInitials: "LS" },
  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+S/299.00", type: "Venta", avatarInitials: "IN" },
]

const typeStyles: Record<string, string> = {
  "Venta": "text-emerald-600 dark:text-emerald-400",
  "Nuevo Cliente": "text-blue-600 dark:text-blue-400",
  "Devolución": "text-amber-600 dark:text-amber-400",
}

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={activity.name} data-ai-hint="person portrait" />
            <AvatarFallback>{activity.avatarInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-xs text-muted-foreground">{activity.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className={cn(
              "font-medium text-sm",
              activity.amount.startsWith('+') ? 'text-emerald-600' :
              activity.amount.startsWith('-') ? 'text-destructive' : 'text-foreground'
            )}>
              {activity.amount}
            </p>
            <p className={cn("text-xs font-semibold", typeStyles[activity.type] || "text-muted-foreground")}>
              {activity.type}
            </p>
          </div>
        </div>
      ))}
      <div className="pt-4 text-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/ventas">
            Ver todas las ventas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
