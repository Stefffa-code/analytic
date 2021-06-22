<template>
  <div class="segment-cell" >

    <div v-for="(status, index) in cell.statuses "
      class="segment-cell-item"
    >
      <span> {{status.name}} </span>
      <span @click="deleteStatus(status)" class="delete-icon">
        <svg-icon :name="'cross'" />
      </span>
    </div>

    <DropFormSelect
      :key="'pip-statuses-show-' + showStatuses().length"
      :list="showStatuses()"
      :trackBy="'id'"
      :label="'name'"
      :multySelect="true"
      :taggable="false"
      :hideSelected="false"
      :selected="[]"
      :triggerName="'добавить статусы'"
      @select="selectStatuses($event)"
    >
    </DropFormSelect>

  </div>
</template>



<script lang="ts">
  import Vue from "vue";
  import {Cell, ViewSegment} from "../ViewSegment";
  import SvgIcon from "../../../../components/ui/SvgIcon.vue"
  import DropFormSelect from '../../../../components/ui/select/DropFormSelect.vue'


  export default Vue.extend({
    name: 'SegmentCell',
    components: {   SvgIcon, DropFormSelect  },
    props: {
      cell: { type: Cell, required: true },
      statuses: { type: Array , required: false, default: [] },
    },

    methods: {
      selectStatuses(selected){
        this.cell.addStatuses(selected.chacked)
      },

      deleteStatus(status){
        this.cell.deleteStatuses([status.id])
      },

      showStatuses(){
        return this.statuses.filter(i => !i.hide)
      }
    }

  })
</script>

<style lang="scss" scoped>
  .svg-icon--cross{
    width: 10px;
    height: 10px;
    display: inline-block;
    margin-left: 3px;
    color: #ea3434;
  }

  .segment-cell-item{
    padding: 2px 0;
    cursor:pointer;
    .delete-icon{
      opacity: 0;
      transition: .3s;
    }
    &:hover .delete-icon{
      opacity: 1;
    }
  }
</style>
