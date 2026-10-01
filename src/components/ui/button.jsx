// Adapted from shadcn/ui new-york button (MIT), with Kicks tokens and sizing.
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'
const buttonVariants = cva('inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4', {
  variants:{ variant:{ default:'bg-foreground text-background hover:bg-primary', outline:'border border-border bg-background text-foreground hover:bg-muted', ghost:'text-foreground hover:bg-muted' } },
  defaultVariants:{ variant:'default' },
})
const Button = forwardRef(({className, variant, asChild = false, ...props}, ref) => {
  const Component = asChild ? Slot : 'button'
  return <Component ref={ref} className={cn(buttonVariants({variant,className}))} {...props}/>
})
Button.displayName = 'Button'
export { Button, buttonVariants }
