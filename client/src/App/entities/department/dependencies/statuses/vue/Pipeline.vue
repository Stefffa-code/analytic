<template>
  <div class="dnd-pipeline--wrap">
    <div class="dnd-pipeline">
      <div class="dnd-pipeline-title">
        <span> {{pipeline.name}} </span>
        <hr>
      </div>

      <Container
        @drop="onDrop"
        :should-accept-drop="getShouldAcceptDrop"
        :get-child-payload="getPayload"
        drag-class="dnd-status--drag"
        group-name="statuses"
      >
        <Draggable v-for="item in pipeline.statuses" :key="item.id" class="dnd-status--draggable">
          <div class="dnd-status--wrap">
            <div class="dnd-status--prefix" :style="{ 'background-color': item.color, 'color': item.color + '20' }"> </div>
            <div class="dnd-status"> {{item.short_name}}  </div>
          </div>
        </Draggable>
      </Container>

    </div>
  </div>
</template>


<script>
  import { Container, Draggable } from "vue-smooth-dnd";
  import {applyDrag} from "./dragHelper";


  export default {
    name: "DepartmentToStatuses",
    components: {Container, Draggable},
    props: {
      pipeline: {type: Object, required: false,},
    },

    data() {
      return {
      };
    },

    methods: {
      transparentСolor(color){
        return color + '80'
      },
      onDrop(dropResult) {
        if (dropResult.removedIndex === null && dropResult.addedIndex === null)
          return;

        this.pipeline.statuses = applyDrag(this.pipeline.statuses, dropResult);
      },

      getPayload(index){
        return this.pipeline.statuses[index]
      },

      getShouldAcceptDrop(src, payload){
        if(payload.type !== 'status')
          return false;

        return payload.pipeline_id === this.pipeline.id
      }

    },
  }
</script>

<style lang="scss" >
  @import '@/style/darkTheme.scss';

  .dnd-pipeline{
    padding-top: 20px;
    padding-bottom: 15px;
    background-color: $componentBg;
    border-radius: 10px;
    cursor: pointer;
    width: 200px;
    box-shadow: $cardShadow;
    z-index: 2;

    &--wrap{
      margin: 15px 20px;
    }

    &-title{
      margin-bottom: 15px;
      text-align: center;
      padding: 0 20px;
      hr{
        width: 80%;
        border: none;
        color: $lineDark;
        background-color: $lineDark;
        border-bottom: 0.5px solid $lineDark;
        margin-top: 15px;
        margin-bottom: 17px;
      }
    }
  }

.dnd-pipeline-drag{
  background: #000;
  border: 1px solid red;
  padding: 20px;
}
  .dnd-pipeline-drop{
    background: #fff;
  }

  .dnd-pipeline {
    .dnd-status {;
      padding: 8px;
      padding-left: 18px;
      padding-right: 3px;
      border-radius: 0 5px 5px 0;
      font-size: 15px;
      font-weight: 300;
      //
      margin: 10px 0px 10px 0;
      cursor: pointer;
      color: $textSecondary;
      box-shadow: 0px 0px 10px 3px rgba(#131832, 0.4);

      &--prefix {
        $width: 10px;
        width: $width;
        left: -$width;
        position: absolute;
        top: 0px;
        background-color: #fff;
        height: 100%;
        z-index: 1;
        border-radius: 3px 0 0 3px;
        &:after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(0, 0, 0, .05), rgba(0, 0, 0, 0.3));

        }
      }

      &--draggable.smooth-dnd-draggable-wrapper {
        overflow: visible;
      }
    }

    .dnd-status--wrap {
      position: relative;
      margin-right: 12px;
      border-radius: 0 3px 3px 0;
      &:hover {
        transition: .3s;
        background-color: #1A2749;

        .dnd-status--prefix {
          $w: 13px;
          width: $w;
          left: -$w;
          transition: .3s;
          box-shadow: 0px 0px 6px 4px ;

          &:after {
            opacity: 0;
          }
        }
      }
    }


  }

  .dnd-status--drag{
    background: #1A2749;
  }

</style>
