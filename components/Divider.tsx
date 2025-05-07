interface DividerProps {
  className?: string;
  spacing?: "sm" | "md" | "lg";
  color?: string;
}

export default function Divider({
  className = "",
  spacing = "md",
  color = "secondary/20",
}: DividerProps) {
  const spacingClasses = {
    sm: "my-2",
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
