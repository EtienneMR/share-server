<script setup lang="ts">
import TheContent from "~/components/layout/TheContent.vue";
import TheHeader from "~~/components/layout/TheHeader.vue";

const runtimeConfig = useRuntimeConfig();

definePageMeta({
  middleware: async () => {
    const { loggedIn } = useUserSession();

    if (!loggedIn.value) {
      return navigateTo(`/api/auth/${runtimeConfig.public.authType}`, {
        external: true,
      });
    }
  },
});

const toast = useToast();
const fetchAllTree = ref(false);

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
  data: blobs,
  status,
  error,
  refresh,
} = await useFetch(
  () => (fetchAllTree.value ? "/api/files/tree" : "/api/files/root"),
  {}
);

const route = useRoute();
const treeRoot = computed(() =>
  blobs.value ? buildTree(blobs.value as never) : null
);
const currentNode = computed(() =>
  treeRoot.value ? getNodeFromPath(treeRoot.value, route.path) : null
);

watch(error, updateErrorToast);
onNuxtReady(updateErrorToast);
onNuxtReady(() => {
  fetchAllTree.value = true;
});
</script>

<template>
  <div>
    <div class="flex-col items-stretch relative w-full flex-1 flex">
      <TheHeader :status="status" :refresh="refresh" />
      <TheContent
        :tree-root="treeRoot"
        :current-node="currentNode"
        :refresh="refresh"
      />
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
