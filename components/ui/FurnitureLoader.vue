<template>
  <div class="furniture-loader fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="furniture-pattern"></div>
    </div>
    
    <!-- Main Loading Content -->
    <div class="relative text-center">
      <!-- Animated Furniture Scene -->
      <div class="mb-8 relative">
        <!-- Living Room Scene -->
        <div class="furniture-scene">
          <!-- Sofa Animation -->
          <div class="furniture-item sofa" :class="{ 'animate': isAnimating }">
            <svg width="120" height="60" viewBox="0 0 120 60" class="sofa-svg">
              <defs>
                <linearGradient id="sofaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#d97706"/>
                  <stop offset="100%" style="stop-color:#b45309"/>
                </linearGradient>
              </defs>
              <!-- Sofa Base -->
              <rect x="10" y="35" width="100" height="20" rx="5" fill="url(#sofaGradient)" />
              <!-- Sofa Back -->
              <rect x="15" y="15" width="90" height="25" rx="8" fill="url(#sofaGradient)" />
              <!-- Sofa Arms -->
              <rect x="10" y="20" width="15" height="35" rx="5" fill="#b45309" />
              <rect x="95" y="20" width="15" height="35" rx="5" fill="#b45309" />
              <!-- Cushions -->
              <circle cx="35" cy="30" r="8" fill="#f59e0b" opacity="0.8" />
              <circle cx="60" cy="30" r="8" fill="#f59e0b" opacity="0.8" />
              <circle cx="85" cy="30" r="8" fill="#f59e0b" opacity="0.8" />
            </svg>
          </div>
          
          <!-- Coffee Table Animation -->
          <div class="furniture-item table" :class="{ 'animate': isAnimating }">
            <svg width="80" height="40" viewBox="0 0 80 40" class="table-svg">
              <defs>
                <linearGradient id="tableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#92400e"/>
                  <stop offset="100%" style="stop-color:#78350f"/>
                </linearGradient>
              </defs>
              <!-- Table Top -->
              <ellipse cx="40" cy="15" rx="35" ry="8" fill="url(#tableGradient)" />
              <!-- Table Legs -->
              <rect x="15" y="20" width="4" height="15" fill="#78350f" />
              <rect x="61" y="20" width="4" height="15" fill="#78350f" />
              <rect x="15" y="35" width="50" height="3" rx="1" fill="#78350f" opacity="0.6" />
            </svg>
          </div>
          
          <!-- Chair Animation -->
          <div class="furniture-item chair" :class="{ 'animate': isAnimating }">
            <svg width="50" height="70" viewBox="0 0 50 70" class="chair-svg">
              <defs>
                <linearGradient id="chairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#fbbf24"/>
                  <stop offset="100%" style="stop-color:#f59e0b"/>
                </linearGradient>
              </defs>
              <!-- Chair Back -->
              <rect x="10" y="10" width="30" height="35" rx="5" fill="url(#chairGradient)" />
              <!-- Chair Seat -->
              <rect x="8" y="40" width="34" height="15" rx="3" fill="#f59e0b" />
              <!-- Chair Legs -->
              <rect x="12" y="55" width="3" height="12" fill="#d97706" />
              <rect x="35" y="55" width="3" height="12" fill="#d97706" />
              <rect x="12" y="25" width="3" height="15" fill="#d97706" />
              <rect x="35" y="25" width="3" height="15" fill="#d97706" />
            </svg>
          </div>
          
          <!-- Decorative Elements -->
          <div class="floating-elements">
            <div class="floating-dot" style="--delay: 0s"></div>
            <div class="floating-dot" style="--delay: 0.5s"></div>
            <div class="floating-dot" style="--delay: 1s"></div>
            <div class="floating-dot" style="--delay: 1.5s"></div>
          </div>
        </div>
      </div>
      
      <!-- Brand Logo and Text -->
      <div class="mb-6">
        <div class="flex items-center justify-center space-x-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Icon name="ph:chair" size="28" class="text-white" />
          </div>
          <h1 class="text-4xl font-serif font-bold bg-gradient-to-r from-amber-800 to-amber-900 bg-clip-text text-transparent">
            MEBEL
          </h1>
        </div>
        <p class="text-amber-700 font-medium tracking-wide">Evinizi Yeniden Keşfedin</p>
      </div>
      
      <!-- Animated Progress Bar -->
      <div class="w-64 mx-auto mb-6">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          <div class="progress-text">{{ Math.round(progress) }}%</div>
        </div>
      </div>
      
      <!-- Loading Text -->
      <div class="loading-text">
        <span v-for="(char, index) in loadingText" :key="index" 
              class="loading-char" 
              :style="{ animationDelay: (index * 0.1) + 's' }">
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
      </div>
      
      <!-- Loading Steps -->
      <div class="mt-6 text-sm text-amber-600">
        <p class="loading-step" :class="{ active: currentStep >= 1 }">
          <Icon name="ph:check-circle" v-if="currentStep > 1" class="inline mr-1" />
          <Icon name="ph:spinner" v-else class="inline mr-1 animate-spin" />
          Ürünler hazırlanıyor...
        </p>
        <p class="loading-step" :class="{ active: currentStep >= 2 }">
          <Icon name="ph:check-circle" v-if="currentStep > 2" class="inline mr-1" />
          <Icon name="ph:spinner" v-else-if="currentStep === 2" class="inline mr-1 animate-spin" />
          <Icon name="ph:circle" v-else class="inline mr-1 opacity-30" />
          Kategoriler yükleniyor...
        </p>
        <p class="loading-step" :class="{ active: currentStep >= 3 }">
          <Icon name="ph:check-circle" v-if="currentStep > 3" class="inline mr-1" />
          <Icon name="ph:spinner" v-else-if="currentStep === 3" class="inline mr-1 animate-spin" />
          <Icon name="ph:circle" v-else class="inline mr-1 opacity-30" />
          Öneriler hazırlanıyor...
        </p>
      </div>
    </div>
    
    <!-- Animated Background Elements -->
    <div class="background-animations">
      <div class="bg-element bg-element-1"></div>
      <div class="bg-element bg-element-2"></div>
      <div class="bg-element bg-element-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress?: number
  currentStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  currentStep: 1
})

