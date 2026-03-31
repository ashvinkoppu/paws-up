import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const VARIANT_ICONS: Record<string, React.ReactNode> = {
  success: (
    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
  ),
  destructive: <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
  warning: (
    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
  ),
  info: <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />,
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        const icon = variant ? VARIANT_ICONS[variant] : undefined;
        return (
          <Toast key={id} variant={variant} {...props}>
            {icon}
            <div className="flex-1 min-w-0">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
