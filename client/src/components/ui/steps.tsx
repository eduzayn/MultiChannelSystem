import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepsProps {
  steps: string[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="flex w-full justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-center font-medium",
                  {
                    "border-primary bg-primary text-primary-foreground": isCompleted || isCurrent,
                    "border-muted-foreground text-muted-foreground": !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn("mt-2 text-center text-sm font-medium", {
                  "text-primary": isCurrent,
                  "text-muted-foreground": !isCurrent,
                })}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("flex-1 border-t-2 transition-colors mt-5", {
                  "border-primary": isCompleted,
                  "border-muted": !isCompleted,
                })}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}