const isAnimating = ref(true)
const loadingText = 'Mobilyalar hazırlanıyor...'

onMounted(() => {
  // Start animations
  setTimeout(() => {
    isAnimating.value = true
  }, 500)
})
</script>

<style scoped>
.furniture-loader {
  backdrop-filter: blur(8px);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.furniture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23d97706' fill-opacity='0.4'/%3E%3C/svg%3E");
  animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(100px) translateY(100px);
  }
}

.furniture-scene {
  position: relative;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.furniture-item {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(20px) scale(0.8);
  opacity: 0;
}

.furniture-item.animate {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.furniture-item.sofa {
  animation: sofaBounce 3s ease-in-out infinite;
  animation-delay: 0.5s;
}

.furniture-item.table {
  animation: tableFloat 2.5s ease-in-out infinite;
  animation-delay: 1s;
}

.furniture-item.chair {
  animation: chairSway 2s ease-in-out infinite;
  animation-delay: 1.5s;
}

@keyframes sofaBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.05);
  }
}

@keyframes tableFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(1deg);
  }
}

@keyframes chairSway {
  0%, 100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-2px) rotate(1deg);
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.floating-dot:nth-child(1) { top: 20%; left: 10%; }
.floating-dot:nth-child(2) { top: 30%; right: 15%; }
.floating-dot:nth-child(3) { bottom: 25%; left: 20%; }
.floating-dot:nth-child(4) { bottom: 15%; right: 10%; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px) scale(1.2);
    opacity: 1;
  }
}

.progress-container {
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(217, 119, 6, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706);
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  animation: progressShine 1.5s ease-in-out infinite;
}

@keyframes progressShine {
  0% {
    transform: translateX(-20px);
  }
  100% {
    transform: translateX(20px);
  }
}

.progress-text {
  position: absolute;
  top: -25px;
  right: 0;
  font-size: 12px;
  font-weight: 600;
  color: #b45309;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: #b45309;
  letter-spacing: 0.5px;
}

.loading-char {
  display: inline-block;
  animation: charBounce 1.5s ease-in-out infinite;
}

@keyframes charBounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
}

.loading-step {
  margin: 4px 0;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.loading-step.active {
  opacity: 1;
  color: #b45309;
}

.background-animations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.bg-element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
  animation: backgroundFloat 6s ease-in-out infinite;
}

.bg-element-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bg-element-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.bg-element-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes backgroundFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.6;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .furniture-scene {
    height: 120px;
    gap: 15px;
  }
  
  .furniture-item svg {
    transform: scale(0.8);
  }
  
  .loading-text {
    font-size: 16px;
  }
  
  .progress-container {
    width: 200px;
  }
}

/* Exit Animation */
.furniture-loader.fade-out {
  animation: fadeOut 0.8s ease-in-out forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.05);
  }
}
</style> 