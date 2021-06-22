<template>
  <div>
    <Container
      @drop="onDropDepartments"
      orientation="horizontal"
      :get-child-payload="getPayloadDepartments"
    >
        <Draggable v-for="item in scene.departments" :key="item.id">
          <Department
            :department="item"
          />
        </Draggable>

    </Container>

    <Container
      @drop="onDropPipeline"
      orientation="horizontal"
      :get-child-payload="getPayloadPipelines"
    >
      <Draggable v-for="item in scene.pipelines" :key="item.id">
        <Pipeline
          :pipeline="item"
        />
      </Draggable>
     </Container>
  </div>
</template>


<script  >
  import { Container, Draggable } from "vue-smooth-dnd";
  import Pipeline from './Pipeline.vue'
  import Department from './Department.vue'
  import {DropScene} from "./DropScene";
  import {applyDrag} from "./dragHelper";


  export default {
    name: "DepartmentToStatuses",
    components: { Container, Draggable, Pipeline, Department },

    data() {
      return {
        scene: DropScene.self,
      };
    },

    computed:{
    },

    methods: {
      onDropPipeline(dropResult) {
        let newPipelines = applyDrag(this.scene.pipelines, dropResult);
        this.scene.setPipelines(newPipelines)
      },

      onDropDepartments(dropResult) {
        let newDepartments = applyDrag(this.scene.departments, dropResult);
         this.scene.setDepartments(newDepartments)
      },

      getPayloadPipelines(index){
        return this.scene.pipelines[index]
      },

      getPayloadDepartments(index){
        return this.scene.departments[index]
      },
    },
  }
</script>

<style lang="scss">
  .dnd-status--drag{
    background: #1A2749;
    padding: 0px;

    .dnd-status{
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .dnd-status--prefix{
      height: 100%;
      width: 4px;
      left: -4px;
      &:after{
        opacity: 0;
      }
     }
  }
</style>
