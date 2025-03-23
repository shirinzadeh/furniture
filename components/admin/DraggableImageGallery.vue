<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- TransitionGroup for draggable images -->
      <TransitionGroup name="image-list" tag="div" class="contents">
        <!-- Image items -->
        <div
          v-for="(image, index) in images"
          :key="image + index"
          class="relative image-item"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover.prevent
          @dragenter.prevent="onDragEnter($event, index)"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop($event, index)"
          @dragend="onDragEnd"
          :class="{
            'opacity-60 scale-95': isDragging === index,
            'border-2 border-gray-800 shadow-lg transform scale-105 z-10': dragTarget === index && isDragging !== -1
          }"
        >
          <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-md overflow-hidden transition-all duration-200">
            <img :src="image" alt="" class="w-full h-full object-center object-cover" />
            
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
              <div class="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                <Icon name="mdi:drag" class="h-4 w-4 inline-block mr-1" /> Drag to reorder
              </div>
            </div>
          </div>
          <button
            type="button"
            @click.prevent="removeImage(index)"
            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-transform hover:scale-110 focus:outline-none"
          >
            <Icon name="mdi:close" class="h-4 w-4" />
          </button>
          
          <!-- First image badge -->
          <div v-if="index === 0" class="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center">
            <Icon name="mdi:image-filter-hdr" class="h-3 w-3 mr-1" /> Primary
          </div>
        </div>
      </TransitionGroup>

      <!-- Add Image Box -->
      <div
        v-if="images.length < maxImages"
        class="aspect-w-1 aspect-h-1 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <slot name="uploader"></slot>
      </div>
    </div>
    <p class="text-sm text-gray-500">
      <slot name="description">
        Add up to {{ maxImages }} images. First image will be used as the product thumbnail. Drag images to reorder.
      </slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  images: string[]
  maxImages?: number
}>()

const emit = defineEmits<{
  (e: 'update:images', value: string[]): void
  (e: 'remove', index: number): void
}>()

// Default max images if not provided
const maxImages = props.maxImages || 8

// Track drag state
const isDragging = ref(-1)
const dragTarget = ref(-1)

// Drag and drop handlers
const onDragStart = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
    isDragging.value = index
    
    // Add delay to make the dragged element semi-transparent
    setTimeout(() => {
      if (event.target instanceof HTMLElement) {
        event.target.classList.add('dragging')
      }
    }, 0)
  }
}

const onDragEnter = (event: DragEvent, index: number) => {
  if (isDragging.value !== -1 && isDragging.value !== index) {
    dragTarget.value = index
  }
}

const onDragLeave = () => {
  // Keep the dragTarget value to ensure consistent UI
}

const onDrop = (event: DragEvent, dropIndex: number) => {
  if (!event.dataTransfer) return
  
  const dragIndex = parseInt(event.dataTransfer.getData('text/plain'))
  if (dragIndex === dropIndex) return

  // Make a copy of the images array
  const newImages = [...props.images]
  
  // Remove the dragged item
  const draggedItem = newImages.splice(dragIndex, 1)[0]
  
  // Insert it at the drop position
  newImages.splice(dropIndex, 0, draggedItem)
  
  // Emit the updated array
  emit('update:images', newImages)
  
  // Reset drag state
  onDragEnd()
}

const onDragEnd = () => {
  isDragging.value = -1
  dragTarget.value = -1
  
  // Remove dragging class from all elements
  document.querySelectorAll('.dragging').forEach((el) => {
    el.classList.remove('dragging')
  })
}

// Remove image
const removeImage = (index: number) => {
  emit('remove', index)
}
</script>

<style scoped>
[draggable="true"] {
  cursor: move;
  transition: transform 0.2s, opacity 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.dragging {
  opacity: 0.5;
}

.image-list-move, /* apply transition to moving elements */
.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.5s ease;
}

.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of the flow for accurate positioning */
.image-list-leave-active {
  position: absolute;
}
</style> 