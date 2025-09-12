<template>
  <div
      :class="['profile-picture', sizeClass]"
      :style="{
      backgroundColor: backgroundColor,
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${fontSize}px`
    }"
  >
    {{ initials }}
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: 'User Name'
  },
  size: {
    type: Number,
    default: 80
  },
  colors: {
    type: Array,
    default: () => [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
      '#F1948A', '#85C1E9', '#D7BDE2', '#A9DFBF'
    ]
  }
})

// Generate initials from name
const initials = computed(() => {
  if (!props.name) return 'U'

  return props.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
})

// Generate consistent color based on name
const backgroundColor = computed(() => {
  if (!props.name) return props.colors[0]

  // Create a simple hash from the name for consistent color selection
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % props.colors.length
  return props.colors[index]
})

// Calculate font size based on profile picture size
const fontSize = computed(() => {
  return Math.floor(props.size * 0.4)
})

// Size class for responsive design
const sizeClass = computed(() => {
  if (props.size <= 40) return 'profile-picture--small'
  if (props.size <= 80) return 'profile-picture--medium'
  return 'profile-picture--large'
})
</script>

<style scoped>
.profile-picture {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  user-select: none;
  cursor: default;
  transition: transform 0.2s ease;
}

.profile-picture:hover {
  transform: scale(1.05);
}

.profile-picture--small {
  min-width: 32px;
  min-height: 32px;
}

.profile-picture--medium {
  min-width: 64px;
  min-height: 64px;
}

.profile-picture--large {
  min-width: 96px;
  min-height: 96px;
}
</style>