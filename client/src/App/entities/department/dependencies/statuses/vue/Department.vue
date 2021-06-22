<template>
  <div class="dnd-department--wrap" :key="'drag-pipeline-' + department.id">
    <div class="dnd-department">

      <div class="dnd-department-title" ref="title">
        {{department.name}}
      </div>

      <Container
        @drop="onDrop"
        :should-accept-drop="getShouldAcceptDrop"
        :get-child-payload="getPayload"
        :remove-on-drop-out="dropOut()"
        @drag-end="dragEnd"
        drag-class="dnd-status--drag"
        group-name="statuses"
        class="dnd-department--container"
      >
        <Draggable v-for="item in department.statuses" :key="item.id">
          <div class="dnd-status--wrap">
            <div class="dnd-status--prefix" :style="{ 'background-color': item.color }"></div>
            <div class="dnd-status">
              <div class="dnd-status--name"> {{item.short_name}} </div>
              <div class="dnd-status--pipline-name"> {{item. pipeline_name_short}} </div>
            </div>
          </div>
        </Draggable>

      </Container>

    </div>
  </div>
</template>


<script>
  import { Container, Draggable } from "vue-smooth-dnd";
  import {applyDrag } from "./dragHelper";
  import {DropScene} from "./DropScene";


  export default {
    name: "DepartmentToStatuses",
    components: {Container, Draggable},
    props: {
      department: {type: Object, required: false,},
    },

    data() {
      return {
        scene: DropScene.self,
      };
    },
    methods: {
      async onDrop(dropResult) {
        if (dropResult.removedIndex === null && dropResult.addedIndex === null)
          return;

        if (dropResult.removedIndex === null  && dropResult.addedIndex !== null ){
          await this.scene.addStatus(this.department.id, dropResult.payload)
        }

        this.department.statuses = applyDrag(this.department.statuses, dropResult);
      },

      getPayload(index){
        return this.department.statuses[index]
      },

      getShouldAcceptDrop(src, payload){
        return payload.type === 'status'
      },

      async dragEnd(dragResult){
        if(dragResult.isSource){
          await this.scene.deleteStatus(this.department.id, dragResult.payload)
        }
      },

      dropOut( ){
        // return true
      },
     },

  }
</script>

<style lang="scss" >
  @import '@/style/darkTheme.scss';

  .dnd-department{
    padding-top: 20px;
    background-color: $componentBg;
    box-shadow: $cardShadow;
    border-radius: 10px;
    cursor: pointer;
    padding-bottom: 35px;

    &--wrap{
      padding: 10px 20px;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    &-title{
      font-size: 18px;
      margin-bottom: 16px;
      text-align: center;
    }
    &--container{
      height: 300px;
      width: 360px;
      overflow-y: scroll;
      padding-left: 30px;
      padding-right: 20px;
    }
  }

  .dnd-department-drag{
    background: #000;
    border: 1px solid red;
    padding: 20px;
  }
  .dnd-department-drop{
    background: #fff;
  }

  .dnd-department{
    .dnd-status--name{
      display: inline-block;
      color: $text;
      font-weight: 300;
      width: 160px;
    }
    .dnd-status--pipline-name{
      display: inline-block;
      font-weight: 300;
      /*width: 100px;*/
    }
    .dnd-status{
      padding: 12px 0;
      padding-left: 18px;
      border-radius: 0 5px 5px 0;
      font-size: 15px;
      cursor: pointer;
      color: $textSecondary;
      border-bottom: 1px solid $lineDark;

      &--prefix{
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-50%);
        background-color: #fff;
        width: 2px;
        height: 70%;
        z-index: 1;
        border-radius: 3px 0 0 3px;
        transition: all .3s;
      }
    }

    .dnd-status--wrap{
      position: relative;
      border-radius: 3px;
      &:hover{
        background-color:  #1A2749;
        .dnd-status--prefix{
          height: 100%;
          width: 3px;
        }
      }
    }
  }



</style>
