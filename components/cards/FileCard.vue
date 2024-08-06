<script setup lang="ts">
import type { TreeNode } from "~/utils/files.js";
import BaseCard from "~~/components/cards/BaseCard.vue";

const toast = useToast();

const props = defineProps<{
  node: TreeNode;
  shiftDown: boolean;
  refresh: () => Promise<void>;
}>();

const { node, refresh } = props;
const shiftDown = toRef(props, "shiftDown");

const file = node.blob;

async function deleteFile() {
  try {
    await $fetch(`/api/files/${node.pathname}`, {
      method: "DELETE" as never,
    });
  } catch (err) {
    toast.add({
      id: `failed_delete_file-${node.pathname}`,
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
    id: `prompt_delete_file-${node.pathname}`,
    title: `Supprimer ${node.pathname} ?`,
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

function formatBytes(bytes: number, decimals: number = 2) {
  if (!bytes) return "0 Bytes";

  const base = 1024;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(base));

  return `${(bytes / Math.pow(base, i)).toFixed(decimals)} ${sizes[i]}`;
}
</script>

<template>
  <BaseCard class="last:rounded-b-md">
    <template v-if="file">
      <UIcon
        v-if="node.children"
        name="mdi-folder-file-outline"
        class="w-4 h-5 mr-1"
      />
      <UIcon v-else name="mdi-file-outline" class="w-4 h-5 mr-1" />
      <NuxtLink v-if="node.children" :to="node.pathname" class="flex-1">{{
        node.name
      }}</NuxtLink>
      <span v-else class="flex-1">{{ node.name }}</span>
      <span class="mx-1">{{ formatBytes(file.size) }}</span>
      <UIcon
        v-if="file.customMetadata?.public == 'true'"
        name="mdi-earth"
        class="w-4 h-5 mx-1"
      />
      <UIcon v-else name="mdi-lock-outline" class="w-4 h-5 mx-1" />
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
        class="-mr-1"
        @click="promptDeleteFile"
      />
    </template>
    <template v-else>
      <UIcon name="mdi-folder-outline" class="w-4 h-5 mr-1" />
      <NuxtLink class="flex-1" :to="node.pathname">{{ node.name }}</NuxtLink>
    </template>
  </BaseCard>
</template>
