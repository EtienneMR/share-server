<script setup lang="ts">
import TheContent from "~/components/layout/TheContent.vue";
import TheHeader from "~~/components/layout/TheHeader.vue";

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const toast = useToast();

useSeoMeta({
  title: () => `Share server — ${route.path}`,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

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
