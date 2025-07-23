import { ref } from 'vue'

export interface SortOption {
  label: string
  value: string
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'En Yeniler', value: 'newest' },
  { label: 'Fiyat (Artan)', value: 'price_asc' },
  { label: 'Fiyat (Azalan)', value: 'price_desc' },
  { label: 'İsim (A-Z)', value: 'name_asc' },
  { label: 'İsim (Z-A)', value: 'name_desc' },
]

export const useProductSort = (defaultSort: string = 'newest') => {
  const selectedSort = ref(defaultSort)
  
  const sortOptions = SORT_OPTIONS
  
  const resetSort = () => {
    selectedSort.value = defaultSort
  }
  
  const getSortLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || ''
  }
  
  return {
    selectedSort,
    sortOptions,
    resetSort,
    getSortLabel
  }
} 