<template>
  <div class="departments">    
    <accordeons-group
      :addLabel="'Добавить отдел'"
      :openByDefault="true"
      @add="createDepartment()"
    >
      <div slot="header"> Отделы компании </div>

      <slot>
        <the-department  class="department"
          v-for="(item, index) in Departments"
          :key="'department-' + index"
          :department="item"
          @remove="removeDepartment($event)"
        />
      </slot>
    </accordeons-group>


  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import AccordeonsGroup from '@/components/ui/accordeon/AccordeonsGroup.vue'
import Accordeon from '@/components/ui/accordeon/Accordeon.vue'
import {mapGetters} from "vuex";
import TheDepartment from "@/App/entities/department/vue/TheDepartment.vue";
import {IDepartmentsFabricSpace} from "../../../../App/entities/department/FDepartmentsFabric";
import FDepartmentsFabric = IDepartmentsFabricSpace.FDepartmentsFabric;



export default Vue.extend({
  name: 'DepartmentGroup',

  components: { AccordeonsGroup, Accordeon, TheDepartment  },

  data(): any {
    return {   }
  },

  computed: {
    ...mapGetters(['Departments', 'accountID']),
  },

  methods:{
    async createDepartment(): Promise<void>{
      await FDepartmentsFabric.self.create()
    },
    async removeDepartment(id): Promise<void>{
      await FDepartmentsFabric.self.remove([id])
    },
  },

  mounted(){

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
