<script setup lang="ts">
import BaseCard from "~~/components/cards/BaseCard.vue";

const publicUpload = ref(false);
const finished = ref(false);
let timeoutId: NodeJS.Timeout;

function removeFinished() {
  finished.value = false;
}

const toast = useToast();
const uploading = ref(false);
const upload = useUpload("/api/files", {
  method: "POST",
  query: {
    get public() {
      return publicUpload.value;
    },
    get path() {
      return useRoute().path;
    },
  },
});

const { refresh } = defineProps<{
  refresh: () => Promise<void>;
}>();

async function uploadFile(e: Event) {
  const input = e.target as HTMLInputElement;
  uploading.value = true;

  try {
    await upload(input);

    input.value = "";
    clearTimeout(timeoutId);
    finished.value = true;
    timeoutId = setTimeout(removeFinished, 3000);
  } catch (err) {
    toast.add({
      id: "failed_file_upload",
      title: "Impossible d'uploader votre fichier.",
      description: err instanceof Error ? err.message : String(err),
      icon: "mdi-alert",
      color: "red",
      timeout: 60000,
      actions: [
        {
          label: "Réessayer",
          click: () => uploadFile(e),
        },
      ],
    });
  }

  uploading.value = false;

  await refresh();
}
</script>

<!-- eslint-disable vue/html-self-closing -->
<template>
  <BaseCard class="rounded-t-md">
    <UIcon
      v-if="uploading"
      name="i-ph-arrows-clockwise"
      class="w-4 h-5 mr-1 animate-spin"
    />
    <UIcon v-else-if="finished" name="mdi-check" class="w-4 h-5 mr-1" />
    <UIcon v-else name="ic-outline-cloud-upload" class="w-4 h-5 mr-1" />
    <input
      type="file"
      name="file"
      class="flex-1 border-input text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium h-full disabled:cursor-not-allowed disabled:opacity-75"
      multiple
      :disabled="uploading"
      @change="uploadFile"
    />
    <UButton
      v-if="publicUpload"
      icon="mdi-earth"
      size="2xs"
      color="gray"
      variant="ghost"
      class="-mr-1"
      :disabled="uploading"
      @click="publicUpload = false"
    />
    <UButton
      v-else
      icon="mdi-lock-outline"
      size="2xs"
      color="gray"
      variant="ghost"
      class="-mr-1"
      :disabled="uploading"
      @click="publicUpload = true"
    />
  </BaseCard>
</template>
