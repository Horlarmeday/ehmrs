<script setup lang="ts">
import type { HTMLAttributes, ButtonHTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { cn } from "@/lib/utils"
import { buttonVariants } from "."
import { Loader2 } from "lucide-vue-next"

interface Props {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const isDisabled = props.disabled || props.loading
</script>

<template>
  <button
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :disabled="isDisabled"
  >
    <Loader2 v-if="props.loading" class="mr-2 h-4 w-4 animate-spin" />
    <slot />
  </button>
</template>
