<template>
  <div class="app-container">
    <div class="filter-container"></div>

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
      <el-table-column label="赛局ID" prop="id" sortable="custom" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客队" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.awayteam | teamValue}}</span>
        </template>
      </el-table-column>
      <el-table-column label="主队" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.hometeam | teamValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="玩法" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type | roundTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投注截止时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_end_time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单笔投注金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手续费" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.fee_unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="奖池" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投注次数" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已投注份额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.shares }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.issuer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" @click="handlePublish(scope.row)">公布比分</el-button>
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

    <el-dialog title="比赛结果" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="round"
        label-position="left"
        label-width="170px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item :label="round.away | teamValue">
          <el-input type="number" max="300" min="0" v-model.number="round.awaypoint"></el-input>
        </el-form-item>
        <el-form-item :label="round.home | teamValue">
          <el-input type="number" max="300" min="0" v-model.number="round.homepoint"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="publishRound()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as moment from "moment";
import { publishRound, getRoundListByStatus } from "@/scatter/nba/round";
import waves from "@/directive/waves"; // Waves directive
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

const roundtypeOptions = [
  { key: 0, display_name: "分差盘" },
  { key: 1, display_name: "胜负盘" },
  { key: 2, display_name: "区间盘" }
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
  { key: 29, display_name: "猛龙" },
  { key: 30, display_name: "西部全明星" },
  { key: 31, display_name: "东部全明星" }
];

const betUnitOptions = [
  { key: "1.0000 EOS", display_name: "1.0000 EOS" },
  { key: "2.0000 EOS", display_name: "2.0000 EOS" }
];

export default {
  name: "waittingpubrounds",
  components: { Pagination },
  directives: { waves },
  filters: {
    roundTypeFilter(type) {
      return roundtypeOptions[type].display_name;
    },
    teamValue(team) {
      return teamOptions[team].display_name;
    },
    parseTime(time) {
      return moment
        .unix(time)
        .utc()
        .local()
        .format("YYYY.MM.DD HH:mm");
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
      roundtypeOptions,
      teamOptions,
      betUnitOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" }
      ],
      showReviewer: false,
      round: {
        id: 0,
        home: 0,
        homepoint: 0,
        away: 1,
        awaypoint: 0
      },
      dialogFormVisible: false,
      rules: {
        point: [
          {
            required: true,
            message: "请输入比分",
            tiggler: "blur"
          },
          {
            type: "number",
            message: "比分必须是数字",
            tiggler: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      getRoundListByStatus("waittingpub").then(response => {
        console.log(response);
        this.list = response;
        this.total = response.length;

        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
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
    resetTemp(round) {
      this.round = {
        id: round.id,
        home: round.hometeam,
        homepoint: 0,
        away: round.awayteam,
        awaypoint: 0
      };
    },
    handlePublish(round) {
      this.resetTemp(round);
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    publishRound() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          publishRound({
            id: this.round.id,
            homepoint: this.round.homepoint,
            awaypoint: this.round.awaypoint
          }).then(result => {
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "公布比赛结果成功",
              type: "success",
              duration: 2000
            });
            this.getList();
          });
        }
      });
    }
  }
};
</script>
