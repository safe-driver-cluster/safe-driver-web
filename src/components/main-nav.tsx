import { AlertTriangle, BarChart3, LayoutDashboard } from "lucide-react"

import type { MainNavItem } from "@/types"

interface MainNavProps {
  items?: MainNavItem[]
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      {items?.map(
        (item, index) =>
          item.href && (
            <a
              key={index}
              href={item.href}
              className="flex items-center text-sm font-medium transition-colors hover:text-foreground/80 sm:text-base"
            >
              {item.title}
            </a>
          ),
      )}
    </div>
  )
}

const items: MainNavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
  },
]
