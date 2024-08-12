<script setup lang="ts">
import BaseCard from "~/components/cards/BaseCard.vue";
import NodeCard from "~/components/cards/NodeCard.vue";
import PathCard from "~/components/cards/PathCard.vue";
import TheUploadSlideover from "~/components/layout/TheUploadSlideover.vue";

const runtimeConfig = useRuntimeConfig();

const totalStorageSize = runtimeConfig.public.totalStorageSize as number;

const fetchAllTree = defineModel<boolean>("fetchAllTree");

const emit = defineEmits<{
  refresh: [];
}>();

const props = defineProps<{
  treeRoot: TreeNode | null;
  currentNode: TreeNode | null;
  blobs: PartialBlobObject[] | undefined;
}>();

const formatBytes2 = formatBytes;
const shiftDown = ref(false);

function handleKeyEvent(ev: KeyboardEvent) {
  shiftDown.value = ev.shiftKey;
}

const realChildren = computed(() =>
  props.currentNode?.children?.filter((child) => child.name)
);

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
    <PathCard
      key="path-card"
      v-model:fetch-all-tree="fetchAllTree"
      :blobs="blobs"
    />
    <div
      v-if="fetchAllTree && currentNode && treeRoot"
      key="stockage-meter"
      class="mb-3"
    >
      <UMeter
        icon="mdi-database-outline"
        :value="currentNode.totalSize"
        :max="totalStorageSize"
        label="Stockage"
      >
        <template #label="data">
          <p v-if="data" class="text-sm">
            {{ formatBytes2(currentNode.totalSize) }} ({{
              Math.round(data.percent)
            }}%).
            {{
              Math.floor(100 - (treeRoot.totalSize / totalStorageSize) * 100)
            }}% restants
          </p>
        </template>
      </UMeter>
    </div>
    <TheUploadSlideover key="upload-slideover" @refresh="emit('refresh')" />
    <BaseCard
      v-show="currentNode && !currentNode?.children?.length"
      key="empty-dir"
      class="rounded-b-md"
    >
      Dossier vide
    </BaseCard>
    <NodeCard
      v-for="node in realChildren"
      :key="node.pathname"
      v-model:fetch-all-tree="fetchAllTree"
      :node="node"
      :shift-down="shiftDown"
      @refresh="emit('refresh')"
    />
  </TransitionGroup>
</template>

<style scoped>
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100vw, 400px), 1fr));
  grid-gap: 1em;
  justify-items: stretch;
  width: 100%;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: opacity var(--transition-speed, 0.5s) ease,
    transform var(--transition-speed, 0.5s) ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  @apply -mb-9;
}

.anim-quick {
  --transition-speed: 0.1s;
}
</style>
