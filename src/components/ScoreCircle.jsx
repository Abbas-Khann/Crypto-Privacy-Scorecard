import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e' // green
  if (score >= 60) return '#3b82f6' // blue
  if (score >= 40) return '#f59e0b' // amber
  return '#ef4444' // red
}

const getScoreStatus = (score) => {
  if (score >= 80) return { text: 'Excellent', emoji: '🛡️' }
  if (score >= 60) return { text: 'Good', emoji: '✅' }
  if (score >= 40) return { text: 'At Risk', emoji: '⚠️' }
  return { text: 'Critical', emoji: '🚨' }
}

const getGrade = (score) => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export default function ScoreCircle({ score = 42, size = 280 }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (animatedScore / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative inline-flex items-center justify-center"
    >
      {/* Background glow */}
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          backgroundColor: color,
        }}
      />

      {/* SVG Circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a1f2e"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-6xl font-bold text-dark-text"
        >
          {animatedScore}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 text-lg"
        >
          out of 100
        </motion.div>
      </div>
    </motion.div>
  )
}
