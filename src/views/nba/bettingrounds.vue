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
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="success"
        icon="el-icon-refresh"
        @click="getList()"
      >刷新</el-button>
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
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog title="创建赛局" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="round"
        label-position="left"
        label-width="170px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="投注截止时间" prop="bet_end_time">
          <el-date-picker
            v-model="round.bet_end_time"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item label="玩法" prop="roundtype">
          <el-select v-model="round.roundtype" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in roundtypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客队" prop="away">
          <el-select v-model="round.away" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in teamOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主队" prop="home">
          <el-select v-model="round.home" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in teamOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单位投注金额" prop="bet_unit">
          <el-select v-model="round.bet_unit" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in betUnitOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createRound()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as moment from "moment";
import { createRound, getRoundListByStatus } from "@/scatter/nba/round";
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
  name: "bettingrounds",
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
        roundtype: 0,
        home: 0,
        away: 1,
        bet_end_time: new Date(),
        bet_unit: "1.0000 EOS"
      },
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
        bet_unit: [
          { required: true, message: "bet_unit is required", trigger: "change" }
        ]
      },
      dialogFormVisible: false,
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      getRoundListByStatus("betting").then(response => {
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
    resetTemp() {
      this.round = {
        roundtype: 0,
        home: 0,
        away: 1,
        bet_end_time: new Date(),
        bet_unit: "1.0000 EOS"
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
          createRound({
            bet_end_time: moment(this.round.bet_end_time).unix(),
            roundtype: this.round.roundtype,
            home: this.round.home,
            away: this.round.away,
            unit: this.round.bet_unit
          }).then(result => {
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
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
