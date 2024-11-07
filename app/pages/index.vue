<script setup lang="ts">
const children = [
  {
    isFolder: false,
    name: "Lindsay Walton",
  },
  {
    isFolder: true,
    name: "bbbb",
  },
];
</script>

<template>
  <div class="items-stretch w-screen h-screen flex-1 flex">
    <div class="max-w-xs w-full flex-none bg-gray-950"></div>
    <div class="flex-1">
      <UTable :rows="children">
        <template #isFolder-header="{ column, sort, onSort }">
          <span></span>
        </template>
        <template #isFolder-data="{ row }">
          <UIcon name="i-mdi-folder" v-if="row.isFolder" />
          <UIcon name="i-mdi-file" v-else />
        </template>
      </UTable>
    </div>
  </div>
</template>
