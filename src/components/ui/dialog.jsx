// shadcn/ui composition using Radix Dialog for focus management and Escape handling.
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
export function Modal({open,onOpenChange,title,description,children}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/60"/><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-background p-6 shadow-2xl sm:p-8"><Dialog.Title className="pr-10 font-sans text-2xl font-semibold tracking-tight">{title}</Dialog.Title><Dialog.Description className="mt-2 mb-6 text-sm text-muted-foreground">{description}</Dialog.Description>{children}<Dialog.Close className="absolute right-4 top-4 grid size-11 place-items-center rounded-full hover:bg-muted" aria-label="Close dialog"><X size={20}/></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
}
