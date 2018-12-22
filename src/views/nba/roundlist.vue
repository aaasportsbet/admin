<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreateRound"
      >创建赛局</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="赛局ID" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主队" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.hometeam | teamValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客队" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.awayteam | teamValue}}</span>
        </template>
      </el-table-column>
      <el-table-column label="玩法" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.type | roundTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投注截止时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_end_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单笔投注金额" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="奖池" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投注次数" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已投注份额" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.shares_win }} / {{ scope.row.shares }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.issuer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >{{ $t('nba.stopbet') }}</el-button>
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >{{ $t('nba.publicResult') }}</el-button>
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >{{ $t('nba.lotteryResult') }}</el-button>
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >{{ $t('nba.cancelround') }}</el-button>
          <el-button
            v-if="scope.row.status!='published'"
            size="mini"
            type="success"
            @click="handleModifyStatus(scope.row,'published')"
          >{{ $t('table.publish') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="$t('nba.createround')" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="170px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item :label="$t('nba.betEndTime')" prop="bet_end_time">
          <el-date-picker
            v-model="temp.bet_end_time"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item :label="$t('nba.type')" prop="roundtype">
          <el-select v-model="temp.roundtype" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in roundtypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('nba.home')" prop="home">
          <el-select v-model="temp.home" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in teamOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('nba.away')" prop="away">
          <el-select v-model="temp.away" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in teamOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('nba.betunit')" prop="betunit">
          <el-input v-model="temp.betunit"/>
        </el-form-item>
        <el-form-item :label="$t('nba.betunit')" prop="betunit">
          <el-input v-model="temp.betunit"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="createRound()">{{ $t('nba.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle
} from "@/api/article";
import { fetchRoundList, createRound } from "@/api/nba";
import waves from "@/directive/waves"; // Waves directive
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

const calendarTypeOptions = [
  { key: "CN", display_name: "China" },
  { key: "US", display_name: "USA" },
  { key: "JP", display_name: "Japan" },
  { key: "EU", display_name: "Eurozone" }
];

const roundtypeOptions = [
  { key: 0, display_name: "分差" },
  { key: 1, display_name: "胜负" }
];

const teamOptions = [
  { key: 0, display_name: "马刺" },
  { key: 1, display_name: "灰熊" },
  { key: 2, display_name: "独行侠" },
  { key: 3, display_name: "火箭" },
  { key: 4, display_name: "鹈鹕" },
  { key: 5, display_name: "森林狼" },
  { key: 6, display_name: "掘金" },
  { key: 7, display_name: "爵士" },
  { key: 8, display_name: "开拓者" },
  { key: 9, display_name: "雷霆" },
  { key: 10, display_name: "国王" },
  { key: 11, display_name: "太阳" },
  { key: 12, display_name: "湖人" },
  { key: 13, display_name: "快船" },
  { key: 14, display_name: "勇士" },
  { key: 15, display_name: "热火" },
  { key: 16, display_name: "魔术" },
  { key: 17, display_name: "老鹰" },
  { key: 18, display_name: "奇才" },
  { key: 19, display_name: "黄蜂" },
  { key: 20, display_name: "活塞" },
  { key: 21, display_name: "步行者" },
  { key: 22, display_name: "骑士" },
  { key: 23, display_name: "公牛" },
  { key: 24, display_name: "雄鹿" },
  { key: 25, display_name: "凯尔特人" },
  { key: 26, display_name: "76人" },
  { key: 27, display_name: "尼克斯" },
  { key: 28, display_name: "篮网" },
  { key: 29, display_name: "猛龙" }
];

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "RoundList",
  components: { Pagination },
  directives: { waves },
  filters: {
    roundTypeFilter(type) {
      return roundtypeOptions[type].display_name;
    },
    teamValue(team) {
      return teamOptions[team].display_name;
    },
    statusTag(status) {
      const statusMap = {
        0: "success",
        1: "info",
        2: "danger",
        3: "info",
        4: "danger",
        5: "danger"
      };
      return statusMap[status];
    },
    statusValue(status) {
      const statusMap = {
        0: "投注中",
        1: "等待开奖",
        2: "公示中",
        3: "派奖中",
        4: "已流拍",
        5: "已完成"
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
    parseTime(time, cFormat) {
      const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
      let date;
      if (typeof time === "object") {
        date = time;
      } else {
        if (("" + time).length === 10) time = parseInt(time) * 1000;
        if (("" + time).length === 16) time = parseInt(time) / 1000;
        date = new Date(time);
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      };
      const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        // Note: getDay() returns 0 on Sunday
        if (key === "a") {
          return ["日", "一", "二", "三", "四", "五", "六"][value];
        }
        if (result.length > 0 && value < 10) {
          value = "0" + value;
        }
        return value || 0;
      });
      return time_str;
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: "+id"
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      roundtypeOptions,
      teamOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" }
      ],
      statusOptions: ["published", "draft", "deleted"],
      showReviewer: false,
      temp: {
        roundtype: 0,
        home: 0,
        away: 0,
        bet_end_time: new Date(),
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "ddd",
        status: "published"
      },
      dialogFormVisible: false,
      dialogPvVisible: false,
      pvData: [],
      rules: {
        roundtype: [
          {
            required: true,
            message: "roundtype is required",
            trigger: "change"
          }
        ],
        home: [
          { required: true, message: "home is required", trigger: "change" }
        ],
        away: [
          { required: true, message: "away is required", trigger: "change" }
        ],
        bet_end_time: [
          {
            type: "date",
            required: true,
            message: "bet_end_time is required",
            trigger: "change"
          }
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" }
        ]
      },
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchRoundList(this.listQuery).then(response => {
        console.log(response);
        this.list = response.rows;
        this.total = response.rows.length;

        this.listLoading = false;
      });
      // fetchRoundList({}).then(response => {
      //   console.log(response);
      // });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success"
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        status: "published",
        type: ""
      };
    },
    handleCreateRound() {
      this.resetTemp();
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createRound() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createRound({
            bet_end_time: 1541793000000000,
            roundtype: 0,
            home: 1,
            away: 4,
            unit: "1.0000 EOS"
          }).then(result => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete(row) {
      this.$notify({
        title: "成功",
        message: "删除成功",
        type: "success",
        duration: 2000
      });
      const index = this.list.indexOf(row);
      this.list.splice(index, 1);
    }
  }
};
</script>
