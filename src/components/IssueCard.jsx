import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink } from 'lucide-react'

const severityConfig = {
  critical: {
    color: '#ef4444',
    bgColor: '#ef444420',
    borderColor: '#ef4444',
    badge: '🔴',
    label: 'Critical',
  },
  warning: {
    color: '#f59e0b',
    bgColor: '#f59e0b20',
    borderColor: '#f59e0b',
    badge: '🟡',
    label: 'Warning',
  },
  good: {
    color: '#10b981',
    bgColor: '#10b98120',
    borderColor: '#10b981',
    badge: '🟢',
    label: 'Good',
  },
}

export default function IssueCard({
  severity = 'warning',
  title,
  points,
  description,
  whyMatters,
  howToFix,
  learnMoreUrl,
  defaultExpanded = false,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const config = severityConfig[severity]
  const hasDetails = whyMatters || howToFix || learnMoreUrl

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.01,
        boxShadow: `0 4px 20px ${config.borderColor}15`,
        transition: { duration: 0.2 }
      }}
      transition={{ duration: 0.2 }}
      className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
        borderLeft: `3px solid ${config.borderColor}`,
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={`w-full p-4 sm:p-6 flex items-start justify-between text-left ${
          hasDetails ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Severity badge */}
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
            style={{ backgroundColor: config.bgColor }}
          >
            {config.badge}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-dark-text">{title}</h3>
              <span
                className="text-xs sm:text-sm font-medium px-2 py-0.5 rounded shrink-0"
                style={{ backgroundColor: config.bgColor, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 line-clamp-2">{description}</p>
          </div>
        </div>

        {/* Right side - points and expand */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
          <span
            className="text-sm sm:text-lg font-bold whitespace-nowrap"
            style={{ color: severity === 'good' ? '#10b981' : config.color }}
          >
            {points}
          </span>
          {hasDetails && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </motion.div>
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-800/50 sm:ml-16">
              {/* Why it matters */}
              {whyMatters && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Why it matters
                  </h4>
                  <p className="text-sm sm:text-base text-dark-text">{whyMatters}</p>
                </div>
              )}

              {/* How to fix */}
              {howToFix && howToFix.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    How to fix
                  </h4>
                  <ul className="space-y-2">
                    {howToFix.map((fix, index) => (
                      <li
                        key={index}
                        className="text-sm sm:text-base text-dark-text flex items-start gap-2"
                      >
                        <span className="text-accent-blue mt-0.5 sm:mt-1">•</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learn more link */}
              {learnMoreUrl && (
                <a
                  href={learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue-hover transition-colors text-sm sm:text-base"
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed hint */}
      {!isExpanded && hasDetails && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-0">
          <p className="text-xs sm:text-sm text-gray-500 sm:ml-16">
            Tap to expand details
          </p>
        </div>
      )}
    </motion.div>
  )
}
