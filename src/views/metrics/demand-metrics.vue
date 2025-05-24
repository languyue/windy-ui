<template>
  <div class="view-content">
    <!-- 时间选择 -->
    <el-row class="controll-line">
      <el-col :span="12">
        <el-radio-group v-model="selectTime" size="mini" @input="onSelectTime">
          <el-radio-button :label="7">最近一星期</el-radio-button>
          <el-radio-button :label="30">1个月</el-radio-button>
          <el-radio-button :label="90">3个月</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>

    <div class="demand-view">
      <!-- 上半区：3 个图 -->
      <el-row class="data-view-line">
        <el-col :span="8"
          ><div ref="demandChart" style="height: 300px"></div
        ></el-col>
        <el-col :span="8"
          ><div ref="statusChart" style="height: 300px"></div
        ></el-col>
        <el-col :span="8"
          ><div ref="gaugeChart" style="height: 300px"></div
        ></el-col>
      </el-row>
      <!-- 下半区：1 大 + 2 分 -->
      <div class="view-second-line">
        <div ref="delayChart" style="height: 400px"></div>
      </div>
      <el-row class="view-second-line">
        <el-col :span="16"
          ><div ref="bugChart" style="height: 400px; width: 100%"></div
        ></el-col>
        <el-col :span="8">
          <div ref="gaugeAnalysisChart" style="height: 400px; width: 100%"></div
        ></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import metricApi from "@/http/MetricApi";

