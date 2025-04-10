import * as React from "react";
import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

const Alert = ({ children, className, variant = "default", ...props }) => {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variant === "destructive"
          ? "border-red-400 bg-red-100 text-red-800"
          : "border-gray-300 bg-gray-50 text-gray-800",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 mt-1" />
        <div>{children}</div>
      </div>
    </div>
  );
};

const AlertDescription = ({ children, className }) => {
  return (
    <p className={cn("text-sm", className)}>
      {children}
    </p>
  );
};

export { Alert, AlertDescription };
