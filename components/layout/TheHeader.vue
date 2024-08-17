<script setup lang="ts">
import type { AsyncDataRequestStatus } from "#app";

const FETCH_OPTIONS = [
  {
    label: "Dossier",
    icon: "mdi-folder-minus-outline",
    fetchAllTree: false,
  },
  {
    label: "Entier",
    icon: "mdi-file-tree-outline",
    fetchAllTree: true,
  },
];

const fetchAllTree = defineModel<boolean>("fetchAllTree");

const emit = defineEmits<{
  refresh: [];
}>();

const props = defineProps<{
  status: AsyncDataRequestStatus;
}>();

const { status } = toRefs(props);

const { clear } = useUserSession();
const { state: finished, use: setFinished } = useTimed(3000);

async function logout() {
  await clear();
  await navigateTo("/", { external: true });
}

const selectedLoad = computed({
  get: () =>
    FETCH_OPTIONS.find((option) => option.fetchAllTree == fetchAllTree.value),
  set: (option) => (fetchAllTree.value = option?.fetchAllTree),
});

watch(status, (st) => {
  if (st == "success") {
    setFinished();
  }
});
</script>

<template>
  <h1
    class="h-14 px-5 flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white min-w-0"
  >
    <span class="truncate">Partage de fichier</span
    ><UButton
      v-if="finished"
      icon="mdi-check"
      color="gray"
      variant="ghost"
      :loading="status == 'pending'"
      @click="emit('refresh')"
    />
    <UButton
      v-else
      icon="i-ph-arrows-clockwise"
      color="gray"
      variant="ghost"
      :loading="status == 'pending'"
      @click="emit('refresh')"
    />
    <Can :bouncer-ability="readOwn" :args="[]">
      <UIcon name="mdi-pencil-lock"
    /></Can>
    <Can :bouncer-ability="readGlobal" :args="[]">
      <UIcon name="mdi-pencil-plus" />
    </Can>
    <div class="flex-1" />
    <Can :bouncer-ability="readGlobal" :args="[]">
      <span>Charger</span>
      <USelectMenu v-model="selectedLoad" :options="FETCH_OPTIONS">
        <template #leading>
          <UIcon
            v-if="selectedLoad"
            :name="(selectedLoad.icon as string)"
            class="w-5 h-5"
          />
        </template>
      </USelectMenu>
    </Can>
    <UButton icon="mdi-logout" color="gray" variant="ghost" @click="logout" />
  </h1>
</template>
