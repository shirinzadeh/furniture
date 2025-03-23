<template>
  <div class="min-h-screen p-8 bg-gray-50">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">API Debug Page</h1>
    
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Products API Test</h2>
      <div class="flex flex-wrap gap-3 mb-4">
        <button 
          @click="testProductsApi" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="isLoading"
        >
          Test Products API
        </button>
        <button 
          @click="testProductsApiWithTimeout" 
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          :disabled="isLoading"
        >
          Test With 30s Timeout
        </button>
        <button 
          @click="clearResults" 
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
        <NuxtLink 
          to="/products" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Products Page
        </NuxtLink>
      </div>
      
      <div class="flex flex-wrap gap-3 mb-4">
        <button 
          @click="checkMongoDBConnection" 
          class="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          :disabled="isLoading"
        >
          Check Database Connection
        </button>
        <button 
          @click="checkServerStatus" 
          class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          :disabled="isLoading"
        >
          Check Server Status
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="mb-4 p-4 bg-blue-100 rounded">
      <p class="font-semibold">Loading... {{ loadingSteps[loadingSteps.length - 1] }}</p>
      <ul class="mt-2 text-xs text-gray-700 list-disc pl-5">
        <li v-for="(step, index) in loadingSteps" :key="index">
          {{ step }}
        </li>
      </ul>
      <div v-if="timePassed > 0" class="mt-2 text-sm">
        Time elapsed: {{ timePassed }}s
      </div>
    </div>
    
    <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-800 rounded">
      <h3 class="font-bold">Error:</h3>
      <pre class="whitespace-pre-wrap">{{ error }}</pre>
    </div>
    
    <div v-if="connectionStatus" class="mb-4 p-4" :class="{'bg-green-100': connectionStatus.success, 'bg-red-100': !connectionStatus.success}">
      <h3 class="font-bold">Connection Status:</h3>
      <pre class="whitespace-pre-wrap">{{ JSON.stringify(connectionStatus, null, 2) }}</pre>
    </div>
    
    <div v-if="rawResponse" class="mb-4">
      <h3 class="font-bold mb-2">Raw Response:</h3>
      <div v-if="typeof rawResponse === 'string'" class="p-4 bg-red-100 rounded overflow-auto max-h-96 whitespace-pre-wrap">
        <p>Response is not JSON. Received HTML or other format:</p>
        <pre class="mt-2 text-xs">{{ rawResponsePreview }}</pre>
      </div>
      <pre v-else class="p-4 bg-gray-100 rounded overflow-auto max-h-96 whitespace-pre-wrap">{{ JSON.stringify(rawResponse, null, 2) }}</pre>
    </div>
    
    <div v-if="products.length > 0" class="mb-8">
      <h3 class="font-bold mb-2">Products ({{ products.length }}):</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in products" :key="product.id" class="p-4 bg-white rounded shadow">
          <h4 class="font-bold">{{ product.name }}</h4>
          <p class="text-sm text-gray-500">ID: {{ product.id }}</p>
          <p>Price: {{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// Define a type for the product
interface Product {
  id: string
  name: string
  slug: string
  price: number
  [key: string]: any
}

// Define a type for the API response
interface ProductsApiResponse {
  products: Product[]
  count: number
  debug?: {
    executionTime: number
    timestamp: string
  }
}

// State
const isLoading = ref(false)
const error = ref('')
const products = ref<Product[]>([])
const rawResponse = ref<any>(null)
const loadingSteps = ref<string[]>([])
const timePassed = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const connectionStatus = ref<any>(null)

// Preview the raw response for non-JSON responses
const rawResponsePreview = computed(() => {
  if (typeof rawResponse.value === 'string') {
    return rawResponse.value.length > 500 
      ? rawResponse.value.substring(0, 500) + '...'
      : rawResponse.value;
  }
  return '';
});

// Start a timer to track how long the API call takes
function startTimer() {
  timePassed.value = 0
  if (timer.value) clearInterval(timer.value)
  
  timer.value = setInterval(() => {
    timePassed.value++
    // Auto-cancel after 3 minutes to prevent hanging
    if (timePassed.value > 180) {
      stopTimer()
      if (isLoading.value) {
        isLoading.value = false
        error.value = "Request timed out after 3 minutes"
      }
    }
  }, 1000)
}

function stopTimer() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// Clean up on component unmount
onUnmounted(() => {
  stopTimer()
})

// Test the products API with detailed logging
async function testProductsApi() {
  isLoading.value = true
  error.value = ''
  rawResponse.value = null
  products.value = []
  loadingSteps.value = ['Starting API request']
  startTimer()
  
  try {
    // Log the start of the request
    loadingSteps.value.push('Sending fetch request to /api/products')
    console.log('Starting fetch request to /api/products')
    
    // Use a direct, simple fetch without signals or complex options
    const response = await fetch('/api/products');
    
    loadingSteps.value.push(`Received response with status: ${response.status}`)
    console.log(`Received response with status: ${response.status}`)
    
    // First check if the response is ok
    if (!response.ok) {
      loadingSteps.value.push(`Error: API returned ${response.status} ${response.statusText}`)
      error.value = `API Error: ${response.status} ${response.statusText}`;
      
      // Try to get response text for more details
      try {
        const errorText = await response.text();
        rawResponse.value = errorText;
      } catch {
        // Ignore text parsing errors
      }
      return;
    }
    
    // Try to parse the response as JSON
    try {
      const jsonData = await response.json();
      loadingSteps.value.push('Successfully parsed JSON response')
      rawResponse.value = jsonData;
      
      // Check if response contains products and is valid
      if (jsonData && Array.isArray(jsonData.products)) {
        loadingSteps.value.push(`Found ${jsonData.products.length} products in response`)
        products.value = jsonData.products;
      } else if (jsonData && jsonData.error) {
        // Handle error response from API
        loadingSteps.value.push(`API returned error: ${jsonData.error}`)
        error.value = jsonData.error;
      } else {
        loadingSteps.value.push('Response does not contain a valid products array')
        error.value = 'Received response but no products array found';
      }
    } catch (parseError) {
      // If JSON parsing fails, get the raw text
      loadingSteps.value.push('Failed to parse JSON response')
      console.error('Failed to parse JSON response', parseError);
      
      try {
        const textResponse = await response.text();
        rawResponse.value = textResponse;
        error.value = 'Received non-JSON response from API';
      } catch {
        error.value = 'Failed to retrieve response content';
      }
    }
  } catch (err) {
    // Network or other critical errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    loadingSteps.value.push(`Network error: ${errorMessage}`)
    console.error('Error testing products API:', err)
    error.value = `Network error: ${errorMessage}`;
  } finally {
    loadingSteps.value.push('Request completed')
    isLoading.value = false
    stopTimer()
  }
}

// Test the products API with a 30-second timeout
async function testProductsApiWithTimeout() {
  isLoading.value = true
  error.value = ''
  rawResponse.value = null
  products.value = []
  loadingSteps.value = ['Starting API request with timeout']
  startTimer()
  
  // Set up a simple timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
    if (isLoading.value) {
      error.value = 'Request timed out after 30 seconds';
      isLoading.value = false;
      stopTimer();
      loadingSteps.value.push('Request aborted due to timeout');
    }
  }, 30000);
  
  try {
    loadingSteps.value.push('Sending fetch request with timeout')
    
    // Simpler fetch with just the abort controller
    const response = await fetch('/api/products', {
      signal: abortController.signal,
    });
    
    loadingSteps.value.push(`Received response with status: ${response.status}`)
    
    if (!response.ok) {
      error.value = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        rawResponse.value = errorText;
      } catch {
        // Ignore text parsing errors
      }
      return;
    }
    
    // Parse JSON response
    try {
      const jsonData = await response.json();
      rawResponse.value = jsonData;
      
      if (jsonData && Array.isArray(jsonData.products)) {
        loadingSteps.value.push(`Found ${jsonData.products.length} products in response`);
        products.value = jsonData.products;
      } else if (jsonData && jsonData.error) {
        loadingSteps.value.push(`API returned error: ${jsonData.error}`);
        error.value = jsonData.error;
      } else {
        error.value = 'Received response but no products array found';
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response', parseError);
      try {
        const textResponse = await response.text();
        rawResponse.value = textResponse;
        error.value = 'Received non-JSON response from API';
      } catch {
        error.value = 'Failed to retrieve response content';
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // This is handled by the timeout above
    } else {
      const errorMessage = err instanceof Error ? err.message : String(err);
      loadingSteps.value.push(`Error: ${errorMessage}`);
      error.value = `Network error: ${errorMessage}`;
    }
  } finally {
    clearTimeout(timeoutId);
    if (isLoading.value) {
      loadingSteps.value.push('Request completed');
      isLoading.value = false;
      stopTimer();
    }
  }
}

// Check MongoDB connection
async function checkMongoDBConnection() {
  isLoading.value = true
  error.value = ''
  connectionStatus.value = null
  loadingSteps.value = ['Checking MongoDB connection']
  startTimer()
  
  try {
    loadingSteps.value.push('Sending request to check database connection')
    const response = await fetch('/api/debug/db-status');
    
    loadingSteps.value.push(`Received response with status: ${response.status}`)
    
    if (!response.ok) {
      error.value = `API Error: ${response.status} ${response.statusText}`;
      return;
    }
    
    const data = await response.json();
    connectionStatus.value = data;
    
    loadingSteps.value.push(`Connection status: ${data.success ? 'Connected' : 'Failed'}`)
  } catch (err: any) {
    loadingSteps.value.push(`Error checking database: ${err?.message || 'Unknown error'}`)
    error.value = err?.message || JSON.stringify(err);
  } finally {
    isLoading.value = false
    stopTimer()
  }
}

// Check server status
async function checkServerStatus() {
  isLoading.value = true
  error.value = ''
  connectionStatus.value = null
  loadingSteps.value = ['Checking server status']
  startTimer()
  
  try {
    loadingSteps.value.push('Sending request to check server status')
    const response = await fetch('/api/debug/server-status');
    
    loadingSteps.value.push(`Received response with status: ${response.status}`)
    
    if (!response.ok) {
      error.value = `API Error: ${response.status} ${response.statusText}`;
      return;
    }
    
    const data = await response.json();
    connectionStatus.value = data;
    
    loadingSteps.value.push('Server status retrieved successfully')
  } catch (err: any) {
    loadingSteps.value.push(`Error checking server: ${err?.message || 'Unknown error'}`)
    error.value = err?.message || JSON.stringify(err);
  } finally {
    isLoading.value = false
    stopTimer()
  }
}

// Clear all results
function clearResults() {
  error.value = ''
  rawResponse.value = null
  products.value = []
  connectionStatus.value = null
  loadingSteps.value = []
}
</script> 