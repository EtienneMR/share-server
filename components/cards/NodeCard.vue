<script setup lang="ts">
import type { BlobObject } from "@nuxthub/core";
import BaseCard from "~~/components/cards/BaseCard.vue";

const toast = useToast();

const formatBytes2 = formatBytes;

function listBlobs(currentNode: TreeNode, list: BlobObject[] = []) {
  if (currentNode.blob) {
    list.push(currentNode.blob);
  }
  for (const child of currentNode.children ?? []) {
    listBlobs(child, list);
  }
  return list;
}

const props = defineProps<{
  node: TreeNode;
  shiftDown: boolean;
  refresh: () => Promise<void>;
}>();

const { refresh } = props;
const { shiftDown, node } = toRefs(props);

const blob = computed(() => node.value.blob);
const descendantBlobs = computed(() => listBlobs(node.value));
const isPublic = computed(() =>
  descendantBlobs.value.every((blob) => blob.customMetadata?.public == "true")
);
const isPrivate = computed(() =>
  descendantBlobs.value.every((blob) => blob.customMetadata?.public != "true")
);

async function deleteBlobs() {
  try {
    const path = node.value.pathname.substring(1);
    let buffer = "";

    const dispatch = () =>
      $fetch("/api/files", {
        method: "DELETE",
        query: {
          path,
          files: buffer,
        },
      });

    for (const descendant of descendantBlobs.value) {
      const name = descendant.pathname.substring(path.length);
      if (buffer.length == 0) {
        buffer = name;
      } else if (buffer.length + name.length < 1500) {
        buffer += ";" + name;
      } else {
        await dispatch();
        buffer = name;
      }
    }
    await dispatch();
  } catch (err) {
    toast.add({
      id: `failed_delete_file-${node.value.pathname}`,
      title: `Impossible de supprimer vos fichiers.`,
      description: err instanceof Error ? err.message : String(err),
      icon: "mdi-alert",
      color: "red",
      timeout: 60000,
      actions: [
        {
          label: "Réessayer",
          click: () => deleteBlobs(),
        },
      ],
    });
  }
  await refresh();
}

function promptDeleteNode() {
  if (shiftDown.value) return deleteBlobs();
  toast.add({
    id: `prompt_delete_file-${node.value.pathname}`,
    title: `Supprimer ${node.value.pathname} (${
      descendantBlobs.value.length
    } fichier${descendantBlobs.value.length == 1 ? "" : "s"}) ?`,
    description: "Cette suppression est définitive.",
    icon: "mdi-help",
    color: "orange",
    timeout: 10000,
    actions: [
      {
        label: "Confirmer",
        color: "red",
        click: () => deleteBlobs(),
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
    <NuxtLink
      v-if="node.children"
      :to="node.pathname"
      class="flex-1 w-0 truncate"
      >{{ node.name }}</NuxtLink
    >
    <span v-else class="flex-1 w-0 truncate">{{ node.name }}</span>
    <span class="mx-1">{{ formatBytes2(node.totalSize) }}</span>
    <UIcon v-if="isPublic" name="mdi-earth" class="w-4 h-5 mx-1" />
    <UIcon v-else-if="isPrivate" name="mdi-lock-outline" class="w-4 h-5 mx-1" />
    <UIcon v-else name="mdi-eye-settings-outline" class="w-4 h-5 mx-1" />
    <UButton
      v-if="blob && isPrivate"
      icon="mdi-link-variant-remove"
      size="2xs"
      color="gray"
      variant="ghost"
      target="_blank"
      external
      :to="`/f/${blob.pathname}`"
    />
    <UButton
      v-else-if="blob"
      icon="mdi-link-variant"
      size="2xs"
      color="gray"
      variant="ghost"
      target="_blank"
      external
      :to="`/f/${blob.pathname}`"
    />
    <UButton
      v-else
      icon="mdi-link-variant-off"
      size="2xs"
      color="gray"
      variant="ghost"
      disabled
    />
    <UButton
      icon="mdi-trash-can-outline"
      size="2xs"
      variant="ghost"
      class="-mr-1"
      :color="shiftDown ? 'red' : 'gray'"
      @click="promptDeleteNode"
    />
  </BaseCard>
</template>
