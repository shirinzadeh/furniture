<template>
  <footer class="bg-amber-900 text-white pt-12 pb-6">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <!-- Company Info -->
        <div class="mb-8 sm:mb-0">
          <h3 class="text-xl font-serif font-bold mb-4">MEBEL</h3>
          <p class="text-amber-100 mb-4 text-sm md:text-base leading-relaxed">
            Kaliteli mobilya ve dekorasyon ürünleri ile evinizi yenileyin. Ödeme kolaylıkları ve hızlı teslimat seçenekleriyle hizmetinizdeyiz.
          </p>
          
          <!-- Social Media Icons -->
          <div class="flex space-x-4 mt-6">
            <a href="#" class="bg-amber-800 hover:bg-amber-700 p-2 rounded-full transition-colors">
              <Icon name="ph:facebook-logo" size="20" />
            </a>
            <a href="#" class="bg-amber-800 hover:bg-amber-700 p-2 rounded-full transition-colors">
              <Icon name="ph:instagram-logo" size="20" />
            </a>
            <a href="#" class="bg-amber-800 hover:bg-amber-700 p-2 rounded-full transition-colors">
              <Icon name="ph:twitter-logo" size="20" />
            </a>
            <a href="#" class="bg-amber-800 hover:bg-amber-700 p-2 rounded-full transition-colors">
              <Icon name="ph:youtube-logo" size="20" />
            </a>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div class="mb-8 sm:mb-0">
          <h3 class="text-lg font-serif font-medium mb-4">Hızlı Bağlantılar</h3>
          <ul class="space-y-2.5 text-sm md:text-base">
            <li>
              <span class="text-amber-100 inline-flex items-center cursor-not-allowed opacity-70">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Hakkımızda
              </span>
            </li>
            <li>
              <span class="text-amber-100 inline-flex items-center cursor-not-allowed opacity-70">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                İletişim
              </span>
            </li>
            <li>
              <span class="text-amber-100 inline-flex items-center cursor-not-allowed opacity-70">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Blog
              </span>
            </li>
            <li>
              <span class="text-amber-100 inline-flex items-center cursor-not-allowed opacity-70">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Sıkça Sorulan Sorular
              </span>
            </li>
            <li>
              <span class="text-amber-100 inline-flex items-center cursor-not-allowed opacity-70">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Kariyer
              </span>
            </li>
          </ul>
        </div>
        
        <!-- Categories -->
        <div class="mb-8 sm:mb-0">
          <h3 class="text-lg font-serif font-medium mb-4">Kategoriler</h3>
          <ul class="space-y-2.5 text-sm md:text-base">
            <li>
              <NuxtLink to="/living-room" class="text-amber-100 hover:text-white transition-colors inline-flex items-center">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Oturma Odası
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/bedroom" class="text-amber-100 hover:text-white transition-colors inline-flex items-center">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Yatak Odası
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dining-room" class="text-amber-100 hover:text-white transition-colors inline-flex items-center">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Yemek Odası
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/office" class="text-amber-100 hover:text-white transition-colors inline-flex items-center">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Ofis
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/kids-youth" class="text-amber-100 hover:text-white transition-colors inline-flex items-center">
                <Icon name="ph:caret-right" class="mr-2 text-amber-300" size="14"/>
                Çocuk & Genç
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Contact -->
        <div>
          <h3 class="text-lg font-serif font-medium mb-4">İletişim</h3>
          <ul class="space-y-4 text-sm md:text-base">
            <li class="flex items-start">
              <Icon name="ph:map-pin" size="20" class="mr-3 mt-1 flex-shrink-0 text-amber-300" />
              <span class="text-amber-100">İstanbul, Türkiye</span>
            </li>
            <li class="flex items-center">
              <Icon name="ph:phone" size="20" class="mr-3 flex-shrink-0 text-amber-300" />
              <span class="text-amber-100">+90 (212) 123 45 67</span>
            </li>
            <li class="flex items-center">
              <Icon name="ph:envelope-simple" size="20" class="mr-3 flex-shrink-0 text-amber-300" />
              <span class="text-amber-100">info@mebel.com</span>
            </li>
            <li class="flex items-center">
              <Icon name="ph:clock" size="20" class="mr-3 flex-shrink-0 text-amber-300" />
              <span class="text-amber-100">Pazartesi - Cumartesi: 09:00 - 18:00</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Newsletter -->
      <div class="border-t border-amber-800 pt-8 pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 class="text-lg font-serif font-medium mb-2">Bültenimize Abone Olun</h3>
            <p class="text-amber-100 text-sm md:text-base">
              Yeni ürünlerimiz ve kampanyalarımızdan haberdar olmak için abone olun.
            </p>
          </div>
          <div>
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="E-mail adresiniz"
                class="px-4 py-3 rounded-lg bg-amber-800 border border-amber-700 text-white placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-grow"
              />
              <button class="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium">
                Abone Ol
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Payment Methods -->
      <div class="border-t border-amber-800 pt-8 pb-6">
        <h3 class="text-lg font-serif font-medium mb-4 text-center sm:text-left">Ödeme Yöntemleri</h3>
        <div class="flex flex-wrap justify-center sm:justify-start gap-4">
          <div class="bg-amber-800 p-2 rounded-md">
            <Icon name="ph:credit-card" size="24" class="text-white" />
          </div>
          <div class="bg-amber-800 p-2 rounded-md">
            <Icon name="ph:bank" size="24" class="text-white" />
          </div>
          <div class="bg-amber-800 p-2 rounded-md">
            <Icon name="ph:money" size="24" class="text-white" />
          </div>
          <div class="bg-amber-800 p-2 rounded-md">
            <Icon name="ph:wallet" size="24" class="text-white" />
          </div>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-amber-800 pt-6 text-center mt-6">
        <p class="text-amber-200 text-sm">
          &copy; {{ new Date().getFullYear() }} MEBEL. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  </footer>
</template> 