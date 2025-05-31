<script setup lang="ts">
import PageLayout from './PageLayout.vue'
import UploadInstructions from './UploadInstructions.vue'
import SelectSampleProject from './SelectSampleProject.vue'
import UploadDragAndDrop from './UploadDragAndDrop.vue'
</script>
<template>
  <PageLayout>
    <h1>Git stats & graphs</h1>
    <p>Visualize your project&apos;s git history.</p>

    <h2>Upload GIT history</h2>
    <UploadInstructions />
    <UploadDragAndDrop />
    <p class="disclaimer">
      This datafile is never stored! If you reopen or refresh this website you&apos;ll have to
      supply the same file again.
    </p>

    <h2>Alternatively...</h2>
    <p>Select a sample project:</p>
    <SelectSampleProject />
  </PageLayout>
</template>

<style scoped>
.disclaimer {
  font-size: 0.85em;
  margin: 1rem 0;
  color: var(--textSecondary);
}
</style>
