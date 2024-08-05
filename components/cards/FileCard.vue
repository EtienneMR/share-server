<script setup lang="ts">
import type { BlobObject } from "@nuxthub/core";
import BaseCard from "~~/components/cards/BaseCard.vue";

const toast = useToast();

const props = defineProps<{
  file: BlobObject;
  shiftDown: boolean;
  refresh: () => Promise<void>;
}>();

const { file, refresh } = props;
const shiftDown = toRef(props, "shiftDown");

async function deleteFile() {
  try {
    await $fetch(`/api/files/${file.pathname}`, {
      method: "DELETE" as never,
    });
  } catch (err) {
    toast.add({
      id: `failed_delete_file-${file.pathname}`,
      title: "Impossible de supprimer votre fichier.",
      description: err instanceof Error ? err.message : String(err),
      icon: "mdi-alert",
      color: "red",
      timeout: 60000,
      actions: [
        {
          label: "Réessayer",
          click: () => deleteFile(),
        },
      ],
    });
  }
  await refresh();
}

function promptDeleteFile() {
  if (shiftDown.value) return deleteFile();
  toast.add({
    id: `prompt_delete_file-${file.pathname}`,
    title: `Supprimer ${file.pathname} ?`,
    description: "Cette suppression est définitive.",
    icon: "mdi-help",
    color: "orange",
    timeout: 10000,
    actions: [
      {
        label: "Confirmer",
        color: "red",
        click: () => deleteFile(),
      },
      {
        label: "Annuler",
        click: () => {},
      },
    ],
  });
}
</script>

<template>
  <BaseCard>
    <div class="px-1 h-full">
      <UIcon name="mdi-file-outline" class="w-4 h-full" />
    </div>
    <span class="flex-1">{{ file.pathname }}</span>
    <div class="px-1 h-full">
      <UIcon
        v-if="file.customMetadata?.public == 'true'"
        name="mdi-earth"
        class="w-4 h-full m-1"
      />
      <UIcon v-else name="mdi-lock-outline" class="w-4 h-full m-1" />
    </div>
    <UButton
      icon="mdi-link-variant"
      size="2xs"
      color="gray"
      variant="ghost"
      :to="`/f/${file.pathname}`"
      target="_blank"
      external
    />
    <UButton
      icon="mdi-trash-can-outline"
      size="2xs"
      color="gray"
      variant="ghost"
      @click="promptDeleteFile"
    />
  </BaseCard>
</template>
