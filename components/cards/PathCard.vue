<script setup lang="ts">
import BaseCard from "~/components/cards/BaseCard.vue";
import { useEncodedPath } from "~/composables/useEncodedPath.js";

const path = useEncodedPath();

const fetchAllTree = defineModel<boolean>("fetchAllTree");

defineProps<{
  treeRoot: TreeNode | null;
}>();

const folderTarget = ref("");

function go() {
  if (folderTarget.value) {
    const target = path.value
      .split("/")
      .concat(folderTarget.value.split("/"))
      .filter((p) => p)
      .join("/");
    path.value = "/" + target;
    folderTarget.value = "";
  }
}

const links = computed(() => {
  const names = path.value.split("/").filter((p) => p);
  let previous = "";

  const l = names.map((name) => {
    previous += "/" + name;
    return {
      label: name,
      icon: "mdi-folder-outline",
      to: previous,
    };
  });

  l.unshift({
    label: l.length ? "" : "Root",
    icon: "mdi-folder-home-outline",
    to: "/",
  });

  return l;
});
</script>

<template>
  <BaseCard class="rounded-md mb-3">
    <UBreadcrumb :links="links" />
    <form class="contents" @submit.prevent="go">
      <UInput
        v-model="folderTarget"
        class="ml-3"
        size="2xs"
        placeholder="Dossier"
        icon="heroicons-chevron-right-20-solid"
        @blur="go"
      />
    </form>
    <span class="flex-1" />
    <Can :bouncer-ability="readGlobal" :args="[]">
      <TheSearch v-model:fetch-all-tree="fetchAllTree" :tree-root="treeRoot" />
    </Can>
  </BaseCard>
</template>
