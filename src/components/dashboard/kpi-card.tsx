import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "destructive";
}

export function KpiCard({ title, value, change, icon: Icon, description, trend = "neutral", variant = "default" }: KpiCardProps) {
  const trendIcon = trend === "up" ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : trend === "down" ? <ArrowDownRight className="h-4 w-4 text-red-500" /> : null;
  const changeColor = trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";

  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg", variant === "destructive" && "bg-destructive/10 border-destructive/30")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-headline text-foreground/80">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", variant === "destructive" ? "text-destructive" : "text-primary")} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold font-headline", variant === "destructive" && "text-destructive")}>{value}</div>
        {change && (
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            {trendIcon}
            <span className={cn("ml-1", changeColor)}>{change}</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  );
}
