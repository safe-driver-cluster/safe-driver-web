"use client"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function toast({ title, description, variant = "default" }: ToastProps) {
  // Simple toast implementation - in a real app you'd use a proper toast library
  console.log(`Toast: ${title} - ${description}`)

  // Create a simple toast notification
  const toastElement = document.createElement("div")
  toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
    variant === "destructive" ? "bg-red-500 text-white" : "bg-green-500 text-white"
  }`
  toastElement.innerHTML = `
    <div class="font-medium">${title}</div>
    <div class="text-sm opacity-90">${description}</div>
  `

  document.body.appendChild(toastElement)

  setTimeout(() => {
    document.body.removeChild(toastElement)
  }, 3000)
}

export function useToast() {
  return { toast }
}
