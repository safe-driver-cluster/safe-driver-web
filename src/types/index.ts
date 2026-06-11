import { ComponentType } from "react"

export interface MainNavItem {
  title: string
  href?: string
  icon?: ComponentType<any>
  disabled?: boolean
  external?: boolean
}



