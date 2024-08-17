<script setup lang="ts">
import type { RouteLocationNormalized } from "vue-router";
import TheContent from "~/components/layout/TheContent.vue";
import TheHeader from "~~/components/layout/TheHeader.vue";

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
      const runtimeConfig = useRuntimeConfig();
      return navigateTo(`/api/auth/${runtimeConfig.public.authType}`, {
        external: true,
      });
    }
  },
});

async function checkRoute(to: RouteLocationNormalized) {
  if (await denies(readPath, to.path)) {
    const { user } = useUserSession();
    const username = user.value?.name;
    if (await allows(readOwn)) {
      if (route.path == "/" || route.path == `/${username}`) {
        return `/${username}/`;
      } else if (!to.path.startsWith(`/${username}/`)) {
        toast.add({
          id: "err_access",
          title: "Accès impossible",
          description:
            "Vous avez essayé d'accéder a un dossier auquel vous n'avez pas accès",
          icon: "mdi-alert",
          color: "red",
        });
        return false;
      }
    } else {
      toast.add({
        id: "err_access",
        title: "Accès impossible",
        description:
          "Vous avez essayé d'accéder a un dossier auquel vous n'avez pas accès",
        icon: "mdi-alert",
        color: "red",
      });
      return false;
    }
  }
}

onBeforeRouteUpdate(checkRoute);
if (await denies(readPath, route.path)) {
  const { user } = useUserSession();
  const username = user.value?.name;
  if (await allows(readOwn)) {
    if (route.path == "/" || route.path == `/${username}`) {
      await navigateTo(`/${username}/`);
    } else if (!route.path.startsWith(`/${username}/`)) {
      throw createError({
        statusCode: 403,
        message: "Vous n'avez pas accès à ce dossier",
      });
    }
  } else {
    throw createError({
      statusCode: 403,
      message: "Vous n'avez pas accès à ce service",
      fatal: true,
    });
  }
}

const fetchAllTree = ref(false);

function pathWithoutRootSlash() {
  const { path } = route;
  return encodeURI(path == "/" ? "%root%" : path.substring(1));
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
  data: blobs,
  status,
  error,
  refresh,
} = await useFetch(
  () =>
    fetchAllTree.value
      ? `/api/files/tree`
      : `/api/files/folded/${pathWithoutRootSlash()}`,
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
</script>

<template>
  <div>
    <div class="flex-col items-stretch relative w-full flex-1 flex">
      <TheHeader
        v-model:fetch-all-tree="fetchAllTree"
        :status="status"
        @refresh="refresh"
      />
      <TheContent
        v-model:fetch-all-tree="fetchAllTree"
        :tree-root="treeRoot"
        :current-node="currentNode"
        @refresh="refresh"
      />
    </div>

    <UNotifications />
  </div>
</template>
