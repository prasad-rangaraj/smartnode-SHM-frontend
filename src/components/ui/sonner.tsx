import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          error: "group-[.toaster]:bg-rose-50 group-[.toaster]:border-rose-200 group-[.toaster]:text-rose-900 border-2",
          success: "group-[.toaster]:bg-emerald-50 group-[.toaster]:border-emerald-200 group-[.toaster]:text-emerald-900 border-2",
          warning: "group-[.toaster]:bg-amber-50 group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-900 border-2",
          info: "group-[.toaster]:bg-slate-50 group-[.toaster]:border-slate-200 group-[.toaster]:text-slate-900 border-2",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:!bg-white/20 group-[.toast]:!border-black/5 group-[.toast]:!text-slate-700 group-[.toast]:!right-3 group-[.toast]:!top-3 group-[.toast]:!left-auto hover:!bg-black/10 transition-all",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
