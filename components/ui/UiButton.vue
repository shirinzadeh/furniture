<script setup lang="ts">
import { NuxtLink } from '#components'
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  rounded?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  href?: string
  to?: string
  target?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  rounded: false,
  loading: false,
  disabled: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

// Compute button classes based on props
const buttonClasses = computed(() => {
  const classes = ['btn']
  
  // Add variant class
  classes.push(`btn-${props.variant}`)
  
  // Add size class
  classes.push(`btn-${props.size}`)
  
  // Add full width class if needed
  if (props.fullWidth) {
    classes.push('btn-full')
  }
  
  // Add rounded class if needed
  if (props.rounded) {
    classes.push('btn-rounded')
  }
  
  // Add disabled class
  if (props.disabled) {
    classes.push('btn-disabled')
  }
  
  // Add loading class
  if (props.loading) {
    classes.push('btn-loading')
  }
  
  return classes.join(' ')
})

// Determine what component to render
const componentType = computed(() => {
  if (props.to) return NuxtLink
  if (props.href) return 'a'
  return 'button'
})
</script>

<template>
  <component 
    :is="componentType"
    :class="buttonClasses"
    :type="componentType === 'button' ? type : undefined"
    :href="href"
    :to="to"
    :target="target"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    
    <!-- Button Content -->
    <span class="btn-content">
      <slot></slot>
    </span>
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
}

/* Size variants */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.btn-md {
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  line-height: 1.5;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  line-height: 1.5;
}

/* Full width */
.btn-full {
  width: 100%;
  display: flex;
}

/* Rounded */
.btn-rounded {
  border-radius: 9999px;
}

/* Primary variant - amber theme for furniture */
.btn-primary {
  background-color: #b45309; /* amber-700 */
  color: white;
  border-color: #b45309;
}

.btn-primary:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: #92400e; /* amber-800 */
  border-color: #92400e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:active:not(.btn-disabled):not(.btn-loading) {
  background-color: #78350f; /* amber-900 */
  border-color: #78350f;
  transform: translateY(0);
}

/* Secondary variant - neutral/gray for furniture */
.btn-secondary {
  background-color: #1f2937; /* gray-800 */
  color: white;
  border-color: #1f2937;
}

.btn-secondary:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: #111827; /* gray-900 */
  border-color: #111827;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-secondary:active:not(.btn-disabled):not(.btn-loading) {
  background-color: #111827; /* gray-900 */
  border-color: #111827;
  transform: translateY(0);
}

/* Outline variant */
.btn-outline {
  background-color: transparent;
  color: #b45309; /* amber-700 */
  border-color: #b45309;
}

.btn-outline:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: rgba(180, 83, 9, 0.05);
  color: #92400e; /* amber-800 */
  border-color: #92400e;
  transform: translateY(-1px);
}

.btn-outline:active:not(.btn-disabled):not(.btn-loading) {
  background-color: rgba(180, 83, 9, 0.1);
  transform: translateY(0);
}

/* Ghost variant */
.btn-ghost {
  background-color: transparent;
  color: #4b5563; /* gray-600 */
  border-color: transparent;
}

.btn-ghost:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: rgba(75, 85, 99, 0.05);
  color: #1f2937; /* gray-800 */
}

.btn-ghost:active:not(.btn-disabled):not(.btn-loading) {
  background-color: rgba(75, 85, 99, 0.1);
}

/* Link variant */
.btn-link {
  background-color: transparent;
  color: #b45309; /* amber-700 */
  border-color: transparent;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.btn-link:hover:not(.btn-disabled):not(.btn-loading) {
  color: #92400e; /* amber-800 */
  text-decoration: underline;
}

/* Danger variant */
.btn-danger {
  background-color: #ef4444; /* red-500 */
  color: white;
  border-color: #ef4444;
}

.btn-danger:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: #dc2626; /* red-600 */
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-danger:active:not(.btn-disabled):not(.btn-loading) {
  background-color: #b91c1c; /* red-700 */
  border-color: #b91c1c;
  transform: translateY(0);
}

/* Disabled state */
.btn-disabled {
  opacity: 0.65;
  pointer-events: none;
  cursor: not-allowed;
}

/* Loading state */
.btn-loading {
  cursor: wait;
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Make sure content is centered */
.btn-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style> 