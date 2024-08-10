<!-- eslint-disable vue/html-self-closing -->
<script setup lang="ts">
import BaseCard from "~/components/cards/BaseCard.vue";
import UploadCard from "~/components/cards/UploadCard.vue";

const PRIVACY_OPTIONS: {
  label: string;
  icon: string;
  isPublic: boolean;
}[] = [
  {
    label: "Privé",
    icon: "mdi-lock-outline",
    isPublic: false,
  },
  {
    label: "Public",
    icon: "mdi-earth",
    isPublic: true,
  },
];

const UPLOAD_OPTIONS = [
  {
    label: "Fichier",
    icon: "mdi-file-outline",
    isFolder: false,
  },
  {
    label: "Dossier",
    icon: "mdi-folder-outline",
    isFolder: true,
  },
];

const { refresh } = defineProps<{
  refresh: () => Promise<void>;
}>();

let nextUploadIsPublic = false;
let nextUploadPath = "";

const toast = useToast();
const upload = useUpload("/api/files", {
  method: "POST",
  query: {
    get public() {
      return nextUploadIsPublic;
    },
    get path() {
      return nextUploadPath;
    },
  },
});

const isOpen = ref(false);
const selectedPrivacy = ref(PRIVACY_OPTIONS[0]);
const selectedUpload = ref(UPLOAD_OPTIONS[0]);
const uploads: Ref<
  {
    files: File[];
    isPublic: boolean;
    state: "done" | "uploading" | "failed";
    id: number;
  }[]
> = ref([]);

const firstUploading = computed(() =>
  uploads.value.find((upload) => upload.state == "uploading")
);

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (firstUploading.value) {
    event.preventDefault();
  }
}

async function uploadFiles(fileList: FileList) {
  if (fileList.length) {
    const thisUpload = reactive({
      files: Array.from(fileList),
      isPublic: selectedPrivacy.value?.isPublic ?? false,
      path: useRoute().path,
      id: new Date().getTime(),
      state: "uploading" as "done" | "uploading" | "failed",
    });

    uploads.value = [thisUpload, ...uploads.value]; // unshift don't force recomputation of someUploading

    try {
      nextUploadIsPublic = thisUpload.isPublic;
      nextUploadPath = thisUpload.path;
      await upload(thisUpload.files);
      thisUpload.state = "done";
    } catch (err) {
      thisUpload.state = "failed";

      toast.add({
        id: "failed_file_upload",
        title: "Impossible d'uploader votre fichier.",
        description: err instanceof Error ? err.message : String(err),
        icon: "mdi-alert",
        color: "red",
        timeout: 60000,
        actions: [
          {
            label: "Réessayer",
            click: () => uploadFiles(fileList),
          },
        ],
      });
    }

    await refresh();
  }
}

if (!import.meta.dev) {
  onMounted(() => addEventListener("beforeunload", onBeforeUnload));
  onUnmounted(() => removeEventListener("beforeunload", onBeforeUnload));
}
</script>

<template>
  <div>
    <BaseCard class="rounded-t-md">
      <UIcon
        v-if="firstUploading"
        name="i-ph-arrows-clockwise"
        class="w-4 h-5 mr-1 animate-spin"
      />
      <UIcon v-else name="mdi-cloud-upload-outline" class="w-4 h-5 mr-1" />
      <UButton
        label="Uploader des fichier"
        size="sm"
        variant="ghost"
        color="white"
        class="p-0 mr-3"
        @click="isOpen = true"
      />
      <span class="flex-1 truncate">{{
        firstUploading?.files.map((file) => file.name).join(", ")
      }}</span>
    </BaseCard>

    <USlideover v-model="isOpen">
      <div class="p-4 flex-1">
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          icon="mdi-close"
          class="flex sm:hidden absolute end-5 top-5 z-10"
          square
          padded
          @click="isOpen = false"
        />
        <div class="pl-3 mb-3">Uploader des fichiers</div>
        <p class="mb-0.5">Accessibilité</p>
        <USelectMenu
          v-model="selectedPrivacy"
          :options="PRIVACY_OPTIONS"
          class="mb-3"
        >
          <template #leading>
            <UIcon
              v-if="selectedPrivacy"
              :name="(selectedPrivacy.icon as string)"
              class="w-5 h-5"
            />
          </template>
        </USelectMenu>
        <p class="mb-0.5">Type</p>
        <USelectMenu
          v-model="selectedUpload"
          :options="UPLOAD_OPTIONS"
          class="mb-3"
        >
          <template #leading>
            <UIcon
              v-if="selectedUpload"
              :name="(selectedUpload.icon as string)"
              class="w-5 h-5"
            />
          </template>
        </USelectMenu>
        <p class="mb-0.5">Fichiers</p>
        <UInput
          v-if="selectedUpload"
          type="file"
          name="file"
          multiple
          :webkitdirectory="selectedUpload.isFolder"
          @change="uploadFiles"
        />
        <div v-if="uploads.length" class="pl-3 mt-3 mb-3">Actions</div>
        <div v-if="uploads.length">
          <UploadCard
            v-for="thisUpload in uploads"
            :key="thisUpload.id"
            :files="thisUpload.files"
            :is-public="thisUpload.isPublic"
            :state="(thisUpload.state as never)"
            :refresh="refresh"
          />
        </div>
      </div>
    </USlideover>
  </div>
</template>
