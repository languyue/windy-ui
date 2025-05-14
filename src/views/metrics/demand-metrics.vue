<template>
  <div class="view-content">
    <el-row class="controll-line">
      <el-col :span="12">
        <el-radio-group v-model="selectTime" size="mini">
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
export default {
  data() {
    return {
      selectTime: 7,
      echartList: [],
    };
  },
  methods: {
    initBugList() {
      var chartDom = document.getElementById("bug");
      var myChart = echarts.init(chartDom);
      this.echartList.push(myChart);
      var option;

      run([
        ["个数", "类型", "时间"],
        [815, "缺陷总数", 1951],
        [1314, "处理中", 1951],
        [985, "未处理", 1951],
        [986, "已完成", 1951],
        [987, "重新打开", 1951],
      ]);
      function run(_rawData) {
        const countries = [
          "缺陷总数",
          "处理中",
          "未处理",
          "已完成",
          "重新打开",
        ];
        const datasetWithFilters = [];
        const seriesList = [];
        echarts.util.each(countries, function (country) {
          var datasetId = "dataset_" + country;
          datasetWithFilters.push({
            id: datasetId,
            fromDatasetId: "dataset_raw",
            transform: {
              type: "filter",
              config: {
                and: [
                  { dimension: "时间", gte: 1950 },
                  { dimension: "类型", "=": country },
                ],
              },
            },
          });
          seriesList.push({
            type: "line",
            datasetId: datasetId,
            showSymbol: false,
            name: country,
            endLabel: {
              show: true,
              formatter: function (params) {
                console.log("1111111", params);
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
        option = {
          animationDuration: 10000,
          dataset: [
            {
              id: "dataset_raw",
              source: _rawData,
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
            nameLocation: "middle",
          },
          yAxis: {
            name: "个数",
          },
          grid: {
            right: 140,
          },
          series: seriesList,
        };
        myChart.setOption(option);
      }

      option && myChart.setOption(option);
    },
    initDemandDelay() {
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
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "搁置时长",
            type: "bar",
            data: [
              2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4,
              3.3,
            ],
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" },
              ],
            },
            markLine: {
              data: [{ type: "average", name: "Avg" }],
            },
          },
          {
            name: "完整周期",
            type: "bar",
            data: [
              2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0,
              2.3,
            ],
            markPoint: {
              data: [
                { name: "Max", value: 182.2, xAxis: 7, yAxis: 183 },
                { name: "Min", value: 2.3, xAxis: 11, yAxis: 3 },
              ],
            },
            markLine: {
              data: [{ type: "average", name: "Avg" }],
            },
          },
        ],
      };

      option && myChart.setOption(option);
    },
    initDemand() {
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
          data: [
            "客户需求",
            "功能迭代",
            "缺陷修复",
            "功能优化",
            "可靠性",
            "运维",
          ],
        },
        series: [
          {
            name: "需求个数",
            type: "bar",
            data: [18203, 23489, 29034, 104970, 131744, 630230],
          },
          {
            name: "需求工时",
            type: "bar",
            data: [19325, 23438, 31000, 121594, 134141, 681807],
          },
        ],
      };

      option && myChart.setOption(option);
    },
    initGauge() {
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
                value: 0.7,
                name: "健康评估",
              },
            ],
          },
        ],
      };
      option && myChart.setOption(option);
    },
    initStatus() {
      var chartDom = document.getElementById("status");
      var myChart = echarts.init(chartDom);
      this.echartList.push(myChart);
      var option;

      option = {
        title: {
          text: "需求状态比例",
        },
        legend: {
          top: "bottom",
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            // dataView: { show: true, readOnly: false },
            // restore: { show: true },
            // saveAsImage: { show: true },
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
            data: [
              { value: 26, name: "处理中" },
              { value: 22, name: "待研发" },
              { value: 18, name: "已发布" },
            ],
          },
        ],
      };

      option && myChart.setOption(option);
    },
  },
  created() {
    nextTick(() => {
      this.initDemand();
      this.initStatus();
      this.initDemandDelay();
      this.initBugList();
      this.initGauge();
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
