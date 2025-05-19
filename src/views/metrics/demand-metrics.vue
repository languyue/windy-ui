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

    updateDemand() {
      metricApi.getDemandStatistics().then((res) => {
        const list = res.data || [];
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
        }));
        this.charts.demand.setOption(
          {
            title: { text: "需求 Top 统计" },
            tooltip: { trigger: "axis" },
            xAxis: { type: "value" },
            yAxis: { type: "category", data: types },
            series,
          },
          false
        );
      });
    },

    updateStatus() {
      metricApi.getDemandStatusStatistics().then((res) => {
        const data = (res.data || []).map((e) => ({
          name: e.statusName,
          value: e.percent,
        }));

        this.charts.status.setOption(
          {
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
                data,
              },
            ],
          },
          false
        );
      });
    },

    updateGauge() {
      metricApi.getSystemHealthy().then((res) => {
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
      });
    },

    updateDelay() {
      metricApi.getDemandDelayWorkload(this.queryTime).then((res) => {
        const { xAxis, series } = this.transformMetricData(res.data);
        this.charts.delay.setOption(
          {
            title: { text: "需求搁置时长 vs 完整周期" },
            tooltip: { trigger: "axis" },
            xAxis: { type: "category", data: xAxis },
            yAxis: { type: "value" },
            series,
          },
          false
        );
      });
    },

    updateBug() {
      metricApi.getBugStatusStatistics(this.queryTime).then((res) => {
        const { formattedData, typeList } = this.transformBugData(res.data);
        const opt = this.buildTrendOption(
          "缺陷变化趋势图",
          formattedData,
          typeList,
          "个数"
        );
        this.charts.bug.setOption(opt, false);
      });
    },

    updateGaugeAnalysis() {
      metricApi.getHealthyStatistics(this.queryTime).then((res) => {
        const { formattedData, typeList } = this.transformHealthyData(res.data);
        const opt = this.buildTrendOption(
          "系统健康度变化趋势图",
          formattedData,
          typeList,
          "健康度"
        );
        this.charts.gaugeAnalysis.setOption(opt, false);
      });
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
      }));
      return {
        animationDuration: 800,
        dataset: [{ id: "raw", source }, ...filters],
        title: { text: title },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", name: "时间" },
        yAxis: { name: yName },
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
