import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const activities = [
  { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+S/1,999.00", type: "Venta", avatarInitials: "OM" },
  { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+S/39.00", type: "Venta", avatarInitials: "JL" },
  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+S/299.00", type: "Venta", avatarInitials: "IN" },
  { name: "William Kim", email: "will@email.com", amount: "+S/99.00", type: "Venta", avatarInitials: "WK" },
  { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+S/139.00", type: "Nuevo Cliente", avatarInitials: "SD" },
]

const getActivityStyles = (type: string) => {
  switch (type) {
    case "Venta":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-500/30";
    case "Nuevo Cliente":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};


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
          <div className={cn(
              "ml-auto font-medium text-sm",
              activity.amount.startsWith('+') ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
            )}>
              {activity.amount}
          </div>
           <div className="ml-4 w-28 text-right">
             <Badge variant="outline" className={cn("capitalize font-semibold text-xs", getActivityStyles(activity.type))}>
                {activity.type}
             </Badge>
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
