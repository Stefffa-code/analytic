<template> 
  <accordeon  :key="'sdsd'"
    :rounded="false"
    :openByDefault="false"
  >
    <div slot="header">
      <span> {{ changeModel.title }}</span>
    </div>
    <slot>

      <div>
        <InputNameLight
          v-model="changeModel.title"
          @change="updateName($event)"
          :label="'Название отдела:'"
        />
      </div>
      <br>

<!--      <div>-->
<!--        <span> Вышестоящий отдел: </span>-->
<!--        <DropFormSelect-->
<!--          :list="Departments"-->
<!--          :trackBy="'id'"-->
<!--          :label="'title'"-->
<!--          :selected="changeModel.parentDepartment"-->
<!--          @delete="deleteHeadDepartment($event)"-->
<!--          @select="addHeadDepartment($event)"-->
<!--        />-->
<!--      </div>-->

      <br>
      <div>
        <span> Руководитель:  </span>
        <DropFormSelect
          :list="employeesForHead"
          :trackBy="'id'"
          :label="'name'"
          :selected="changeModel.head"
          @delete="deleteHead($event)"
          @select="selectHead($event)"
        />
      </div>
      <br>
      <div>
        <span> Сотрудники: </span>

        <div class="employees">
          <div v-for=" user in department.employees" class="employees--item">
            {{user.name}}
            <svg-icon :name="'cross'" @click="deleteEmployee(date.id)" />
          </div>
        </div>

        <DropFormSelect
          :key="'drop-employees-' + redrawEmployees"
          :list="employees"
          :trackBy="'id'"
          :label="'name'"
          :multySelect="true"
          :taggable="false"
          :triggerName="'добавить'"
          @delete="deleteEmployee($event)"
          @select="selectEmployees($event)"
          @closeOk="dropEmployees()"
        />
      </div>
      <br>

      <div class="delete-btn" @click="removeDepartment()">Удалить</div>

    </slot>
  </accordeon>
</template>

<script lang="ts">
import Vue from 'vue'
import {mapGetters, mapActions, mapMutations} from 'vuex'

import Accordeon from '@/components/ui/accordeon/Accordeon.vue'
import InputNameLight from '@/components/ui/inputFormElements/InputNameLight.vue'
import DropFormSelect from '@/components/ui/select/DropFormSelect.vue'
import {IDepartmentsFabricSpace} from "../../../../App/entities/department/FDepartmentsFabric";
import Department = IDepartmentsFabricSpace.Department;
import svgIcon from '@/components/ui/SvgIcon.vue'


export default Vue.extend({
  name: 'Department',
  components: { Accordeon, DropFormSelect, InputNameLight, svgIcon  },

  props: {
    department: { type: Department, required: true },
  },
 
  data() {
    return {
      redrawEmployees: 0,
      employeesForHead: [],
      employees: [],
      changeModel: {
        title: '',
        head: {},
        employees: {},
        parentDepartment: {}
      }
    }
  },
  
  computed:{
    ...mapGetters(['Employees', 'Departments']),
  },

  watch: {
    'department.employees'(){
      this.dropEmployees()
    }
  },

  methods:{
    dropEmployees() {
      let employees_id = this.department.employeesLinks.employeesId
      this.employees = this.Employees.filter( i => !employees_id.includes(i.id))
    },

    async updateName(name){
      if(!name){
        this.$toast.error('Название отдела не должно быть пустым!')
        this.title = this.department.title
        return
      }
      await this.department.changeTitle(name)
    },

    async deleteHead(){
      await this.department.changeHead()
    },

    async selectHead(emp: any){
      let head = emp.selected
      await this.department.changeHead(head.id)
    },

    async deleteHeadDepartment(): Promise<void> {
      await this.department.changeHeadDepartment()
    },

    async addHeadDepartment(select ): Promise<void> {
      let depart = select.selected
      await this.department.changeHeadDepartment(depart.id)
    },


    async deleteEmployee(id: number){
      await this.department.deleteEmployeesLinks([id])
    },

    async selectEmployees(emp: any){
        await this.department.createEmployeesLinks(emp.selected.map(i => i.id))
        // await this.department.deleteEmployeesLinks(emp.unchacked.map(i => i.id))
    },

    async removeDepartment(): Promise<void> {
      this.$emit('remove', this.department.id)
    },

  },

  created(){
    this.dropEmployees()
    this.employeesForHead = JSON.parse(JSON.stringify(this.Employees))
    if(this.department){
      this.changeModel = {
          title: this.department.title,
          head: this.department.head,
          employees: this.department.employees,
          parentDepartment: this.department.parentDepartment
      }
      return;
    }
  }

})
</script>

<style lang="scss" scoped>
  @import '@/style/darkTheme.scss';

  .delete-btn{
    display: inline-block;
    margin-left: auto;
    color: $textSecondary;
    cursor: pointer;
    transition: .3s;

    &:hover{

    }
  }

  .employees{
    &--item{
      font-weight: 300;

    }

    .svg-icon--cross{
      width: 11px;
      height: 11px;
      margin-left: 5px;
      &:hover{
        color: $red;
      }
    }
  }
</style>
