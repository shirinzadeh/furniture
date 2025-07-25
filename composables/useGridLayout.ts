import { computed } from 'vue'

export interface GridLayoutOptions {
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | string
  minCols?: number
  maxCols?: number
}

export const useGridLayout = (options: GridLayoutOptions = {}) => {
  const {
    cols = {
      sm: 2,
      md: 2,
      lg: 3,
      xl: 4,
      '2xl': 4
    },
    gap = 6,
    minCols = 2, // Default to 2 columns on mobile
    maxCols = 6
  } = options

  // Generate responsive grid classes
  const gridClasses = computed(() => {
    const classes = [`grid`, `grid-cols-${minCols}`]
    
    if (cols.sm) classes.push(`sm:grid-cols-${Math.min(cols.sm, maxCols)}`)
    if (cols.md) classes.push(`md:grid-cols-${Math.min(cols.md, maxCols)}`)
    if (cols.lg) classes.push(`lg:grid-cols-${Math.min(cols.lg, maxCols)}`)
    if (cols.xl) classes.push(`xl:grid-cols-${Math.min(cols.xl, maxCols)}`)
    if (cols['2xl']) classes.push(`2xl:grid-cols-${Math.min(cols['2xl'], maxCols)}`)
    
    classes.push(`gap-${gap}`)
    
    return classes.join(' ')
  })

  // Common product grid classes
  const productGridClasses = computed(() => {
    return 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
  })

  // Loading skeleton classes
  const loadingSkeletonClasses = computed(() => {
    return 'bg-gray-200 animate-pulse rounded-lg h-80'
  })

  // Category grid classes
  const categoryGridClasses = computed(() => {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
  })

  return {
    gridClasses,
    productGridClasses,
    loadingSkeletonClasses,
    categoryGridClasses
  }
} 