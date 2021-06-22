<template>
  <accordeon  :key="'sdsd'"
      :rounded="false"
      :openByDefault="false"
  >
    <div slot="header" class="accordeon-title" >
      <span  >
        <span v-if="segment.isCorrect">
          <svg-icon  :name="'check'" />
        </span>
         <span v-else
               class="uncorrect-segment"
               data-title="Не добавлены воронки или не все статусы использованы!"
         >
           <svg-icon  :name="'warning'" />
         </span>
       </span>

      <span> {{ segment.name }} </span>
    </div>
    <slot>
      <div >
        <InputNameLight
          class="d-funnels-merge-card__name-merge"
          :value="segment.name"
          :underline="true"
          :label="'Название:'"
          @change="changeSegmentName($event)"
        />

        <div class="d-table-outer">
          <div class="d-table-inner">
            <table >
              <tr class="d-table-row-header">
                <th class="d-funnels-merge-card__name-stage d-funnels-merge-card__name-stage-title d-table-fixed-column ">
                  Название этапа
                </th>

                <th v-for="(pipeline, index) in segment.pipelines"
                    :key="'merge-pipelines-' + index "
                    :style="{color: pipelineColor(index)}"
                >
                  <div class="with-absolute-icon">
                    <div>{{pipeline.name}}   </div>
                    <div class="d-funnels-merge-card__delete-icon with-absolute-icon__icon"
                         @click="deletePipelines(pipeline.id)"
                    >
                      <svg-icon :name="'delete'" class="delete__svg-icon"></svg-icon>
                    </div>
                  </div>
                </th>

                <th >
                  <DropFormSelect :key="'drop-pipelines-' + dropPipelines().length"
                    :list="dropPipelines()"
                    :trackBy="'id'"
                    :label="'name'"
                    :multySelect="true"
                    :taggable="false"
                    :hideSelected="true"
                    :selected="[]"
                    :triggerName="'выбрать воронки'"
                    @select="addPipelines($event)"
                  >
                  </DropFormSelect>
                </th>
              </tr>

              <tr v-for="(stage, index) in segment.stages" :key="'stages-' + index ">

                <td class="d-funnels-merge-card__name-stage d-table-fixed-column">
                  <div  v-if="stage.closed" >
                    {{stage.name}}
                  </div>
                  <div v-else class="with-absolute-icon" >
                    <InputNameLight :key="'stage-name-' + stage.id"
                      class="d-funnels-merge-card__name-stage-statuses"
                      :underline="false"
                      :inheritStyle="true"
                      :withLabel="false"
                      :value="stage.name"
                      @change="changeStageName($event, stage)"
                    />

                    <div @click="deleteStage(stage.id)" class="d-funnels-merge-card__delete-icon with-absolute-icon__icon">
                      <svg-icon :name="'delete'" ></svg-icon>
                    </div>
                  </div>

                </td>

                <td class="d-funnels-merge-card__selected-statuses"
                    v-for="(pipeline, i) in segment.pipelines"
                    :key="'pipelines-' + i + '-' + pipeline.id "
                >
                  <SegmentCell
                    :cell="getCell(pipeline.id, stage.id)"
                    :statuses="pipeline.dropStatuses"
                  />
                </td>
                <td></td>
              </tr>
              <tr class="d-table-last-row">
                <td class="d-table-fixed-column">
                  <button @click="createNewStage()" class="d-button-merge-add click-trigger"> Добавить этап</button>
                </td>
              </tr>
            </table>

          </div>
        </div>

      </div>


      <div class="buttons">
        <button class="d-button-cancel" @click="$emit('delete', segment.id)"> Удалить </button>
      </div>
    </slot>
  </accordeon>



</template>

<script lang="ts">
  import Vue from 'vue'
  import {mapGetters, mapActions, mapMutations} from 'vuex'

  import Accordeon from '@/components/ui/accordeon/Accordeon.vue'
  import DropFormSelect from '@/components/ui/select/DropFormSelect.vue'
  import {Cell, ViewSegment} from "../../../../App/entities/segment/ViewSegment";
  import {IVuePipelines} from "../../../../App/entities/segment/FSegmentFabric";
  import Pipeline = IVuePipelines.Pipeline;
  import SvgIcon from "@/components/ui/SvgIcon.vue"
  import InputNameLight from "@/components/ui/inputFormElements/InputNameLight.vue"
  import SegmentCell from "./SegmentCell.vue"
 import {colors} from "../../../../constant/const"



  export default Vue.extend({
    name: 'Segment',
    components: { Accordeon, DropFormSelect, SvgIcon, InputNameLight, SegmentCell  },

    props: {
      segment: { type: ViewSegment, required: true },
    },

    data() {
      return {
        pipelinesInSegment: [] as Pipeline[],
        redrawByPip: 0,
      }
    },

    computed:{
      ...mapGetters([ ]),

    },

    methods:{
      pipelineColor(i){
        return colors[i]
      },

      async changeSegmentName(name){
        if(!name) this.$toast.error('Название не может быть пустым')
        await this.segment.updateName(name)
      },

      async addPipelines(selected){
        await this.segment.addLinkPipelines(selected.chacked)
      },
      async deletePipelines(id){
        await this.segment.deleteLinkPipelines([id])
      },
      async createNewStage(){
        await this.segment.createStage()
      },
      async deleteStage(id){
        await this.segment.deleteStage(id)
      },

      async changeStageName(name, stage){
        await stage.updateName(name)
      },

      getCell (pipeline_id: number, stage_id: number): Cell {
        return this.segment.findCell(pipeline_id, stage_id)
      },

      dropPipelines(){
        return this.segment.unusedPipelines
      }

    },

    mounted(): void {
      this.pipelinesInSegment = this.segment.pipelines
    }


  })
