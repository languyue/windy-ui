<template>
  <div class="view-content">
    <el-row class="controll-line">
      <el-col :span="12">
        <el-radio-group v-model="selectTime" size="mini" @input="selectDate">
          <el-radio-button :label="7">最近一星期</el-radio-button>
          <el-radio-button :label="30">1个月</el-radio-button>
          <el-radio-button :label="90">3个月</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <div class="demand-view">
      <el-row class="data-view-line">
        <el-col :span="8">
          <div id="demand" style="height: 300px"></div>
        </el-col>
        <el-col :span="8">
          <div id="status" style="height: 300px"></div>
        </el-col>
        <el-col :span="8">
          <div id="gauge" style="height: 300px"></div>
        </el-col>
      </el-row>
      <div class="view-second-line" id="delay" style="height: 400px"></div>
      <el-row class="view-second-line">
        <el-col :span="16">
          <div id="bug" style="height: 400px; width: 100%"></div>
        </el-col>
        <el-col :span="8">
          <div id="gauge_analysis" style="height: 400px; width: 100%"></div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import * as echarts from "echarts";
import { nextTick } from "vue";
import metricApi from "../../http/MetricApi";
export default {
  data() {
    return {
      selectTime: 7,
      queryTime: 0,
      echartList: [],
    };
  },
  methods: {
    selectDate(days){
      const now = new Date();
      const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const target = new Date(todayZero.getTime() - days * 24 * 60 * 60 * 1000);
      this.queryTime = target.getTime();
    },
    initHealthyStatistics(rawData) {
      function transformHealthyData(rawData) {
        const seen = new Set();
        const result = [["健康度", "类型", "时间"]];
        const typeSet = new Set();

        rawData.forEach((item) => {
          const date = new Date(item.time);
          const dayStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const key = `${dayStr}-${item.typeName}`;

          if (!seen.has(key)) {
            seen.add(key);
            result.push([item.value, item.typeName, dayStr]);
            typeSet.add(item.typeName);
          }
        });

        // 排序按时间升序
        result.sort((a, b) => {
          if (typeof a[0] === "string") return -1;
          if (typeof b[0] === "string") return 1;
          return new Date(a[2]) - new Date(b[2]);
        });

        return {
          formattedData: result,
          typeList: Array.from(typeSet),
        };
      }
      // Step 2: 初始化图表
      const chartDom = document.getElementById("gauge_analysis");
      const myChart = echarts.init(chartDom);
      this.echartList.push(myChart);

      // Step 3: 转换数据
      const { formattedData, typeList } = transformHealthyData(rawData);

      // Step 4: 构造 dataset 和 series
      const datasetWithFilters = [];
      const seriesList = [];

      typeList.forEach((typeName) => {
        const datasetId = "dataset_" + typeName;

        datasetWithFilters.push({
          id: datasetId,
          fromDatasetId: "dataset_raw",
          transform: {
            type: "filter",
            config: {
              and: [{ dimension: "类型", "=": typeName }],
            },
          },
        });

        seriesList.push({
          type: "line",
          datasetId: datasetId,
          name: typeName,
          showSymbol: false,
          endLabel: {
            show: true,
            formatter: function (params) {
              return params.value[1] + ": " + params.value[0];
            },
          },
          labelLayout: {
            moveOverlap: "shiftY",
          },
          emphasis: {
            focus: "series",
          },
          encode: {
            x: "时间",
            y: "健康度",
            label: ["类型", "健康度"],
            itemName: "时间",
            tooltip: ["健康度"],
          },
        });
      });

      // Step 5: 设置图表 option
      const option = {
        animationDuration: 1000,
        dataset: [
          {
            id: "dataset_raw",
            source: formattedData,
          },
          ...datasetWithFilters,
        ],
        title: {
          text: "系统健康度变化趋势图",
        },
        tooltip: {
          order: "valueDesc",
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          name: "时间",
        },
        yAxis: {
          name: "健康度",
        },
        grid: {
          right: 140,
        },
        series: seriesList,
      };

      // Step 6: 应用配置
      myChart.setOption(option);
    },
    initBugList(rawData) {
      function transformBugData(rawData) {
        const seen = new Set();
        const result = [["个数", "类型", "时间"]];
        const typeSet = new Set();

        rawData.forEach((item) => {
          const date = new Date(item.time);
          const dayStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const key = `${dayStr}-${item.statusName}`;

          if (!seen.has(key)) {
            seen.add(key);
            result.push([item.value, item.statusName, dayStr]);
            typeSet.add(item.statusName);
          }
        });

        // 排序按时间升序
        result.sort((a, b) => {
          if (typeof a[0] === "string") return -1;
          if (typeof b[0] === "string") return 1;
          return new Date(a[2]) - new Date(b[2]);
        });

        return {
          formattedData: result,
          typeList: Array.from(typeSet),
        };
      }
      // Step 2: 初始化图表
      const chartDom = document.getElementById("bug");
      const myChart = echarts.init(chartDom);
      this.echartList.push(myChart);

      // Step 3: 转换数据
      const { formattedData, typeList } = transformBugData(rawData);

      // Step 4: 构造 dataset 和 series
      const datasetWithFilters = [];
      const seriesList = [];

      typeList.forEach((typeName) => {
        const datasetId = "dataset_" + typeName;

        datasetWithFilters.push({
          id: datasetId,
          fromDatasetId: "dataset_raw",
          transform: {
            type: "filter",
            config: {
              and: [{ dimension: "类型", "=": typeName }],
            },
          },
        });

        seriesList.push({
          type: "line",
          datasetId: datasetId,
          name: typeName,
          showSymbol: false,
          endLabel: {
            show: true,
            formatter: function (params) {
              return params.value[1] + ": " + params.value[0];
            },
          },
          labelLayout: {
            moveOverlap: "shiftY",
          },
          emphasis: {
            focus: "series",
          },
          encode: {
            x: "时间",
            y: "个数",
            label: ["类型", "个数"],
            itemName: "时间",
            tooltip: ["个数"],
          },
        });
      });

      // Step 5: 设置图表 option
      const option = {
        animationDuration: 1000,
        dataset: [
          {
            id: "dataset_raw",
            source: formattedData,
          },
          ...datasetWithFilters,
        ],
        title: {
          text: "缺陷变化趋势图",
        },
        tooltip: {
          order: "valueDesc",
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          name: "时间",
        },
        yAxis: {
          name: "个数",
        },
        grid: {
          right: 140,
        },
        series: seriesList,
      };

      // Step 6: 应用配置
      myChart.setOption(option);
    },
    initDemandDelay(dateList, series) {
      var chartDom = document.getElementById("delay");
      var myChart = echarts.init(chartDom);
      this.echartList.push(myChart);
      var option;

      option = {
        title: {
          text: "需求搁置时长 vs 完整周期",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["搁置时长", "完整周期"],
        },
        toolbox: {
          show: true,
          feature: {
            // dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            // restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            // prettier-ignore
            data: dateList,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: series,
        // [
        //   {
        //     name: "搁置时长",
        //     type: "bar",
        //     data: [
        //       2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4,
        //       3.3,
        //     ],
        //     markPoint: {
        //       data: [
        //         { type: "max", name: "Max" },
        //         { type: "min", name: "Min" },
        //       ],
        //     },
        //     markLine: {
        //       data: [{ type: "average", name: "Avg" }],
        //     },
        //   },
        //   {
        //     name: "完整周期",
        //     type: "bar",
        //     data: [
        //       2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0,
        //       2.3,
        //     ],
        //     markPoint: {
        //       data: [
        //         { name: "Max", value: 182.2, xAxis: 7, yAxis: 183 },
        //         { name: "Min", value: 2.3, xAxis: 11, yAxis: 3 },
        //       ],
        //     },
        //     markLine: {
        //       data: [{ type: "average", name: "Avg" }],
        //     },
        //   },
        // ],
      };

      option && myChart.setOption(option);
    },
    initDemand(types, seriesList) {
      var chartDom = document.getElementById("demand");
      var myChart = echarts.init(chartDom);
      this.echartList.push(myChart);
      var option;

      option = {
        title: {
          text: "需求Top统计",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {},
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
        },
        yAxis: {
          type: "category",
          data: types,
        },
        series: seriesList,
      };

      option && myChart.setOption(option);
    },
    initGauge(value) {
      var chartDom = document.getElementById("gauge");
      var myChart = echarts.init(chartDom);
      this.echartList.push(myChart);
      var option;
      option = {
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            center: ["50%", "75%"],
            radius: "90%",
            min: 0,
            max: 1,
            splitNumber: 8,
            axisLine: {
              lineStyle: {
                width: 6,
                color: [
                  [0.25, "#FF6E76"],
                  [0.5, "#FDDD60"],
                  [0.75, "#58D9F9"],
                  [1, "#7CFFB2"],
                ],
              },
            },
            pointer: {
              icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
              length: "12%",
              width: 20,
              offsetCenter: [0, "-60%"],
              itemStyle: {
                color: "auto",
              },
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: "auto",
                width: 2,
              },
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: "auto",
                width: 5,
              },
            },
            axisLabel: {
              color: "#464646",
              fontSize: 20,
              distance: -60,
              rotate: "tangential",
              formatter: function (value) {
                if (value === 0.875) {
                  return "健康";
                } else if (value === 0.625) {
                  return "正常";
                } else if (value === 0.375) {
                  return "阻塞";
                } else if (value === 0.125) {
                  return "低效";
                }
                return "";
              },
            },
            title: {
              offsetCenter: [0, "-10%"],
              fontSize: 20,
            },
            detail: {
              fontSize: 30,
              offsetCenter: [0, "-35%"],
              valueAnimation: true,
              formatter: function (value) {
                return Math.round(value * 100) + "";
              },
              color: "inherit",
            },
            data: [
              {
                value: value,
                name: "健康评估",
              },
            ],
          },
        ],
      };
      option && myChart.setOption(option);
    },
    initStatus(array) {
      var chartDom = document.getElementById("status");
      var myChart = echarts.init(chartDom);
      this.echartList.push(myChart);
      var option;

      option = {
        title: {
          text: "需求状态比例",
        },
        legend: {
          top: "top",
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
          },
        },
        series: [
          {
            name: "Nightingale Chart",
            type: "pie",
            radius: [0, 100],
            center: ["50%", "50%"],
            roseType: "area",
            itemStyle: {
              borderRadius: 8,
            },
            data: array,
          },
        ],
      };

      option && myChart.setOption(option);
    },
    getDemandStatistics() {
      metricApi.getDemandStatistics().then((res) => {
        let list = res ? res.data : [];
        const types = [...new Set(list.map((item) => item.demandType))];
        const dataMap = {};
        list.forEach(({ dataType, demandType, dataValue }) => {
          if (!dataMap[dataType]) {
            dataMap[dataType] = {};
          }
          dataMap[dataType][demandType] = dataValue;
        });

        const series = Object.entries(dataMap).map(([dataType, valueMap]) => {
          return {
            name: dataType,
            data: types.map((type) => valueMap[type] || 0),
            ...{ type: "bar" },
          };
        });
        this.initDemand(types, series);
      });
    },
    getDemandStatusStatistics() {
      metricApi.getDemandStatusStatistics().then((res) => {
        let array = [];
        res.data.forEach((e) => {
          array.push({ name: e.statusName, value: e.percent });
        });
        this.initStatus(array);
      });
    },
    getSystemHealthy() {
      metricApi.getSystemHealthy().then((res) => {
        console.log("healthddd", res);
        this.initGauge(res.data.healthyValue / 100);
      });
    },
    getDemandDelayWorkload() {
      metricApi.getDemandDelayWorkload(this.queryTime).then((res) => {
        const transformData = this.transformMetricData(res.data);
        this.initDemandDelay(transformData.xAxis, transformData.series);
      });
    },
    transformMetricData(rawData) {
      const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const y = date.getFullYear();
        const m = `${date.getMonth() + 1}`.padStart(2, "0");
        const d = `${date.getDate()}`.padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const grouped = {}; // { '2025-06-16': { '需求工时': 100, '需求搁置时长': 50 }, ... }
      const metricTypes = new Set();

      rawData.forEach((item) => {
        const day = formatDate(item.time);
        if (!grouped[day]) grouped[day] = {};
        if (!grouped[day][item.metricName]) grouped[day][item.metricName] = 0;

        grouped[day][item.metricName] += item.value;
        metricTypes.add(item.metricName);
      });

      const sortedDates = Object.keys(grouped).sort(); // x 轴按时间排序
      const series = Array.from(metricTypes).map((metric) => ({
        name: metric,
        type: "bar",
        data: sortedDates.map((date) => grouped[date][metric] || 0),
      }));

      return {
        xAxis: sortedDates,
        series,
      };
    },
    getBugStatusStatistics() {
      metricApi.getBugStatusStatistics(this.queryTime).then((res) => {
        this.initBugList(res.data);
      });
    },
    getHealthyStatistics() {
      metricApi.getHealthyStatistics(this.queryTime).then((res) => {
        this.initHealthyStatistics(res.data);
      });
    },
    reloadCharts(){
      this.getDemandStatistics();
      this.getDemandStatusStatistics();
      this.getSystemHealthy();
      this.getDemandDelayWorkload();
      this.getBugStatusStatistics();
      this.getHealthyStatistics();
    },
  },
  created() {
    nextTick(() => {
      this.reloadCharts()
    });
  },
  destroyed() {
    if (this.echartList) {
      this.echartList.forEach((e) => {
        if (e) {
          e.dispose();
        }
      });
    }
  },
};
</script>
<style lang="less" scoped>
.view-content {
  position: relative;
  padding-top: 10px;
  min-height: 300px;

  .controll-line {
    width: 450px;
    position: absolute;
    right: 10px;
    z-index: 1000;
  }
  .demand-view {
    margin-top: 20px;

    .view-second-line {
      margin-top: 20px;
    }
  }
}
</style>
