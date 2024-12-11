<template>
  <div>
    <div>
      <el-row :gutter="10">
        <el-col :span="5">
          <div class="api-list">
            <!-- 服务列表开始 -->
            <el-form inline size="mini">
              <el-form-item label="服务列表">
                <el-select
                  v-model="serviceId"
                  size="mini"
                  @change="selectService"
                  placeholder="选择服务"
                >
                  <el-option
                    v-for="(item, index) in serviceList"
                    :key="index"
                    :label="item.serviceName"
                    :value="item.serviceId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <!-- 服务列表结束 -->

            <!-- api操作开始 -->
            <div class="filter-text">
              <div class="filter-op">
                <el-row :gutter="10">
                  <el-col :span="16">
                    <el-button
                      type="primary"
                      size="mini"
                      icon="el-icon-tickets"
                      @click="queryHistory"
                      >二方包构建记录</el-button
                    >
                  </el-col>
                  <el-col :span="5">
                    <el-dropdown @command="selectCommand" szie="mini">
                      <el-button type="primary" size="mini">
                        操作<i class="el-icon-arrow-down el-icon--right"></i>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="api"
                          >新增接口</el-dropdown-item
                        >
                        <el-dropdown-item command="dir"
                          >新增目录</el-dropdown-item
                        >
                        <el-dropdown-item command="delete"
                          >删除</el-dropdown-item
                        >
                        <el-dropdown-item command="generate" v-clickOnce
                          >生成二方包</el-dropdown-item
                        >
                        <el-dropdown-item command="import"
                          >API导入</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </el-dropdown>
                  </el-col>
                </el-row>
              </div>
              <el-input
                v-model="filterText"
                size="mini"
                clearable
                placeholder="输入api名称过滤"
              ></el-input>
            </div>
            <!-- api操作结束 -->

            <!-- api列表开始 -->
            <el-tree
              :data="apiTreeData"
              show-checkbox
              draggable
              node-key="apiId"
              :filter-node-method="filterNode"
              :props="apiProps"
              @node-drop="handleApiDragEnd"
              @check-change="selectTreeNode"
              @node-click="treeNodeSelect"
              :allow-drop="allowApiDrop"
              :default-expanded-keys="expendKeys"
              ref="apiTree"
            >
              <div class="tree-node" slot-scope="{ node, data }">
                <i
                  v-if="data.apiType == 0"
                  class="el-icon-folder-opened folder-icon"
                />
                <span class="api-name">{{ node.label }}</span>
                <div class="tree-op-list">
                  <el-dropdown @command="selectItemCommand($event, data)">
                    <span> ... </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="api" v-if="data.apiType == 0"
                        >新增接口</el-dropdown-item
                      >
                      <el-dropdown-item command="dir" v-if="data.apiType == 0"
                        >新增目录</el-dropdown-item
                      >
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
            </el-tree>
            <!-- api列表结束 -->
          </div>
        </el-col>
        <el-col :span="19">
          <el-empty
            v-if="!apiForm.apiId"
            description="请在左侧选择接口"
          ></el-empty>
          <div v-else class="api-detail">
            <el-tabs
              v-model="activeName"
              @tab-click="selectTab"
              :before-leave="beforeLeave"
            >
              <!-- 接口预览开始 -->
              <el-tab-pane label="接口预览" name="preview">
                <h4 class="title-bar">接口属性</h4>
                <el-descriptions :column="2">
                  <el-descriptions-item label="接口名称">{{
                    apiForm.apiName
                  }}</el-descriptions-item>
                  <el-descriptions-item label="接口类型">{{
                    apiForm.type
                  }}</el-descriptions-item>
                  <el-descriptions-item label="接口定义"
                    ><el-tag type="success" size="small">{{
                      apiForm.method
                    }}</el-tag>
                    <span class="uri-text">{{ apiForm.resource }}</span>
                    <i
                      title="复制"
                      class="el-icon-document-copy copy-icon"
                      @click="copyToClipboard(apiForm.resource)"
                    />
                  </el-descriptions-item>
                  <el-descriptions-item label="修改时间">{{
                    apiForm.updateTime | dateFormat
                  }}</el-descriptions-item>
                  <el-descriptions-item label="接口说明">
                    {{ apiForm.description }}
                  </el-descriptions-item>
                </el-descriptions>
                <h4 class="title-bar">请求参数</h4>
                <div class="display-param" v-if="pathData.length > 0">
                  <h5>Path路径参数</h5>
                  <el-table :data="pathData" border size="mini">
                    <el-table-column
                      prop="paramKey"
                      label="参数名称"
                      width="150px"
                    >
                    </el-table-column>
                    <el-table-column prop="type" label="参数类型" width="150px">
                    </el-table-column>
                    <el-table-column
                      prop="position"
                      label="参数位置"
                      width="150px"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="required"
                      label="是否必填"
                      width="150px"
                    >
                      <template slot-scope="scope">
                        <el-switch
                          disabled
                          v-model="scope.row.required"
                          active-color="#13ce66"
                          inactive-color="#909399"
                        >
                        </el-switch>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="参数描述">
                    </el-table-column>
                  </el-table>
                </div>

                <div class="display-param" v-if="headerData.length > 0">
                  <h5>Header</h5>
                  <el-table :data="headerData" border size="mini"
                    ><el-table-column
                      prop="paramKey"
                      label="参数名称"
                      width="200px"
                    >
                    </el-table-column>
                    <el-table-column prop="type" label="参数类型" width="150px">
                    </el-table-column>
                    <el-table-column
                      prop="required"
                      label="是否必填"
                      width="150px"
                    >
                      <template slot-scope="scope">
                        <el-switch
                          disabled
                          v-model="scope.row.required"
                          active-color="#13ce66"
                          inactive-color="#909399"
                        >
                        </el-switch>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="参数描述">
                    </el-table-column
                  ></el-table>
                </div>

                <div class="display-param" v-if="bodyData.length > 0">
                  <h5>请求body</h5>
                  <el-table
                    :data="bodyData"
                    size="mini"
                    border
                    row-key="id"
                    default-expand-all
                    :tree-props="{
                      children: 'children',
                    }"
                    ><el-table-column
                      prop="paramKey"
                      label="参数名称"
                      width="200px"
                    >
                    </el-table-column>
                    <el-table-column prop="type" label="参数类型" width="150px">
                    </el-table-column>
                    <el-table-column
                      prop="required"
                      label="是否必填"
                      width="150px"
                    >
                      <template slot-scope="scope">
                        <el-switch
                          disabled
                          v-model="scope.row.required"
                          active-color="#13ce66"
                          inactive-color="#909399"
                        >
                        </el-switch>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="参数描述">
                    </el-table-column
                  ></el-table>
                </div>

                <h4 class="title-bar">响应参数</h4>
                <div class="display-param">
                  <el-table
                    :data="previewRes"
                    border
                    row-key="id"
                    size="mini"
                    :tree-props="{
                      children: 'children',
                    }"
                    ><el-table-column prop="paramKey" label="参数名称">
                    </el-table-column>
                    <el-table-column prop="type" label="参数类型">
                    </el-table-column>
                    <el-table-column
                      prop="required"
                      label="是否必填"
                      width="150px"
                    >
                      <template slot-scope="scope">
                        <el-switch
                          disabled
                          v-model="scope.row.required"
                          active-color="#13ce66"
                          inactive-color="#909399"
                        >
                        </el-switch>
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="参数描述">
                    </el-table-column
                  ></el-table>
                </div>
              </el-tab-pane>
              <!-- 接口预览结束 -->

              <!-- 接口配置开始 -->
              <el-tab-pane label="接口配置" name="edit">
                <el-form v-model="apiForm" size="mini" label-width="80px">
                  <h4 class="title-bar">接口属性</h4>
                  <el-form-item label="接口名称">
                    <el-input
                      v-model="apiForm.apiName"
                      placeholder="请输入接口名称"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="接口类型">
                    <el-select
                      v-model="apiForm.type"
                      placeholder="请选择"
                      @change="apiForm.method = ''"
                    >
                      <el-option label="HTTP" value="http"> </el-option>
                      <el-option label="DUBBO" value="dubbo"> </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="接口定义">
                    <el-row :gutter="10">
                      <el-col v-if="apiForm.type == 'http'" :span="4"
                        ><el-select
                          v-model="apiForm.method"
                          placeholder="请选择HTTP请求方法"
                        >
                          <el-option label="GET" value="GET"></el-option>
                          <el-option label="POST" value="POST"></el-option>
                          <el-option label="PUT" value="PUT"></el-option>
                          <el-option
                            label="DELETE"
                            value="DELETE"
                          ></el-option> </el-select
                      ></el-col>
                      <el-col :span="18">
                        <el-input
                          :placeholder="
                            apiForm.type == 'http'
                              ? '请输入uri'
                              : '请输入dubbo的类名'
                          "
                          v-model="apiForm.resource"
                          class="input-with-select"
                        >
                        </el-input>
                      </el-col>
                      <el-col :span="5" v-if="apiForm.type == 'dubbo'">
                        <el-input
                          v-model="apiForm.method"
                          placeholder="请输入方法名"
                        ></el-input>
                      </el-col>
                    </el-row>
                  </el-form-item>
                  <el-form-item label="接口说明">
                    <el-input
                      v-model="apiForm.description"
                      type="textarea"
                      placeholder="请输入接口描述"
                    ></el-input>
                  </el-form-item>
                  <h4 class="title-bar">参数设置</h4>
                  <el-button type="primary" size="mini" @click="addParam"
                    >新增请求参数</el-button
                  >
                  <el-tree
                    class="tree-item"
                    :data="paramData"
                    :props="defaultProps"
                    node-key="id"
                    default-expand-all
                    :expand-on-click-node="false"
                  >
                    <div class="custom-node" slot-scope="{ node, data }">
                      <el-row :gutter="10">
                        <el-col :span="4">
                          <el-input
                            size="mini"
                            :disabled="data.hide"
                            v-model="data.paramKey"
                            placeholder="请输入参数名称"
                          ></el-input>
                        </el-col>
                        <el-col :span="3">
                          <el-select
                            v-model="data.position"
                            style="with: 100%"
                            size="mini"
                            :disabled="data.freezed"
                            placeholder="请选择参数位置"
                          >
                            <el-option label="Path" value="Path"> </el-option>
                            <el-option label="Query" value="Query"> </el-option>
                            <el-option label="Header" value="Header">
                            </el-option>
                            <el-option label="Body" value="Body"> </el-option>
                          </el-select>
                        </el-col>
                        <el-col :span="3">
                          <el-select
                            class="select-type"
                            v-model="data.type"
                            placeholder="请选择参数类型"
                            @change="paramTypeChange($event, data)"
                            size="mini"
                          >
                            <el-option
                              label="String"
                              value="String"
                            ></el-option>
                            <el-option label="Long" value="Long"> </el-option>
                            <el-option
                              label="Array"
                              value="Array"
                              v-if="data.position == 'Body'"
                            >
                            </el-option>
                            <el-option
                              label="Object"
                              value="Object"
                              v-if="data.position == 'Body'"
                            >
                            </el-option>
                            <el-option label="Boolean" value="Boolean">
                            </el-option>
                            <el-option label="Integer" value="Integer">
                            </el-option>
                            <el-option label="Float" value="Float"> </el-option>
                            <el-option label="Object" value="Object">
                            </el-option>
                            <el-option label="Array" value="Array"> </el-option>
                          </el-select>
                        </el-col>

                        <el-col :span="3" v-if="!data.hide">
                          <el-select
                            size="mini"
                            v-model="data.required"
                            :disabled="data.hide"
                            placeholder="选择参数是否必填"
                          >
                            <el-option label="必填" :value="true"></el-option>
                            <el-option
                              label="非必填"
                              :value="false"
                            ></el-option>
                          </el-select>
                        </el-col>
                        <el-col
                          :span="3"
                          v-if="!data.hide && data.type != 'Object'"
                        >
                          <el-input
                            size="mini"
                            :disabled="data.hide"
                            v-model="data.defaultValue"
                            placeholder="请输入参数默认值"
                          />
                        </el-col>
                        <el-col :span="4" v-if="!data.hide">
                          <el-input
                            size="mini"
                            :disabled="data.hide"
                            v-model="data.description"
                            placeholder="请输入参数描述"
                          ></el-input>
                        </el-col>
                        <el-col :span="2">
                          <div class="op-icon">
                            <i
                              v-if="!data.hide"
                              class="el-icon-remove-outline"
                              @click="removeParam(node, data)"
                            />
                            <i
                              class="el-icon-circle-plus-outline"
                              @click="addSubParam(data)"
                              v-if="data.type == 'Object'"
                            />
                          </div>
                        </el-col>
                        <el-col :span="4" v-if="data.type == 'Object'">
                          <el-input
                            size="mini"
                            v-model="data.objectName"
                            placeholder="输入对象类名,代码生成使用"
                          />
                        </el-col>
                      </el-row>
                    </div>
                  </el-tree>
                  <h4 class="title-bar">响应设置</h4>
                  <el-button type="primary" size="mini" @click="addResParam"
                    >新增响应参数</el-button
                  >
                  <el-tree
                    class="tree-item"
                    :data="responseData"
                    :props="defaultProps"
                    node-key="id"
                    default-expand-all
                    :expand-on-click-node="false"
                  >
                    <div class="custom-node" slot-scope="{ node, data }">
                      <el-row :gutter="10">
                        <el-col :span="4">
                          <el-input
                            size="mini"
                            v-model="data.paramKey"
                            placeholder="请输入参数名称"
                          ></el-input>
                        </el-col>
                        <el-col :span="3">
                          <el-select
                            class="select-type"
                            v-model="data.type"
                            placeholder="请选择参数类型"
                            size="mini"
                          >
                            <el-option
                              label="String"
                              value="String"
                            ></el-option>
                            <el-option label="Long" value="Long"> </el-option>
                            <el-option label="Array" value="Array"> </el-option>
                            <el-option label="Object" value="Object">
                            </el-option>
                            <el-option label="Boolean" value="Boolean">
                            </el-option>
                            <el-option label="Integer" value="Integer">
                            </el-option>
                          </el-select>
                        </el-col>
                        <el-col :span="3">
                          <el-select
                            size="mini"
                            v-model="data.required"
                            placeholder="选择参数是否必填"
                          >
                            <el-option label="必填" :value="true"></el-option>
                            <el-option
                              label="非必填"
                              :value="false"
                            ></el-option>
                          </el-select>
                        </el-col>
                        <el-col :span="4">
                          <el-input
                            size="mini"
                            v-model="data.description"
                            placeholder="请输入参数描述"
                          ></el-input>
                        </el-col>
                        <el-col :span="2">
                          <div class="op-icon" @click="addSubParam(data)">
                            <i
                              class="el-icon-remove-outline"
                              @click="removeParam(node, data)"
                            />
                            <i
                              class="el-icon-circle-plus-outline"
                              @click="addSubParam(data)"
                              v-if="data.type == 'Object'"
                            />
                          </div>
                        </el-col>
                        <el-col :span="4" v-if="data.type == 'Object'">
                          <el-input
                            size="mini"
                            v-model="data.objectName"
                            placeholder="请输入对象类名,代码生成使用"
                          />
                        </el-col>
                      </el-row>
                    </div>
                  </el-tree>

                  <h4 class="title-bar">二方包代码生成配置</h4>
                  <el-form-item label="文件类名" label-width="120px">
                    <div>
                      <el-input
                        placeholder="请输入类名"
                        v-model="apiForm.className"
                      >
                        <el-input
                          slot="append"
                          placeholder="请输入接口方法名称"
                          v-model="apiForm.classMethod"
                        ></el-input>
                      </el-input>
                    </div>
                  </el-form-item>
                  <el-form-item
                    label="body请求体类名"
                    label-width="120px"
                    v-if="isHaveBody"
                  >
                    <el-input
                      placeholder="请输入body请求体类名"
                      v-model="apiForm.bodyClass"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="响应体类名" label-width="120px">
                    <el-input
                      placeholder="请输入接口响应类名"
                      v-model="apiForm.resultClass"
                    ></el-input>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <!-- 接口配置结束 -->
            </el-tabs>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="save-btn" v-if="activeName == 'edit'">
      <el-button
        type="primary"
        icon="el-icon-upload"
        size="small"
        @click="saveApi"
        >保存配置</el-button
      >
    </div>
    <el-dialog
      title="创建目录"
      :visible.sync="showCreateApi"
      width="50%"
      :before-close="cancelCreate"
    >
      <el-form
        :model="dataForm"
        label-width="80px"
        size="mini"
        :rules="apiRule"
        ref="dataForm"
      >
        <el-form-item label="名称" prop="apiName">
          <el-input v-model="dataForm.apiName"></el-input>
        </el-form-item>
        <el-form-item label="接口类型" prop="type" v-if="!createDir">
          <el-select v-model="dataForm.type" placeholder="请选择">
            <el-option label="Rest Http" value="http"> </el-option>
            <el-option label="Dubbo" value="dubbo"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接口定义" prop="resource" v-if="!createDir">
          <el-row :gutter="10">
            <el-col v-if="dataForm.type == 'http'" :span="4"
              ><el-select v-model="dataForm.method" placeholder="选择请求方法">
                <el-option label="GET" value="GET"></el-option>
                <el-option label="POST" value="POST"></el-option>
                <el-option label="PUT" value="PUT"></el-option>
                <el-option
                  label="DELETE"
                  value="DELETE"
                ></el-option> </el-select
            ></el-col>
            <el-col :span="18">
              <el-input
                :placeholder="
                  dataForm.type == 'http' ? '请输入uri' : '请输入dubbo的类名'
                "
                v-model="dataForm.resource"
                class="input-with-select"
              >
              </el-input>
            </el-col>
            <el-col :span="5" v-if="dataForm.type == 'dubbo'">
              <el-input
                v-model="dataForm.method"
                placeholder="请输入方法名"
              ></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelCreate" size="mini">取 消</el-button>
        <el-button type="primary" @click="submitApi('dataForm')" size="mini"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="构建Maven二方包"
      :visible.sync="showGenerateApi"
      @open="getBuildParam"
      width="60%"
    >
      <el-form
        :model="generateForm"
        label-width="80px"
        size="mini"
        :rules="generateRule"
        ref="generateForm"
      >
        <el-form-item label="包路径" prop="packageName">
          <el-input
            v-model="generateForm.packageName"
            placeholder="请输入二方包路径，例如:com.zj.windy"
          ></el-input>
        </el-form-item>
        <el-form-item label="GroupId" prop="groupId">
          <el-input
            v-model="generateForm.groupId"
            placeholder="请输入GroupId"
          ></el-input>
        </el-form-item>
        <el-form-item label="ArtifactId" prop="artifactId">
          <el-input
            v-model="generateForm.artifactId"
            placeholder="请输入ArtifactId"
          ></el-input>
        </el-form-item>
        <el-form-item label="Version" prop="version">
          <el-input
            v-model="generateForm.version"
            placeholder="请输入二方包版本号"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelGenerate" size="mini">取 消</el-button>
        <el-button
          type="primary"
          @click="submitGenerate('generateForm')"
          size="mini"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 构建二方包日志开始 -->
    <el-dialog
      title="二方包构建记录"
      :visible.sync="isShowLog"
      width="70%"
      :before-close="closeLog"
      @open="openLog"
    >
      <el-form v-model="logForm" size="mini">
        <el-form-item label="版本">
          <el-select
            v-model="logRecordId"
            placeholder="请选择历史构建版本"
            @change="selectVersion"
          >
            <el-option
              v-for="item in logVersions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="节点状态"
          ><el-tag :type="logForm.status | statusFormat">{{
            logForm.status | statusName
          }}</el-tag></el-form-item
        >
        <el-form-item label="执行时间">{{
          logForm.time | dateFormat
        }}</el-form-item>
      </el-form>
      <el-divider><i class="el-icon-receiving"></i></el-divider>
      <h4>运行日志</h4>
      <div class="log-list">
        <ul>
          <li v-for="(item, index) in logForm.messageList" :key="index">
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </el-dialog>
    <!-- 构建二方包结束 -->
    <el-dialog title="三方API导入" :visible.sync="showImportDialog">
      <el-form v-model="importForm" size="mini" :rules="importRule">
        <el-form-item label="服务名称">
          {{ importForm.serviceName }}
        </el-form-item>
        <el-form-item label="导入类型" prop="type">
          <el-select v-model="importForm.type" placeholder="请选择">
            <el-option label="Yapi-JSON文件" value="Yapi"> </el-option>
            <el-option label="Postman文件" value="Postman"> </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="文件上传">
          <el-upload
            drag
            action="#"
            :auto-upload="true"
            :http-request="httpRequest"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              目前只支持Yapi导出的json文件、Postman文件导入
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import serviceApi from '../../http/Service'
export default {
  data() {
    return {
      logInterval: null,
      logRecordId: '',
      logVersions: [],
      isShowLog: false,
      logForm: {},
      generateForm: {},
      showGenerateApi: false,
      activeName: 'preview',
      filterText: '',
      apiForm: {},
      paramData: [],
      responseData: [],
      apiTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'paramKey',
      },
      apiProps: {
        children: 'children',
        label: 'apiName',
      },
      pathData: [],
      headerData: [],
      bodyData: [],
      previewRes: [],
      uuid: 1,
      serviceList: [],
      serviceId: '',
      currentApi: '',
      showCreateApi: false,
      dataForm: { type: 'http' },
      apiRule: {
        apiName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择接口类型', trigger: 'blur' }],
        resource: [
          { required: true, message: '请输入api', trigger: 'blur' },
          {
            validator: this.validApi,
            message: '请填写方法',
            trigger: 'blur',
          },
        ],
      },
      generateRule: {
        packageName: [
          { required: true, message: '请输入包路径', trigger: 'blur' },
        ],
        groupId: [
          { required: true, message: '请输入groupId', trigger: 'blur' },
        ],
        artifactId: [
          { required: true, message: '请输入artifactId', trigger: 'blur' },
        ],
        version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
      },
      createDir: false,
      selectNodes: [],
      isLeaving: false,
      updateApi: false,
      showImportDialog: false,
      importForm: {},
      importRule: {
        type: [
          { required: true, message: '请选择导入文件类型', trigger: 'blur' },
        ],
      },
      loading: null,
      expendKeys: [],
    }
  },
  watch: {
    filterText(val) {
      this.$refs.apiTree.filter(val)
    },
    apiForm: {
      handler(val, old) {
        if (old && old.apiName) {
          this.updateApi = true
        }
      },
      deep: true,
      immediate: true,
    },
    paramData: {
      handler(val, old) {
        if (old && old.length > 0) {
          this.updateApi = true
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    copyToClipboard(text) {
      // 创建一个临时的 textarea 元素
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      // 选中文本并执行复制命令
      textarea.select()
      document.execCommand('copy')
      // 清理临时元素
      document.body.removeChild(textarea)
      // 提示复制成功
      this.$notify.success('复制成功')
    },
    httpRequest(param) {
      const formData = new FormData()
      formData.append(`file`, param.file)
      formData.append(`type`, this.importForm.type)
      formData.append(`serviceId`, this.serviceId)
      this.showLoading()
      serviceApi.importApi(formData).then((res) => {
        this.closeLoading()
        if (res.data.apiList) {
          this.$notify.success('导入api成功')
          this.showImportDialog = false
          this.selectService()
        } else {
          this.$notify.error('导入api失败')
          this.showImportDialog = false
        }
      })
    },
    showLoading() {
      this.loading = this.$loading({
        lock: true,
        text: '文件导入中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    },
    closeLoading() {
      this.loading.close()
    },
    allowApiDrop(draggingNode, targetNode, type) {
      let resource = targetNode.data
      if (type == 'inner' && resource.apiType != 0) {
        return false
      }
      return true
    },
    handleApiDragEnd(draggingNode, targetNode) {
      let resource = JSON.parse(JSON.stringify(draggingNode.data))
      resource.parentId = targetNode.data.apiId
      if (targetNode.data.apiType != 0) {
        resource.parentId = null
      }
      serviceApi.updateApi(resource)
    },
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName == 'edit' && !this.isLeaving && this.updateApi) {
        this.$confirm(
          '当前页面存在数据变更，离开后数据可能丢失，确认离开?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
          .then(() => {
            this.isLeaving = true
            this.activeName = activeName
            this.selectTab()
            this.updateApi = false
          })
          .catch(() => {})
        return false
      }
      return true
    },
    selectTreeNode(data, checked) {
      if (checked) {
        this.selectNodes.push(data.apiId)
      } else {
        let index = this.selectNodes.indexOf(data.apiId)
        if (index != -1) {
          this.selectNodes.splice(index, 1)
        }
      }
    },
    validApi(rule, value, callback) {
      if (this.dataForm.method == '' || this.dataForm.method == null) {
        callback(new Error())
      } else {
        callback()
      }
    },
    selectItemCommand(command, data) {
      if (command == 'dir') {
        this.addFolder(data)
        return
      }
      if (command == 'api') {
        this.addApi(data)
        return
      }
      if (command == 'delete') {
        serviceApi.deleteApi(data.apiId).then((res) => {
          if (res.data) {
            this.$notify.success('删除成功')
            this.selectService()
          } else {
            this.$notify.error('删除失败')
          }
        })
      }
    },
    treeNodeSelect(data) {
      if (data.apiType == 0) {
        return
      }
      this.apiForm = JSON.parse(JSON.stringify(data))
      this.paramData = data.requestParams
      if (!this.paramData) {
        this.paramData = []
      }
      this.paramData.forEach((e) => {
        if (
          (e.objectName =
            'Array' &&
            e.children &&
            e.children[0] &&
            e.children[0].objectName == 'Object')
        ) {
          e.children[0].hide = true
          e.children[0].freezed = true
        }

        if (!e.objectName) {
          e.objectName = ''
        }
      })

      this.responseData = data.responseParams
      if (!this.responseData) {
        this.responseData = []
      }
      this.currentApi = data.apiId
      this.updateApi = false
      this.selectTab()
    },
    addFolder(node) {
      this.createDir = true
      this.showCreateApi = true
      this.dataForm.parentId = node.apiId
      this.dataForm.apiType = 0
    },
    addApi(node) {
      this.createDir = false
      this.showCreateApi = true
      this.dataForm.parentId = node.apiId
      this.dataForm.apiType = 1
    },
    cancelGenerate() {
      this.generateForm = {}
      this.showGenerateApi = false
    },
    getBuildParam() {
      serviceApi.getGenerate(this.serviceId).then((res) => {
        if (!res.data) {
          return
        }
        this.generateForm = res.data
      })
    },
    submitGenerate(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        this.generateForm.serviceId = this.serviceId
        serviceApi.buildGenerate(this.generateForm).then((res) => {
          if (res.data) {
            this.$notify.success('开始构建')
            this.showGenerateApi = false
            this.isShowLog = true
            this.queryHistory()
          } else {
            this.$notify.error('触发构建任务失败')
          }
        })
      })
    },
    submitApi(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        this.dataForm.serviceId = this.serviceId
        serviceApi.createApi(this.dataForm).then((res) => {
          if (res.data) {
            this.$notify.success('添加成功')
            this.selectService()
            this.cancelCreate()
          } else {
            this.$notify.error('添加失败')
          }
        })
      })
    },
    selectCommand(command) {
      if (command == 'generate') {
        this.showGenerateApi = true
        return
      }

      if (command == 'import') {
        let serviceName = ''
        this.serviceList.forEach((e) => {
          if ((e.serviceId = this.serviceId)) {
            serviceName = e.serviceName
          }
        })
        this.importForm.serviceName = serviceName
        this.showImportDialog = true
        return
      }

      if (command == 'delete') {
        serviceApi.batchDeleteApi(this.selectNodes).then((res) => {
          if (res.data) {
            this.$notify.success('删除成功')
            this.selectService()
          } else {
            this.$notify.error('删除失败')
          }
        })
        return
      }
      this.createDir = command == 'dir'
      this.showCreateApi = true
      this.dataForm.apiType = this.createDir ? 0 : 1
    },
    cancelCreate() {
      this.showCreateApi = false
      this.dataForm = { type: 'http' }
    },
    saveApi() {
      let data = this.apiForm
      data.serviceId = this.serviceId
      this.recursionName(this.paramData)
      this.recursionName(this.responseData)
      data.requestParams = this.paramData
      data.responseParams = this.responseData
      if (this.currentApi != '') {
        serviceApi.updateApi(data).then((res) => {
          if (res.data) {
            this.$notify.success({ showClose: true, message: '修改接口成功' })
            this.expendKeys = [data.apiId]
            this.selectService()
            this.updateApi = false
          }
        })
        return
      }
      serviceApi.createApi(data).then((res) => {
        if (res.data) {
          this.$notify.success('添加接口成功')
          this.updateApi = false
          this.expendKeys = [data.apiId]
          this.selectService()
        } else {
          this.$notify.error('添加接口失败')
        }
      })
    },
    recursionName(array) {
      array.forEach((e) => {
        if (this.$utils.isEmpty(e.objectName)) {
          e.objectName = e.type
        }
        if (e.children && e.children.length > 0) {
          this.recursionName(e.children)
        }
      })
    },
    selectTab() {
      this.isLeaving = false
      if (this.activeName == 'preview') {
        this.pathData = []
        this.headerData = []
        this.bodyData = []
        this.traverseTree(this.paramData)
        this.paramData.forEach((e) => {
          if (e.position == 'Path' || e.position == 'Query') {
            this.pathData.push(e)
          }
          if (e.position == 'Header') {
            this.headerData.push(e)
          }
          if (e.position == 'Body') {
            this.bodyData.push(e)
          }
        })
        this.previewRes = JSON.parse(JSON.stringify(this.responseData))
        this.traverseTree(this.previewRes)
        this.$forceUpdate()
      }
    },
    traverseTree(nodes) {
      for (const node of nodes) {
        node.id = this.$utils.randomString()
      }

      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          this.traverseTree(node.children)
        }
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.apiName.indexOf(value) !== -1
    },
    removeParam(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      children.splice(index, 1)
    },
    paramTypeChange(type, item) {
      if (type == 'Array') {
        item.children = [
          {
            type: 'String',
            paramKey: ' ',
            position: item.position,
            require: true,
            hide: true,
            freezed: true,
            children: [],
          },
        ]
      }
    },
    addParam() {
      this.paramData.push({
        id: this.$utils.randomString(),
        paramKey: '',
        children: [],
      })
      this.uuid++
    },
    addSubParam(data) {
      if (data.children) {
        data.children.push({
          id: this.uuid,
          paramKey: '',
          children: [],
          position: data.position,
          freezed: true,
        })
        this.uuid++
        return
      }
      data.children = [
        {
          id: this.uuid,
          paramKey: '',
          children: [],
          position: data.position,
          freezed: true,
        },
      ]
      this.uuid++
    },
    addResParam() {
      this.responseData.push({ id: this.uuid, paramKey: '', children: [] })
      this.uuid++
    },
    selectService() {
      this.$store.commit('UPDATE_SERVICE_ID', this.serviceId)
      serviceApi.getApiList(this.serviceId).then((res) => {
        this.apiTreeData = this.buildTree(res.data)
        setTimeout(() => {
          this.$refs.apiTree.filter(this.filterText)
        }, 100)
      })
    },
    buildTree(data, parentId = null) {
      let tree = []
      for (let item of data) {
        if (item.parentId === parentId) {
          let children = this.buildTree(data, item.apiId)
          if (children.length > 0) {
            item.children = children
          }
          if (!item.children) {
            item.children = []
          }
          tree.push(item)
        }
      }
      return tree
    },
    openLog() {
      this.logInterval = setInterval(() => {
        this.queryHistory()
      }, 2000)
    },
    queryHistory() {
      serviceApi.getGenerateLog(this.serviceId).then((res) => {
        let array = []
        res.data.forEach((e) => {
          let params = e.generateParams
          params.time = e.updateTime
          params.status = e.status
          params.label = params.version
          params.value = e.recordId
          params.messageList = e.generateResult
          array.push(params)
        })
        this.logVersions = array
        this.isShowLog = true
        if (!this.logRecordId && this.logVersions.length > 0) {
          this.logRecordId = this.logVersions[0].value
        }

        this.selectVersion(this.logRecordId)
      })
    },
    selectVersion(recordId) {
      this.logForm = {}
      this.logVersions.forEach((e) => {
        if (e.value == recordId) {
          this.logForm = e
        }
      })
    },
    closeLog() {
      this.isShowLog = false
      this.logVersions = []
      this.logForm = {}
      this.logRecordId = null
      if (this.logInterval) {
        clearInterval(this.logInterval)
      }
    },
    getServices() {
      this.serviceList = []
      serviceApi.getServices().then((res) => {
        this.serviceList = res.data
        if (!this.serviceId) {
          this.serviceId = this.serviceList[0].serviceId
        }
        let apiId = this.$route.query.apiId
        if (apiId) {
          this.expendKeys = [apiId]
          this.$refs.apiTree.setCheckedKeys(this.expendKeys)
        }
        let serviceId = this.$route.query.serviceId
        if (serviceId) {
          this.serviceId = serviceId
        }

        this.selectService()
      })
    },
  },
  computed: {
    isHaveBody: function () {
      let flag = false
      this.paramData.forEach((e) => {
        if (e.position == 'Body') {
          flag = true
        }
      })
      return flag
    },
  },
  created() {
    this.serviceId = this.$store.state.serviceId
    this.getServices()
  },
  beforeDestroy() {
    if (this.logInterval) {
      clearInterval(this.logInterval)
    }
  },
}
</script>
<style scoped>
.uri-text {
  margin-left: 10px;
  margin-right: 10px;
}
.copy-icon {
  font-size: 15px;
  cursor: pointer;
}
.folder-icon {
  color: #e6a23c;
  margin-right: 10px;
}
.api-name {
  font-size: 13px;
  color: #606266;
}
.tree-node {
  position: relative;
  width: 100%;
}
.title-bar {
  border-left: 3px solid #2395f1;
  padding-left: 8px;
  color: rgba(13, 27, 62, 0.65);
}
.tree-op-list i {
  margin-right: 10px;
  cursor: pointer;
  font-size: 18px;
}
.tree-op-list {
  position: absolute;
  right: 10px;
  top: 0px;
}
.save-btn {
  position: absolute;
  bottom: 50px;
  right: 50px;
  z-index: 1000;
}
.display-param {
  margin-left: 50px;
}
.filter-text {
  margin-top: 10px;
}
.api-list {
  min-height: 90vh;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  border-radius: 4px;
  padding: 10px;
}
.api-detail {
  min-height: 90vh;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 100px;
}
.custom-node {
  width: 100%;
}
.op-icon i {
  font-size: 20px;
  margin-left: 10px;
}
.op-icon .el-icon-remove-outline {
  color: #f56c6c;
}
</style>
<style>
.el-input .el-input {
  width: 200px;
}
.tree-item {
  margin-top: 10px;
}
.api-detail .input-with-select .el-input-group__prepend {
  background-color: #fff;
}
.api-detail .tree-item .el-tree-node__content {
  padding: 5px 10px;
}

.api-detail .input-with-select .el-input-group__prepend {
  background-color: #fff;
}
.api-detail .el-tree-node:focus > .el-tree-node__content {
  background-color: #fff !important;
}
.api-detail .el-tree-node__content:hover {
  background-color: #fff;
}
.api-detail
  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
  background-color: #fff;
}
.filter-op {
  margin-bottom: 10px;
}

.log-list ul {
  list-style: none;
  padding: 3px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  margin: 0px;
  min-height: 300px;
}
</style>
