interface DividerProps {
  className?: string;
  spacing?: "no-space" | "tiny" | "sm" | "md" | "lg";
  color?: string;
}

export default function Divider({
  className = "",
  spacing = "md",
  color = "secondary/20",
}: DividerProps) {
  const spacingClasses = {
    "no-space": "",
    tiny: "my-1",
    sm: "my-3",
    md: "my-4",
    lg: "my-8",
  };

  return (
    <div
      className={`w-full border-b border-${color} ${
        spacingClasses[spacing]
      } ${className}`}
    />
  );
}
