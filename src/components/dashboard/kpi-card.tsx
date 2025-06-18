
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  PackageMinus, 
  PackagePlus, 
  List, 
  HelpCircle,
  UserPlus,      // Added
  FileText,      // Added
  TrendingUp     // Added
} from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";
import { Progress } from "@/components/ui/progress";

type IconName = "DollarSign" | "Users" | "PackageMinus" | "PackagePlus" | "List" | "UserPlus" | "FileText" | "TrendingUp" | string;

const iconMap: Record<IconName, FunctionComponent<LucideProps>> = {
  DollarSign: DollarSign,
  Users: Users,
  PackageMinus: PackageMinus,
  PackagePlus: PackagePlus,
  List: List,
  UserPlus: UserPlus,        // Added
  FileText: FileText,        // Added
  TrendingUp: TrendingUp,    // Added
  HelpCircle: HelpCircle, // Fallback
};

export interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  iconName: IconName;
  description?: string;
  trend?: "up" | "down" | "neutral";
  href?: string;
  iconBgClass?: string;
  iconColorClass?: string;
  progressValue?: number;
}

export function KpiCard({
  title,
  value,
  change,
  iconName,
  description,
  trend = "neutral",
  href,
  iconBgClass = "bg-primary",
  iconColorClass = "text-primary-foreground",
  progressValue,
}: KpiCardProps) {
  const IconComponent = iconMap[iconName] || HelpCircle;

  const trendIcon = trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null;
  const changeColor = trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";

  const cardContent = (
    <Card className={cn(
        "shadow-lg transition-all duration-300 rounded-lg ease-out w-full",
        href && "hover:scale-[1.03] hover:shadow-xl cursor-pointer"
      )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
              {title}
            </CardTitle>
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center p-2",
            iconBgClass
          )}>
            <IconComponent className={cn("h-5 w-5", iconColorClass)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold font-headline text-foreground mb-1">{value}</div>
        {change && description && (
          <div className="text-xs text-muted-foreground flex items-center">
            <span className={cn("flex items-center mr-1", changeColor)}>{trendIcon}{change}</span>
            {description}
          </div>
        )}
        {!change && description && (
           <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {progressValue !== undefined && (
          <Progress value={progressValue} className="h-1.5 mt-3" />
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>;
  }

  return cardContent;
}
