
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, PackageMinus, PackagePlus, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";

// Define a type for the icon map keys
type IconName = "DollarSign" | "Users" | "PackageMinus" | "PackagePlus" | string; // Allow string for future extensibility

// Map icon names to actual Lucide components
const iconMap: Record<IconName, FunctionComponent<LucideProps>> = {
  DollarSign: DollarSign,
  Users: Users,
  PackageMinus: PackageMinus,
  PackagePlus: PackagePlus,
  // Add more icons here as needed
};

export interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  iconName: IconName;
  description?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "destructive";
  href?: string;
}

export function KpiCard({ title, value, change, iconName, description, trend = "neutral", variant = "default", href }: KpiCardProps) {
  const IconComponent = iconMap[iconName] || HelpCircle; // Fallback to HelpCircle if iconName is not in map

  const trendIcon = trend === "up" ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : trend === "down" ? <ArrowDownRight className="h-4 w-4 text-red-500" /> : null;
  const changeColor = trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";

  const cardContent = (
    <Card className={cn(
        "shadow-lg transition-all duration-300 rounded-lg ease-out",
        href && "hover:scale-[1.02] hover:shadow-xl hover:cursor-pointer",
        variant === "destructive" && "bg-destructive/10 border-destructive/30"
      )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-headline text-foreground/80">{title}</CardTitle>
        <IconComponent className={cn("h-5 w-5 text-muted-foreground", variant === "destructive" ? "text-destructive" : "text-primary")} />
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

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>;
  }

  return cardContent;
}
