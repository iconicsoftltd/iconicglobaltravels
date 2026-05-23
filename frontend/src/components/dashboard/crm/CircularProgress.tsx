interface CircularProgressProps {
  percentage: number;
  color: string;
  isPositive: boolean;
}

const CircularProgress = ({ percentage, color, isPositive }: CircularProgressProps) => {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
        {/* Background/Trail Circle */}
        <circle
          className="text-gray-100 dark:text-gray-800" // Using more neutral gray as in the full code
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="30"
          cy="30"
        />
        {/* Progress Circle (Path) */}
        <circle
          strokeWidth="6"
          stroke={"#735FDE"}
          // stroke={color}
          fill="transparent"
          r={radius}
          cx="30"
          cy="30"
          strokeLinecap="round" // <--- ADDED THIS LINE FOR ROUNDED ENDS
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.35s',
            // Added drop-shadow from the previous full code, if you want it
            filter: 'drop-shadow(0 0 2px rgba(91, 65, 225, 0.4))'
          }}
        />
      </svg>
      {/* Percentage Text (The large +74% text) */}
      <span
        className={`absolute text-sm font-semibold`}
        style={{ color: color }}
      >
        {percentage > 0 && isPositive ? `+${percentage}%` : `${percentage}%`}
      </span>
    </div>
  );
};

export default CircularProgress;