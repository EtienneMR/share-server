<script setup lang="ts">
import type { BlobObject } from "@nuxthub/core";
import FileCard from "~~/components/cards/FileCard.vue";
import UploadCard from "~~/components/cards/UploadCard.vue";
import TheHeader from "~~/components/layout/TheHeader.vue";

const { loggedIn } = useUserSession();

if (!loggedIn.value) {
  await navigateTo("/api/auth/central-auth");
}

const toast = useToast();

const shiftDown = ref(false);

function keyevnt(ev: KeyboardEvent) {
  shiftDown.value = ev.shiftKey;
}

onMounted(() => addEventListener("keydown", keyevnt));
onUnmounted(() => removeEventListener("keydown", keyevnt));

onMounted(() => addEventListener("keyup", keyevnt));
onUnmounted(() => removeEventListener("keyup", keyevnt));

const {
  data: files,
  status,
  error,
  refresh,
} = await useFetch("/api/files", {});

watch(
  error,
  (err) => {
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
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex-col items-stretch relative w-full flex-1 flex">
    <TheHeader :status="status" :refresh="refresh" />
    <TransitionGroup
      name="list"
      tag="div"
      class="px-5 files-grid"
      :class="{ 'anim-quick': shiftDown }"
    >
      <UploadCard key="upload-card" :refresh="refresh" />
      <FileCard
        v-for="file in files"
        :key="file.pathname"
        :file="(file as unknown as BlobObject)"
        :refresh="refresh"
        :shift-down="shiftDown"
      />
    </TransitionGroup>
  </div>

  <UNotifications />
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
  transition: all var(--transition-speed, 0.5s) ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

.anim-quick {
  --transition-speed: 0.1s;
}
</style>
