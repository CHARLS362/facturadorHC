
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const activities = [
  { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+S/1,999.00", type: "Venta", avatarInitials: "OM" },
  { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+S/39.00", type: "Venta", avatarInitials: "JL" },
  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+S/299.00", type: "Venta", avatarInitials: "IN" },
  { name: "William Kim", email: "will@email.com", amount: "+S/99.00", type: "Venta", avatarInitials: "WK" },
  { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+S/139.00", type: "Nuevo Cliente", avatarInitials: "SD" },
]

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${activity.email}.png`} alt={activity.name} />
            <AvatarFallback>{activity.avatarInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-xs text-muted-foreground">{activity.email}</p>
          </div>
          <div className="ml-auto font-medium text-sm">{activity.amount}</div>
           <div className="ml-4 text-xs text-muted-foreground w-24 text-right">{activity.type}</div>
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
