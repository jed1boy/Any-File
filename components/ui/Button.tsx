import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-black text-white hover:bg-slate-800 border border-transparent",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent",
      outline: "bg-transparent text-black border-2 border-slate-200 hover:border-black",
      ghost: "bg-transparent text-slate-600 hover:text-black hover:bg-slate-50",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs uppercase tracking-wider",
      md: "h-12 px-6 text-sm uppercase tracking-widest",
      lg: "h-14 px-8 text-base uppercase tracking-widest",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...(props as any)} // Cast to any to avoid complex type intersection issues with Motion
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
