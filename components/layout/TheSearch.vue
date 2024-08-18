<script setup lang="ts">
type SearchElement = {
  id: string;
  prefix: string;
  label: string | undefined;
};

const path = useEncodedPath();

const fetchAllTree = defineModel<boolean>("fetchAllTree");

const props = defineProps<{
  treeRoot: TreeNode | null;
}>();

const isOpen = ref(false);

function discover(node: TreeNode, flattened: SearchElement[]) {
  const prefix = node.pathname.split("/");
  const name = node.blob ? prefix.pop() : "";
  flattened.push({
    id: node.pathname,
    prefix: prefix.join("/"),
    label: name,
  });
  node.children?.forEach((n) => discover(n, flattened));
  return flattened;
}

const commands = computed(() =>
  props.treeRoot ? discover(props.treeRoot, []) : undefined
);

function goTo(elem: SearchElement) {
  path.value = "/" + elem.prefix;
  isOpen.value = false;
}

const ui = {
  wrapper:
    "flex flex-col flex-1 min-h-0 divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800",
  container:
    "relative flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 scroll-py-2",
  input: {
    base: "w-full h-14 px-4 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent border-0 text-gray-900 dark:text-white focus:ring-0 focus:outline-none",
  },
  group: {
    label: "px-2 my-2 text-xs font-semibold text-gray-500 dark:text-gray-400",
    command: {
      base: "flex justify-between select-none cursor-default items-center rounded-md px-2 py-2 gap-2 relative",
      active: "bg-gray-200 dark:bg-gray-700/50 text-gray-900 dark:text-white",
      container: "flex items-center gap-3 min-w-0",
      icon: {
        base: "flex-shrink-0 w-5 h-5",
        active: "text-gray-900 dark:text-white",
        inactive: "text-gray-400 dark:text-gray-500",
      },
      avatar: {
        size: "2xs",
      },
    },
  },
};
</script>

<template>
  <div>
    <UButton
      icon="mdi-file-search-outline"
      size="2xs"
      color="gray"
      variant="ghost"
      class="-mr-1"
      @click="
        fetchAllTree = true;
        isOpen = true;
      "
    />
    <UModal v-model="isOpen">
      <UCommandPalette
        :groups="[{ key: 'blobs', commands }]"
        :ui="ui"
        @update:model-value="goTo"
      />
    </UModal>
  </div>
</template>
