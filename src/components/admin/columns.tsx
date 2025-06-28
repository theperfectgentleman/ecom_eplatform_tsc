"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Account, AccessLevel } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { accessLevelColors, userTypeColors } from "@/lib/permissions"

interface ColumnsProps {
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Account>[] => [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => {
      const account = row.original
      return `${account.firstname} ${account.lastname}`
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "user_type",
    header: "Role",
    cell: ({ row }) => {
      const account = row.original
      return (
        <Badge
          className={cn(
            "text-white",
            userTypeColors[account.user_type] || "bg-gray-400"
          )}
        >
          {account.user_type.toUpperCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "access_level",
    header: "Access Level",
    cell: ({ row }) => {
      const account = row.original
      const accessLevelLabel = AccessLevel[account.access_level] || String(account.access_level)
      return (
        <Badge
          className={cn(
            "text-white",
            accessLevelColors[account.access_level] || "bg-gray-400"
          )}
        >
          {accessLevelLabel.toUpperCase()}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(account.account_id)}
            >
              Copy account ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(account)}>View/Edit account</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(account)} className="text-red-600 hover:text-red-700! hover:bg-red-100!">Delete account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
