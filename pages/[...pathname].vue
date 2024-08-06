<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import BaseCard from "~/components/cards/BaseCard.vue";
import PathCard from "~/components/cards/PathCard.vue";
import FileCard from "~~/components/cards/FileCard.vue";
import UploadCard from "~~/components/cards/UploadCard.vue";
import TheHeader from "~~/components/layout/TheHeader.vue";

definePageMeta({
  middleware: async () => {
    const { loggedIn } = useUserSession();

    if (!loggedIn.value) {
      await navigateTo("/api/auth/central-auth");
    }
  },
});

const toast = useToast();

const shiftDown = ref(false);

function keyevnt(ev: KeyboardEvent) {
  shiftDown.value = ev.shiftKey;
}

function updateErrorToast() {
  const err = error.value;
  if (err) {
    toast.add({
      id: "failed_files_fetch",
      title: "Impossible de récupérer la liste des fichiers.",
      description: err.message,
      icon: "mdi-alert",
      color: "red",
      timeout: 0,
      actions: [
        {
          label: "Réessayer",
          click: () => refresh(),
        },
      ],
    });
    console.error(err);
  } else {
    toast.remove("failed_files_fetch");
  }
}

const {
  data: files,
  status,
  error,
  refresh,
} = await useFetch("/api/files", {});

const route = useRoute();
const treeRoot = computed(() =>
  files.value
    ? buildTree(files.value as never)
    : { name: "Error", pathname: "" }
);
const currentNode = computed(() => getNodeFromPath(treeRoot.value, route.path));

onMounted(() => addEventListener("keydown", keyevnt));
onUnmounted(() => removeEventListener("keydown", keyevnt));

onMounted(() => addEventListener("keyup", keyevnt));
onUnmounted(() => removeEventListener("keyup", keyevnt));

watch(error, updateErrorToast);
onMounted(updateErrorToast);
</script>

<template>
  <div>
    <div class="flex-col items-stretch relative w-full flex-1 flex">
      <TheHeader :status="status" :refresh="refresh" />
      <TransitionGroup
        name="list"
        tag="div"
        class="px-5 flex flex-col"
        :class="{ 'anim-quick': shiftDown }"
      >
        <PathCard key="path-card" />
        <UploadCard key="upload-card" :refresh="refresh" />
        <FileCard
          v-for="node in currentNode.children"
          :key="node.pathname"
          :node="node"
          :refresh="refresh"
          :shift-down="shiftDown"
        />
        <BaseCard v-if="!currentNode.children?.length" class="rounded-b-md">
          Dossier vide
        </BaseCard>
      </TransitionGroup>
    </div>

    <UNotifications />
  </div>
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
