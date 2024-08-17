<script setup lang="ts">
import type { PartialBlobObject } from "~/utils/nodes.js";
import BaseCard from "~~/components/cards/BaseCard.vue";

const toast = useToast();

const formatBytes2 = formatBytes;

function listBlobs(currentNode: TreeNode, list: PartialBlobObject[] = []) {
  if (currentNode.blob) {
    list.push(currentNode.blob);
  }
  for (const child of currentNode.children ?? []) {
    listBlobs(child, list);
  }
  return list;
}

const fetchAllTree = defineModel<boolean>("fetchAllTree");

const emit = defineEmits<{
  refresh: [];
}>();

const props = defineProps<{
  node: TreeNode;
  shiftDown: boolean;
}>();

const { shiftDown, node } = toRefs(props);
const deleting = ref(false);

const blob = computed(() => node.value.blob);
const descendantBlobs = computed(() => listBlobs(node.value));
const hasAnyUnloadedDescendant = computed(() =>
  descendantBlobs.value.some((blob) => blob.pathname.endsWith("/"))
);
const isPublic = computed(() =>
  descendantBlobs.value.every((blob) => blob.customMetadata?.public == "true")
);
const isPrivate = computed(() =>
  descendantBlobs.value.every((blob) => blob.customMetadata?.public != "true")
);

async function deleteBlobs() {
  deleting.value = true;
  try {
    const singleBlob =
      !hasAnyUnloadedDescendant.value && descendantBlobs.value.length == 1
        ? descendantBlobs.value[0]
        : undefined;

    const path = singleBlob
      ? singleBlob.pathname
      : node.value.pathname.substring(1);

    await $fetch("/api/files", {
      method: "DELETE",
      query: {
        path,
        file: singleBlob != null,
      },
    });
  } catch (err) {
    deleting.value = false;
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
  emit("refresh");
}

function promptDeleteNode() {
  if (shiftDown.value) return deleteBlobs();
  toast.add({
    id: `prompt_delete_file-${node.value.pathname}`,
    title: `Supprimer ${node.value.pathname} (${
      hasAnyUnloadedDescendant.value
        ? "beaucoup de"
        : descendantBlobs.value.length
    } fichier${
      descendantBlobs.value.length == 1 && !hasAnyUnloadedDescendant.value
        ? ""
        : "s"
    }) ?`,
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
    <template v-if="!hasAnyUnloadedDescendant">
      <span class="mx-1">{{ formatBytes2(node.totalSize) }}</span>
      <UIcon v-if="isPublic" name="mdi-earth" class="w-4 h-5 mx-1" />
      <UIcon
        v-else-if="isPrivate"
        name="mdi-lock-outline"
        class="w-4 h-5 mx-1"
      />
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
        :disabled="deleting"
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
        :disabled="deleting"
      />
      <UButton
        v-else
        icon="mdi-link-variant-off"
        size="2xs"
        color="gray"
        variant="ghost"
        disabled
      />
    </template>
    <Can v-else-if="!fetchAllTree" :bouncer-ability="readGlobal" :args="[]">
      <UButton
        icon="mdi-dots-vertical"
        size="2xs"
        color="gray"
        variant="ghost"
        @click="fetchAllTree = true"
      />
    </Can>
    <UButton
      icon="mdi-trash-can-outline"
      size="2xs"
      variant="ghost"
      class="-mr-1"
      :color="shiftDown ? 'red' : 'gray'"
      :loading="deleting"
      @click="promptDeleteNode"
    />
  </BaseCard>
</template>
