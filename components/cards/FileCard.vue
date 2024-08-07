<script setup lang="ts">
import BaseCard from "~~/components/cards/BaseCard.vue";

const toast = useToast();

const props = defineProps<{
  node: TreeNode;
  shiftDown: boolean;
  refresh: () => Promise<void>;
}>();

const { refresh } = props;
const { shiftDown, node } = toRefs(props);

const blob = computed(() => node.value.blob);

async function deleteFile() {
  try {
    await $fetch(`/api/files${node.value.pathname}`, {
      method: "DELETE" as never,
    });
  } catch (err) {
    toast.add({
      id: `failed_delete_file-${node.value.pathname}`,
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
    id: `prompt_delete_file-${node.value.pathname}`,
    title: `Supprimer ${node.value.pathname} ?`,
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
  <BaseCard class="last:rounded-b-md">
    <UIcon
      v-if="node.children && node.blob"
      name="mdi-folder-file-outline"
      class="w-4 h-5 mr-1"
    />
    <UIcon
      v-else-if="node.children"
      name="mdi-folder-outline"
      class="w-4 h-5 mr-1"
    />
    <UIcon v-else name="mdi-file-outline" class="w-4 h-5 mr-1" />
    <NuxtLink v-if="node.children" :to="node.pathname" class="flex-1">{{
      node.name
    }}</NuxtLink>
    <span v-else class="flex-1">{{ node.name }}</span>
    <span class="mx-1">{{ formatBytes(node.totalSize) }}</span>
    <UIcon
      v-if="blob && blob.customMetadata?.public == 'true'"
      name="mdi-earth"
      class="w-4 h-5 mx-1"
    />
    <UIcon v-else-if="blob" name="mdi-lock-outline" class="w-4 h-5 mx-1" />
    <UButton
      v-if="blob"
      icon="mdi-link-variant"
      size="2xs"
      color="gray"
      variant="ghost"
      :to="`/f/${blob.pathname}`"
      target="_blank"
      external
    />
    <UButton
      v-if="blob"
      icon="mdi-trash-can-outline"
      size="2xs"
      color="gray"
      variant="ghost"
      class="-mr-1"
      @click="promptDeleteFile"
    />
  </BaseCard>
</template>
