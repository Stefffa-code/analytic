<template>
  <div class="departments" :key="'segments-group-'">
    <accordeons-group
      :addLabel="'Добавить группу воронок'"
      :openByDefault="true"
      @add="createSegment()"
    >
      <div slot="header"> Объединение воронок </div>

      <slot>
        <Segment  class="segments-group"
           v-for="(item, index) in Segments"
           :key="'segment-' + index "
           :segment="item"
           @delete="deleteSegment($event)"
        />
      </slot>
    </accordeons-group>


  </div>
</template>


<script lang="ts">
  import Vue from 'vue'
  import AccordeonsGroup from '../../../../components/ui/accordeon/AccordeonsGroup.vue'
  import Accordeon from '../../../../components/ui/accordeon/Accordeon.vue'
  import {mapGetters} from "vuex";
  import Segment from "@/App/entities/segment/vue/Segment.vue";
  import {ViewSegmentsFabric} from "../../../../App/entities/segment/ViewSegment";


  export default Vue.extend({
    name: 'SegmentGroup',

    components: { AccordeonsGroup, Accordeon, Segment  },

    data(): any {
      return {
        allSegments: [],
        segmentsLength: 0,
        redrawByPip: 0
      }
    },

    computed: {
      ...mapGetters([  'Segments' ]),

    },

    methods:{
      async createSegment(): Promise<void>{
        let res = await ViewSegmentsFabric.inst.createViewSegment()
        this.updateLength()
      },

      async deleteSegment(id): Promise<void>{
        let res = await ViewSegmentsFabric.inst.deleteViewSegments([id])
        this.updateLength()
      },

      updateLength(){
        this.segmentsLength = ViewSegmentsFabric.inst.viewSegments
        this.redraw++
      }
    },

    watch: {
      segmentsLength(){
        this.redraw++
      }
    },

    mounted(){
      this.allSegments = ViewSegmentsFabric.inst.viewSegments
    }


  })
</script>

<style scoped>
  .departments{
    margin-top: 20px;
  }
  .department{
    margin: 2px 0 ;
  }
</style>
