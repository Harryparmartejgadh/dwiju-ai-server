'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const categories = [
  {
    id: 'ask-dwiju',
    title: 'Ask Dwiju',
    description: 'General AI assistant for any question or task',
    icon: '🤖',
    features: 150,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'dwiju-teacher',
    title: 'Dwiju Teacher',
    description: 'Educational assistance and tutoring',
    icon: '📚',
    features: 200,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'dwiju-doctor',
    title: 'Dwiju Doctor',
    description: 'Health and medical guidance',
    icon: '⚕️',
    features: 180,
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'dwiju-judge',
    title: 'Dwiju Supreme Judge',
    description: 'Legal advice and consultation',
    icon: '⚖️',
    features: 120,
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'dwiju-farmer',
    title: 'Dwiju Farmer',
    description: 'Agriculture and farming assistance',
    icon: '🌾',
    features: 160,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'dwiju-business',
    title: 'Dwiju Business',
    description: 'Business and entrepreneurship support',
    icon: '💼',
    features: 140,
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: 'dwiju-entertainment',
    title: 'Dwiju Entertainment',
    description: 'Games, stories, and entertainment',
    icon: '🎮',
    features: 170,
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'dwiju-home',
    title: 'Dwiju Home',
    description: 'Smart home and IoT management',
    icon: '🏠',
    features: 130,
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'dwiju-travel',
    title: 'Dwiju Travel',
    description: 'Travel planning and guidance',
    icon: '✈️',
    features: 110,
    gradient: 'from-sky-500 to-blue-500'
  },
  {
    id: 'dwiju-security',
    title: 'Dwiju Security',
    description: 'Cybersecurity and safety features',
    icon: '🔒',
    features: 100,
    gradient: 'from-red-600 to-red-800'
  },
  {
    id: 'dwiju-developer',
    title: 'Dwiju Developer',
    description: 'Programming and development tools',
    icon: '💻',
    features: 190,
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'dwiju-research',
    title: 'Dwiju Research',
    description: 'Research and data analysis',
    icon: '🔬',
    features: 160,
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'dwiju-social',
    title: 'Dwiju Social',
    description: 'Social media and communication',
    icon: '💬',
    features: 140,
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'dwiju-advanced',
    title: 'Dwiju Advanced',
    description: 'Advanced AI capabilities and tools',
    icon: '🚀',
    features: 150,
    gradient: 'from-orange-500 to-red-500'
  }
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="group"
        >
          <Link href={`/categories/${category.id}`}>
            <div className={`relative p-6 bg-gradient-to-br ${category.gradient} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                    {category.features} features
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>
                
                <div className="flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>Explore features</span>
                  <svg 
                    className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
