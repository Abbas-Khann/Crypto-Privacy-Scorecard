'use client'

import { motion } from 'framer-motion'

interface ScoreCircleProps {
  score: number
  size?: number
}

export default function ScoreCircle({ score, size = 200 }: ScoreCircleProps) {
  // Calculate color based on score
  const getColor = () => {
    if (score >= 70) return '#00FFFF' // Cyan for good
    if (score >= 50) return '#FF9900' // Orange for warning
    return '#FF00FF' // Magenta for poor
  }

  const color = getColor()
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: color }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2D1B4E"
          strokeWidth={8}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="square"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
          }}
        />

        {/* Inner decorative circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 20}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-heading font-black text-foreground"
          style={{
            fontSize: size * 0.25,
            textShadow: `0 0 20px ${color}`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span
          className="font-mono text-foreground/50 uppercase tracking-widest"
          style={{ fontSize: size * 0.06 }}
        >
          / 100
        </span>
      </div>

      {/* Corner decorations */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}
