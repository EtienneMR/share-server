<script setup lang="ts">
import type { AsyncDataRequestStatus } from "#app";

const props = defineProps<{
  status: AsyncDataRequestStatus;
  refresh: () => Promise<void>;
}>();

const { status, refresh } = toRefs(props);

const finished = ref(false);
let timeoutId: NodeJS.Timeout;

function removeFinished() {
  finished.value = false;
}

watch(status, (st) => {
  if (st == "success") {
    clearTimeout(timeoutId);
    finished.value = true;
    timeoutId = setTimeout(removeFinished, 3000);
  }
});
</script>

<template>
  <div
    class="h-14 flex-shrink-0 flex items-center border-gray-200 dark:border-gray-800 px-5 gap-x-4 min-w-0 border-0"
  >
    <div class="flex items-center justify-between flex-1 gap-x-1.5 min-w-0">
      <div class="flex items-stretch gap-1.5 min-w-0">
        <h1
          class="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white min-w-0"
        >
          <span class="truncate">Partage de fichier</span
          ><UButton
            v-if="finished"
            icon="mdi-check"
            color="gray"
            variant="ghost"
            :loading="status == 'pending'"
            @click="refresh"
          />
          <UButton
            v-else
            icon="i-ph-arrows-clockwise"
            color="gray"
            variant="ghost"
            :loading="status == 'pending'"
            @click="refresh"
          />
        </h1>
      </div>
    </div>
  </div>
</template>