export default {
  data() {
    return {
      selectTime: 7,
      queryTime: 0,
      charts: {
        demand: null,
        status: null,
        gauge: null,
        delay: null,
        bug: null,
        gaugeAnalysis: null,
      },
      resizeHandler: null,
    };
  },
  methods: {
    onSelectTime(days) {
      const today0 = new Date();
      today0.setHours(0, 0, 0, 0);
      this.queryTime = today0.getTime() - days * 86400000;
      this.reloadCharts();
    },

    initCharts() {
      this.charts.demand = echarts.init(this.$refs.demandChart);
      this.charts.status = echarts.init(this.$refs.statusChart);
      this.charts.gauge = echarts.init(this.$refs.gaugeChart);
      this.charts.delay = echarts.init(this.$refs.delayChart);
      this.charts.bug = echarts.init(this.$refs.bugChart);
      this.charts.gaugeAnalysis = echarts.init(this.$refs.gaugeAnalysisChart);

      this.resizeHandler = () => {
        Object.values(this.charts).forEach((c) => c && c.resize());
      };
      window.addEventListener("resize", this.resizeHandler);
    },

    // 显示空状态（保留坐标轴）
    showEmptyStateWithAxis(
      chart,
      title,
      emptyText = "暂无数据",
      axisConfig = {}
    ) {
      const baseOption = {
        title: {
          text: title,
          textStyle: {
            color: "#333",
            fontSize: 16,
          },
        },
        graphic: [
          {
            type: "text",
            left: "center",
            top: "middle",
            style: {
              text: emptyText,
              fill: "#999",
              fontSize: 16,
              fontWeight: "normal",
            },
            z: 100,
          },
        ],
        series: [],
      };

      // 合并传入的坐标轴配置
      if (axisConfig.xAxis) {
        baseOption.xAxis = axisConfig.xAxis;
      }
      if (axisConfig.yAxis) {
        baseOption.yAxis = axisConfig.yAxis;
      }

      chart.setOption(baseOption, false);
    },

    updateDemand() {
      metricApi
        .getDemandStatistics()
        .then((res) => {
          const list = res.data || [];
          if (list.length === 0) {
            return this.showEmptyStateWithAxis(
              this.charts.demand,
              "需求 Top 统计",
              "暂无需求数据"
            );
          }

          const types = [...new Set(list.map((i) => i.demandType))];
          const map = {};
          list.forEach(({ dataType, demandType, dataValue }) => {
            map[dataType] = map[dataType] || {};
            map[dataType][demandType] = dataValue;
          });
          const series = Object.entries(map).map(([name, m]) => ({
            name,
            type: "bar",
            data: types.map((t) => m[t] || 0),
            barMaxWidth: 40,
          }));

          this.charts.demand.setOption(
            {
              title: {
                text: "需求 Top 统计",
                left: "center",
              },
              tooltip: {
                trigger: "axis",
                axisPointer: {
                  type: "shadow",
                },
              },
              xAxis: {
                type: "value",
                name: "数量",
                nameLocation: "middle",
                nameGap: 25,
              },
              yAxis: {
                type: "category",
                data: types,
                axisLabel: {
                  interval: 0,
                  rotate: types.length > 5 ? 30 : 0,
                },
              },
              series,
              grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
              },
            },
            false
          );
        })
        .catch(() => {
          this.showEmptyStateWithAxis(
            this.charts.demand,
            "需求 Top 统计",
            "数据加载失败"
          );
        });
    },

    updateStatus() {
      metricApi
        .getDemandStatusStatistics()
        .then((res) => {
          const data = (res.data || []).map((e) => ({
            name: e.statusName,
            value: e.percent,
          }));

          if (data.length === 0) {
            return this.showEmptyStateWithAxis(
              this.charts.status,
              "需求状态比例",
              "暂无状态数据"
            );
          }

          this.charts.status.setOption(
            {
              title: {
                text: "需求状态比例",
                left: "center",
              },
              legend: {
                top: "bottom",
                type: "scroll",
              },
              toolbox: {
                show: true,
                feature: {
                  saveAsImage: { show: true },
                },
              },
              series: [
                {
                  name: "需求状态",
                  type: "pie",
                  radius: [0, 100],
                  center: ["50%", "50%"],
                  roseType: "area",
                  itemStyle: {
                    borderRadius: 8,
                  },
                  label: {
                    formatter: "{b}: {d}%",
                  },
                  data,
                },
              ],
            },
            false
          );
        })
        .catch(() => {
          this.showEmptyStateWithAxis(
            this.charts.status,
            "需求状态比例",
            "数据加载失败"
          );
        });
    },

    updateGauge() {
      metricApi
        .getSystemHealthy()
        .then((res) => {
          if (!res.data || res.data.healthyValue === undefined) {
            return this.showEmptyStateWithAxis(
              this.charts.gauge,
              "",
              "暂无健康度数据"
            );
          }

          this.charts.gauge.setOption(
            {
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
                    { value: res.data.healthyValue / 100, name: "健康评估" },
                  ],
                },
              ],
            },
            false
          );
        })
        .catch(() => {
          this.showEmptyStateWithAxis(
            this.charts.gauge,
            "健康评估",
            "数据加载失败"
          );
        });
    },

    updateDelay() {
      metricApi
        .getDemandDelayWorkload(this.queryTime)
        .then((res) => {
          if (!res.data || res.data.length === 0) {
            return this.showEmptyStateWithAxis(
              this.charts.delay,
              "需求搁置时长 vs 完整周期",
              `当前时间段${this.getTimeRangeText()}无数据`
            );
          }

          const { xAxis, series } = this.transformMetricData(res.data);
          this.charts.delay.setOption(
            {
              title: {
                text: "需求搁置时长 vs 完整周期",
                left: "center",
              },
              legend: {
                top: "bottom",
                type: "scroll",
              },
              tooltip: {
                trigger: "axis",
                formatter: function (params) {
                  let result = params[0].axisValue + "<br/>";
                  params.forEach((param) => {
                    result += `${param.seriesName}: ${param.value}<br/>`;
                  });
                  return result;
                },
              },
              xAxis: {
                type: "category",
                data: xAxis,
                axisLabel: {
                  rotate: xAxis.length > 7 ? 45 : 0,
                },
                name: "日期",
                nameLocation: "middle",
                nameGap: 25,
              },
              yAxis: {
                type: "value",
                name: "时长(天)",
              },
              series,
              grid: {
                left: "3%",
                right: "4%",
                bottom: "15%",
                containLabel: true,
              },
            },
            false
          );
        })
        .catch(() => {
          this.showEmptyStateWithAxis(
            this.charts.delay,
            "需求搁置时长 vs 完整周期",
            "数据加载失败"
          );
        });
    },

    updateBug() {
      metricApi
        .getBugStatusStatistics(this.queryTime)
        .then((res) => {
          if (!res.data || res.data.length === 0) {
            return this.showEmptyStateWithAxis(
              this.charts.bug,
              "缺陷变化趋势图",
              `当前时间段${this.getTimeRangeText()}无数据`
            );
          }

          const { formattedData, typeList } = this.transformBugData(res.data);
          const opt = this.buildTrendOption(
            "缺陷变化趋势图",
            formattedData,
            typeList,
            "个数"
          );
          this.charts.bug.setOption(opt, false);
        })
        .catch(() => {
          this.showEmptyStateWithAxis(
            this.charts.bug,
            "缺陷变化趋势图",
            "数据加载失败"
          );
        });
    },

    updateGaugeAnalysis() {
      metricApi
        .getHealthyStatistics(this.queryTime)
        .then((res) => {
          if (!res.data || res.data.length === 0) {
            return this.showEmptyStateWithAxis(
              this.charts.gaugeAnalysis,
              "系统健康度变化趋势图",
              `当前时间段${this.getTimeRangeText()}无数据`
            );
          }

          const { formattedData, typeList } = this.transformHealthyData(
            res.data
          );
          const opt = this.buildTrendOption(
            "系统健康度变化趋势图",
            formattedData,
            typeList,
            "健康度"
          );
          this.charts.gaugeAnalysis.setOption(opt, false);
        })
        .catch(() => {
          this.showEmptyStateWithAxis(
            this.charts.gaugeAnalysis,
            "系统健康度变化趋势图",
            "数据加载失败"
          );
        });
    },

    // 获取时间范围文本
    getTimeRangeText() {
      const days = this.selectTime;
      if (days === 7) return "（最近一周）";
      if (days === 30) return "（最近一个月）";
      if (days === 90) return "（最近三个月）";
      return `（最近${days}天）`;
    },

    // ——— 数据转换方法 ———
    transformMetricData(rawData = []) {
      const formatDate = (ts) => {
        const d = new Date(ts);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const grouped = {};
      const metricTypes = new Set();

      rawData.forEach((item) => {
        const day = formatDate(item.time);
        if (!grouped[day]) grouped[day] = {};
        grouped[day][item.metricName] =
          (grouped[day][item.metricName] || 0) + item.value;
        metricTypes.add(item.metricName);
      });

      const sortedDates = Object.keys(grouped).sort();
      const series = Array.from(metricTypes).map((metric) => ({
        name: metric,
        type: "bar",
        data: sortedDates.map((date) => grouped[date][metric] || 0),
        barMaxWidth: 40,
      }));

      return { xAxis: sortedDates, series };
    },

    transformBugData(rawData = []) {
      const seen = new Set();
      const result = [["个数", "类型", "时间"]];
      const typeSet = new Set();

      rawData.forEach((item) => {
        const d = new Date(item.time);
        const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        const key = `${day}-${item.statusName}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push([item.value, item.statusName, day]);
          typeSet.add(item.statusName);
        }
      });

      const header = result.shift();
      result.sort((a, b) => new Date(a[2]) - new Date(b[2]));
      result.unshift(header);

      return {
        formattedData: result,
        typeList: Array.from(typeSet),
      };
    },

    transformHealthyData(rawData = []) {
      const seen = new Set();
      const result = [["健康度", "类型", "时间"]];
      const typeSet = new Set();

      rawData.forEach((item) => {
        const d = new Date(item.time);
        const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        const key = `${day}-${item.typeName}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push([item.value, item.typeName, day]);
          typeSet.add(item.typeName);
        }
      });

      const header = result.shift();
      result.sort((a, b) => new Date(a[2]) - new Date(b[2]));
      result.unshift(header);

      return {
        formattedData: result,
        typeList: Array.from(typeSet),
      };
    },

    buildTrendOption(title, source, typeList, yName) {
      const filters = typeList.map((t) => ({
        id: `ds_${t}`,
        fromDatasetId: "raw",
        transform: {
          type: "filter",
          config: { and: [{ dimension: "类型", "=": t }] },
        },
      }));
      const series = typeList.map((t) => ({
        type: "line",
        name: t,
        datasetId: `ds_${t}`,
        showSymbol: false,
        encode: { x: "时间", y: yName },
        lineStyle: {
          width: 3,
        },
        emphasis: {
          focus: "series",
        },
      }));
      return {
        animationDuration: 800,
        dataset: [{ id: "raw", source }, ...filters],
        title: {
          text: title,
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        legend: {
          type: "scroll",
          bottom: 10,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          name: "时间",
          axisLabel: {
            rotate: source.length > 10 ? 45 : 0,
          },
        },
        yAxis: {
          type: "value",
          name: yName,
          axisLabel: {
            formatter: function (value) {
              return Number.isInteger(value) ? value : value.toFixed(1);
            },
          },
        },
        series,
      };
    },

    reloadCharts() {
      this.updateDemand();
      this.updateStatus();
      this.updateGauge();
      this.updateDelay();
      this.updateBug();
      this.updateGaugeAnalysis();
    },
  },

  mounted() {
    this.initCharts();
    this.$nextTick(this.reloadCharts);
  },

  beforeDestroy() {
    Object.values(this.charts).forEach((c) => c && c.dispose());
    window.removeEventListener("resize", this.resizeHandler);
  },
};
</script>

<style scoped lang="less">
.view-content {
  position: relative;
  padding-top: 10px;
  min-height: 300px;

  .shadow-area {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

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
