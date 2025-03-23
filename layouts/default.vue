<template>
  <div class="min-h-screen flex flex-col bg-warmWhite">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// Import global CSS
import '@/assets/css/furniture-theme.css'
</script>

<style>
.bg-warmWhite {
  background-color: var(--color-warm-white);
}
</style>

