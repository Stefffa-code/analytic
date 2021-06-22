<template>
  <div>
    <base-submenu v-for="(pipeline, index) in pipelines"
                 :menu="pipeline.entityShort"
                 :selectedChildren="selectedStatuses(pipeline.id)"
                 :selectedParent="ifSelectPipeline(pipeline.id)"
                 @clickChild="clickPipelineChild($event)"
                 @clickParent="clickPipeline(pipeline.entityShort.id)"
    />
  </div>
</template>

<script>
  import BaseSubmenu from "./BaseSubmenu.vue";
  import {AppStorage} from "../../../AppStorage";

  export default {
    name: 'AnalyticFilter',

    components: {BaseSubmenu },

    props: {
      filter: { type: Object, required: true }
    },

    data() {
      return {
        departments: [],
        pipelines: [],
        segments: [],
      }
    },

    methods: {
      ifSelectPipeline(id){
        return !!this.filter.pipelines.find(pip => pip.id === id)
      },

      clickPipeline(id){
        let select = this.ifSelectPipeline(id)

        if(select) this.filter.uncheckPipelines([id])
        else  this.filter.checkPipelines([id])

        this.$emit('changeFilter')
      },

      clickPipelineChild(data){
        let pip_id = data.parent.id, status_id = data.child.id
        let select = this.isSelectStatus(pip_id, status_id )

        if(select) this.filter.uncheckStatuses(pip_id, [status_id]);
        else this.filter.checkStatuses(pip_id, [status_id]);

        this.$emit('changeFilter')
      },

      isSelectStatus(pipeline_id, status_id){
        let pip =  this.filter.allPipelines.find(p => p.id === pipeline_id)
        return pip.statuses_id.includes(status_id)
      },

      selectedStatuses(pipeline_id){
        let pip = this.filter.allPipelines.find(p => p.id === pipeline_id)
        return pip ? pip.statuses_id : []
      }
    },

    mounted() {
      this.pipelines = AppStorage.pipelines.pipelines
      this.segments = AppStorage.pipelines.segments
    }

  }
</script>

<style lang="scss" scoped >
  @import '@/style/darkTheme.scss';

  .menu{
    display: flex;
  };
</style>
