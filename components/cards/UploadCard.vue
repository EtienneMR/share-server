<script setup lang="ts">
import BaseCard from "~~/components/cards/BaseCard.vue";

defineProps<{
  files: File[];
  isPublic: boolean;
  state: "done" | "uploading" | "failed";
}>();
</script>

<!-- eslint-disable vue/html-self-closing -->
<template>
  <BaseCard class="first:rounded-t-md last:rounded-b-md">
    <UIcon
      v-if="state == 'uploading'"
      name="i-ph-arrows-clockwise"
      class="w-4 h-5 mr-1 animate-spin"
    />
    <UIcon v-else-if="state == 'done'" name="mdi-check" class="w-4 h-5 mr-1" />
    <UIcon
      v-else-if="state == 'failed'"
      name="mdi-close-octagon-outline"
      class="w-4 h-5 mr-1"
    />
    <span class="flex-1 w-0 truncate">{{
      files.map((file) => file.name).join(", ")
    }}</span>
    <UIcon v-if="isPublic" name="mdi-earth" class="w-4 h-5 mx-1" />
    <UIcon v-else-if="!isPublic" name="mdi-lock-outline" class="w-4 h-5 mx-1" />
  </BaseCard>
</template>