</script>

<style lang="scss" scoped>
  @import "@/style/darkTheme.scss";
  @import '@/style/mixin.scss';

  .accordeon-title{
    display: flex;
    align-items: center;
    .svg-icon{
      width: 15px;
      height: 15px;
      margin-right: 9px;
    }

    .svg-icon--check{
      color: $green;
      font-weight: 400;
    }
    .svg-icon--warning{
      color: #d3ac54;
      font-weight: 400;
    }
  }

  .buttons{
    padding-top: 35px;
  }
  .click-trigger:hover{
    color: $green;
  }
  .with-absolute-icon{
    position: relative;
    padding-right: 23px;
    /*min-width: 190px;*/
  // padding-right: 15px;
    text-align: left;
  &__icon{
     position: absolute;
     top: 0;
     right: 0;
     opacity: 0;
   }
  &:hover .with-absolute-icon__icon{
     opacity: 1;
   }
  }
  table{
    text-align: left;

    tr:nth-child(even){
      background-color: #11162D;
    }
    th{
      font-size: 16px;
    }
    th, td{
      padding-left: 15px;
      padding-right: 15px;
    }
  }

  .d-table{
    &-outer {
       position: relative
     }
    &-inner {
       overflow-x: scroll;
       overflow-y: visible;
       margin-left: 215px;
     }

    &-header-div{
       min-width: 145px;
     }
    &-fixed-column{
       position: absolute;
       padding-left: 0px;
       left: 0;
       z-index: 1;
       width: 200px;
      &.add-stage{
         padding: 15px 0;
      }
    }

    &-last-row{
       background-color: transparent;
       height: 40px;
     }

  }
  .d-button-merge-add{
    color: $triggerColor;
    font-size: 15px;
    text-transform: lowercase;
    margin-top: 20px;
    transition: .3s;
    &:hover{
      color:lighten($triggerColor, 15)
    }
  }
  .d-funnels-merge-card{
    &__wrong-input{
       font-size: 13px;
       margin-top: 7px;
       padding-top: 7px;
       color: $textSecondary;
       position: relative;
       font-weight: 300;
      &:before{
         display: block;
         content: '';
         position: absolute;
         top: 0;
         width: 100px;
         height: 1px;
         background-color: $lineColor;
      }
    }

  &__send-form{
     margin-top: 30px;
     display: flex;
     justify-content: flex-end;
  }
  &__name-merge{
     margin: 15px 0 80px 0px;
  }

  &__name-stage{
     font-weight: 300;
     color: $textSecondary;
     text-align-last: left;
    &-statuses:hover{
       color: $text;
     }
    &-title{
       color: $text;
     }
    &-closed{
       color: $textSecondary;
    }
  }

  &__selected-statuses{
     font-weight: 300;
  }

  &__delete-icon{
     display: inline-block;
     margin-left: 2px;
     color:$textSecondary;
     &:hover{
       color: $text
     }
  }
}
  .uncorrect-segment{
    position: relative;
    &:after{
      transition: 1s;
      opacity: 0;
      transform: rotate(45deg)  translateY(20px);
    }
    &:before{
      transition: 1s;
      opacity: 0;
      transform: translateY(20px);
    }

    &:hover{
      &:after{
        transition: 1s;
        content: attr(data-title);
        position: absolute;
        left: -20px;
        top: 130%;
        z-index: 2;
        padding: 8px 15px;
        background: #2c3152;
        width: 200px;
        font-size: 13px;
        border-radius: 10px;
        opacity: 1;
        color: #9db7cd;
        transform: translateY(0px);
      }
      &:before{
        position: absolute;
        content: '';
        width: 15px;
        height: 15px;
        background:  #2c3152;
        transform: translateY(0) rotate(45deg);
        top: 110%;
        left: 10px;
        z-index: 2;
        opacity: 1;
      }
    }
  }



</style>
