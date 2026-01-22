import { motion } from 'framer-motion'
import { User, Users, Trophy } from 'lucide-react'

const comparisons = [
  { label: 'Your Score', score: 42, color: '#f59e0b', isUser: true, icon: User },
  { label: 'Average User', score: 38, color: '#6b7280', isUser: false, icon: Users },
  { label: 'Privacy Pro', score: 95, color: '#22c55e', isUser: false, icon: Trophy },
]

export default function ComparisonBar({ userScore = 42 }) {
  // Calculate percentile (mock calculation)
  const percentile = Math.round((userScore / 100) * 100 * 0.56 + 20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-dark-card rounded-2xl border border-white/5 p-6 sm:p-8 w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      }}
    >
      <h3 className="text-lg sm:text-xl font-semibold text-dark-text mb-8 text-center">
        How You Compare
      </h3>

      <div className="space-y-6">
        {comparisons.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: item.color }}
                  />
                  <span
                    className={`text-sm sm:text-base font-medium ${
                      item.isUser ? 'text-dark-text' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  className="text-sm sm:text-base font-bold"
                  style={{ color: item.color }}
                >
                  {item.isUser ? userScore : item.score}/100
                </span>
              </div>
              <div className="relative h-3 sm:h-4 bg-gray-800/80 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}40`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.isUser ? userScore : item.score}%` }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Percentile message - enhanced styling */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8 pt-6 border-t border-gray-800/50 text-center"
      >
        <p className="text-xl sm:text-2xl font-bold">
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Better than {percentile}%
          </span>
          <span className="text-gray-400 font-medium ml-2">of users</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Based on privacy analysis across all chains
        </p>
      </motion.div>
    </motion.div>
  )
}
