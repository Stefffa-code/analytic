<template>
    <div class="loading-layout">
      <!-- <HumanPreloader /> -->
      <ThreeCircleLoader />
    </div>
</template>

<script>
import HumanPreloader from '@/components/ui/loaders/HumanPreloader'
import ThreeCircleLoader from '@/components/ui/loaders/ThreeCircleLoader'

export default {
  components: { HumanPreloader, ThreeCircleLoader },
}
</script>

<style lang="scss" scoped>
@import '@/style/darkTheme.scss';

.loading-layout{
  background-color: $componentBg;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
}
</style>
