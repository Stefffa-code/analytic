<template>
  <div class="container">


    <div class="dates-radio">
      <input  id="dates-radio-1" type="radio" value="yesterday" v-model="dateType">
      <label for="dates-radio-1">Вчера</label>

      <input  id="dates-radio-2" type="radio" value="month" v-model="dateType">
      <label for="dates-radio-2">Месяц</label>

      <input  id="dates-radio-4" type="radio" value="year" v-model="dateType">
      <label for="dates-radio-4">Год</label>
    </div>

    <div class="date-text" >
      <span>  {{formattedDates().start }} - {{formattedDates().end }} </span>
    </div>

  </div>
</template>


<script>
  import {DatesRange} from "../GlobalFilter";

  export default {
    name: 'FilterDate',
    components: {   },
    props: {
      filter: { type: Object, required: true }
    },

    data() {
      return {
        redrawDate: 0,
        dateType: 'month',
        range: {}
      }
    },

    methods: {
      formattedDates(){
        return{
          start: DatesRange.formateDate(this.range.start),
          end: DatesRange.formateDate(this.range.end),
        }
      }
    },

    watch: {
      dateType(val){
        switch (val) {
          case 'yesterday': this.filter.setYesterdayRange(); break;
          case 'month': this.filter.setMonthRange(); break;
          case 'year': this.filter.setYearRange(); break;
        }
        // this.redrawDate++
        this.range = this.filter.range
        this.$emit('changeFilter')
      }
    },

    mounted() {
      this.range = this.filter.range
    }

  }
</script>


<style lang="scss" scoped >
  @import '@/style/darkTheme.scss';
  .container{
    padding-top: 20px;
    margin-bottom: 25px;
  }

  .dates-radio{
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;

    input[type=radio]{
      display: none;
    }

    input[type=radio]:checked + label {
      background: $pink;
      color: white;
    }

    label  {
      border-radius: 3px;
      background: #13192a;
      padding: 5px 15px;
      font-size: 14px;
      color: $textSecondary;
    }
  }

  .date-text{
    margin-top: 20px;
    margin-bottom: 20px;
    font-weight: 300;
    text-align: center;
  }

</style>
