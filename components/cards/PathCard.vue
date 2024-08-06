<script setup lang="ts">
import BaseCard from "~/components/cards/BaseCard.vue";

const route = useRoute();
const router = useRouter();

const folderTarget = ref("");

function go() {
  if (folderTarget.value) {
    const target = route.path
      .split("/")
      .concat(folderTarget.value.split("/"))
      .filter((p) => p)
      .join("/");
    router.push("/" + target);
    folderTarget.value = "";
  }
}

const links = computed(() => {
  const path = route.path.split("/").filter((p) => p);
  let previous = "";

  const l = path.map((name) => {
    previous += "/" + name;
    return {
      label: name,
      icon: "",
      to: previous,
    };
  });

  l.unshift({
    label: l.length ? "" : "Root",
    icon: "i-heroicons-home",
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
  </BaseCard>
</template>
