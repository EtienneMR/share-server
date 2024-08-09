<script setup lang="ts">
import BaseCard from "~/components/cards/BaseCard.vue";
import NodeCard from "~/components/cards/NodeCard.vue";
import PathCard from "~/components/cards/PathCard.vue";
import TheUploadSlideover from "~/components/layout/TheUploadSlideover.vue";

const TOTAL_STORAGE_SIZE = Math.pow(10, 10);

defineProps<{
  treeRoot: TreeNode | null;
  currentNode: TreeNode | null;
  refresh: () => Promise<void>;
}>();

const formatBytes2 = formatBytes;
const shiftDown = ref(false);

function handleKeyEvent(ev: KeyboardEvent) {
  shiftDown.value = ev.shiftKey;
}

onMounted(() => addEventListener("keydown", handleKeyEvent));
onUnmounted(() => removeEventListener("keydown", handleKeyEvent));

onMounted(() => addEventListener("keyup", handleKeyEvent));
onUnmounted(() => removeEventListener("keyup", handleKeyEvent));
</script>

<template>
  <TransitionGroup
    name="list"
    tag="div"
    class="px-5 pb-5 flex flex-col"
    :class="{ 'anim-quick': shiftDown }"
  >
    <PathCard key="path-card" />
    <div v-if="currentNode && treeRoot" key="stockage-meter" class="mb-3">
      <UMeter
        icon="mdi-database-outline"
        :value="currentNode.totalSize"
        :max="TOTAL_STORAGE_SIZE"
        label="Stockage"
      >
        <template #label="data">
          <p v-if="data" class="text-sm">
            {{ formatBytes2(currentNode.totalSize) }} ({{
              Math.round(data.percent)
            }}%).
            {{
              Math.floor(100 - (treeRoot.totalSize / TOTAL_STORAGE_SIZE) * 100)
            }}% restants
          </p>
        </template>
      </UMeter>
    </div>
    <TheUploadSlideover key="upload-slideover" :refresh="refresh" />
    <NodeCard
      v-for="node in currentNode?.children"
      :key="node.pathname"
      :node="node"
      :refresh="refresh"
      :shift-down="shiftDown"
    />
    <BaseCard
      v-show="!currentNode?.children?.length"
      key="empty-dir"
      class="rounded-b-md"
    >
      Dossier vide
    </BaseCard>
  </TransitionGroup>
</template>
