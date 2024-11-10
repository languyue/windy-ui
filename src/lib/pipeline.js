const width = 120
const height = 50
export default {
  /**
   * 修改节点
   */
  updateNode(pipeline, node, subNodes) {
    let pipelineArray = JSON.parse(JSON.stringify(pipeline))

    //找到当前修改跟节点以及所有子节点
    let currentline = []
    let nodeIndex = 0
    for (var i = 0; i < pipelineArray.length; ) {
      if (pipelineArray[i].group == node.group) {
        if (pipelineArray[i].root) {
          nodeIndex = i
          i++
          continue
        }
        currentline.push(pipelineArray[i])
        //删除子节点
        pipelineArray.splice(i, 1)
      } else {
        i++
      }
    }

    let num = 1
    subNodes.forEach((e) => {
      let index = nodeIndex + num
      let item = {
        group: node.group,
        hint: e.hint,
        id: index,
        name: e.name,
        next: [],
        root: false,
        nodeId: e.nodeId,
        status: 'success',
        originData: {
          actionId: e.originData.actionId,
          compareInfo: e.originData.compareResults,
          paramList: e.originData.paramList,
        },
      }
      pipelineArray.splice(index, 0, item)
      num++
    })
    let reduceCount = currentline.length - subNodes.length
    let arr = []
    node.next.forEach((e) => {
      e.index = e.index - reduceCount
      arr.push(e)
    })

    let changeMap = {}
    subNodes.forEach((e) => {
      changeMap[e.actionId] = e.compareResults
    })

    pipelineArray.forEach((e) => {
      if (e.originData) {
        let config = changeMap[e.originData.actionId]
        if (config) {
          e.originData.compareInfo = config
        }
      }
    })
    return pipelineArray
  },
  /**
   * 添加节点
   *
   */
  addNode(pipelineArray, node, subNodes) {
    //新加节点与最后节点互换位置
    let pipeline = JSON.parse(JSON.stringify(pipelineArray))
    let lastNode = pipeline[pipeline.length - 1]
    let wIndex = lastNode.x
    let hIndex = lastNode.y
    node.x = lastNode.x
    node.y = lastNode.y
    node.group = lastNode.group
    lastNode.group = lastNode.group + 1

    //原数组删除最后一个节点
    pipeline.splice(pipeline.length - 1, 1)

    let lastIndex = pipeline.length + 1
    if (subNodes) {
      lastIndex += subNodes.length
    }
    //新加节点指向最后节点
    node.next = [{ index: lastIndex, weight: 0 }]
    pipeline.push(node)

    console.log('last result', pipeline)

    //开始添加子节点
    if (!subNodes) {
      //最后节点横坐标加一个单位，并且重新加入数组
      lastNode.x += width
      pipeline.push(lastNode)
      return pipeline
    }

    //获取所有指向新节点的前置节点
    let preNodeArray = []
    pipeline.forEach((ele) => {
      let hasNewNode = false
      ele.next.forEach((e) => {
        if (e.index == pipeline.length - 1) {
          hasNewNode = true
        }
      })

      if (hasNewNode) {
        preNodeArray.push(ele)
      }
    })

    let rootId = node.group
    let index = 1
    subNodes.forEach((e) => {
      let item = {
        id: rootId + index,
        name: e.name,
        hint: e.name,
        status: 'success',
        group: rootId,
        originData: e.originData,
        next: [],
      }

      item.x = wIndex
      item.y = hIndex + height
      pipeline.push(item)
      node.list.push(item)

      //前置节点指向新节点的子节点
      preNodeArray.forEach((element) => {
        element.next.push({ index: pipeline.length - 1, weight: 0 })
      })
    })

    //最后节点横坐标加一个单位，并且重新加入数组
    lastNode.x += width
    pipeline.push(lastNode)

    this.resetId(pipeline)
    console.log('sub result', pipeline)
    return pipeline
  },
  /**
   * 删除节点
   */
  removeNode(pipeline, node) {
    if (!node.root) {
      return this.removeSingleNode(pipeline, node)
    }

    let array = this.transformTreeNode(pipeline)
    console.log('array', JSON.parse(JSON.stringify(array)))
    let pos = array.findIndex((item) => item.id == node.id)
    let current = array[pos]

    //删除节点的后面节点指向坐标只需要减去删除节点长度
    for (let i = pos + 1; i < array.length; i++) {
      array[i].next.forEach((e) => {
        e.index = e.index - current.nodes.length - 1
      })
    }

    //新数组添加没有改变的节点
    let newArray = []
    for (let i = 0; i < array[pos - 1].id; i++) {
      newArray.push(pipeline[i])
    }

    //新数组添加改变的节点
    let group = null
    for (let i = pos - 1; i < array.length; i++) {
      if (i == pos) {
        continue
      }

      let item = array[i]
      if (i == pos - 1) {
        //删除节点的前一个节点需要调整指向坐标
        let rightNode = array[pos + 1]
        item.next = []
        item.next.push({
          index: rightNode.id - current.nodes.length - 1,
          width: 0,
        })

        rightNode.nodes.forEach((e) => {
          item.next.push({
            index: e.id - current.nodes.length - 1,
            width: 0,
          })
        })
      }

      if (item.root) {
        group = newArray.length
        item.group = group
      }
      item.id = newArray.length
      newArray.push(item)
      if (item.nodes && item.nodes.length > 0) {
        item.nodes.forEach((e) => {
          e.id = newArray.length
          e.group = group
          newArray.push(e)
        })
      }
    }

    console.log('delete result', newArray)
    return newArray
  },
  /**
   * 删除耽搁节点
   *
   */
  removeSingleNode(pipeline, node) {
    let array = this.transformTreeNode(pipeline)
    let pos = node.group

    //删除节点的前一个根结点设置指向下标
    let newArray = []
    newArray.push({ index: array[pos].id, width: 0 })
    let num = 1
    array[pos].nodes.forEach((e) => {
      if (e.id != node.id) {
        newArray.push({ index: array[pos].id + num, width: 0 })
      }
    })
    pipeline[array[pos - 1].id].next = newArray

    //给删除节点的当前根节点和后续根节点的指向下标-1
    pipeline.forEach((e) => {
      if ((e.id > node.id || e.group == node.group) && e.root && e.next) {
        e.next.forEach((e) => {
          e.index = e.index - 1
        })
      }
    })
    let index = pipeline.findIndex((item) => item.id == node.id)
    pipeline.splice(index, 1)
    console.log('remove single result', pipeline)
    this.resetId(pipeline)
    return pipeline
  },
  /**
   * 将流水线节点向左移动
   *
   */
  moveLeft(pipeline, node) {
    node = this.getRootOfNode(pipeline, node)
    if (node.id <= 2) {
      console.log('已到根结点无法前移')
      return
    }

    this.changeGroup(pipeline, node, true)
    let array = this.transformTreeNode(pipeline)
    let index = array.findIndex((item) => item.id == node.id)
    let preRootNode = array[index - 1]
    let beforTwoNode = array[index - 2]

    /**
     * beforTwoNode == preRootNode == node
     */

    let current = JSON.parse(JSON.stringify(array[index]))
    let preRoot = JSON.parse(JSON.stringify(preRootNode))
    let beforTwo = JSON.parse(JSON.stringify(beforTwoNode))
    //preRootNode（node） 下标处理
    current.id = preRoot.id
    let preArray = []
    let num = current.id + current.nodes.length + 1
    for (let ind = 0; ind <= preRoot.nodes.length; ind++) {
      preArray.push({ index: num + ind, width: 0 })
    }

    //node(preRootNode) 下标处理
    preRoot.id = current.id + current.nodes.length + 1
    let curArray = current.next

    //beforTwoNode nex下标处理
    let startNum = beforTwo.id + beforTwo.nodes.length + 1
    let beforTwoArray = []
    for (let index = 0; index <= current.nodes.length; index++) {
      beforTwoArray.push({ index: startNum + index, width: 0 })
    }

    //挪移pre节点位置
    current.next = preArray
    pipeline[current.id] = current
    for (let i = 0; i < current.nodes.length; i++) {
      pipeline[current.id + i + 1] = current.nodes[i]
    }

    //挪移current位置
    preRoot.next = curArray
    pipeline[preRoot.id] = preRoot
    for (let i = 0; i < preRoot.nodes.length; i++) {
      pipeline[preRoot.id + i + 1] = preRoot.nodes[i]
    }

    pipeline[beforTwo.id].next = beforTwoArray

    this.resetId(pipeline)
    console.log('exchange after', JSON.parse(JSON.stringify(pipeline)))
  },

  /**
   * 将流水线子节点向右移动
   *
   */
  moveRight(pipeline, node) {
    node = this.getRootOfNode(pipeline, node)
    this.changeGroup(pipeline, node, false)

    let array = this.transformTreeNode(pipeline)
    let pos = array.findIndex((item) => item.id == node.id)
    if (pos >= array.length - 2) {
      console.log('已到根结点无法后移')
      return
    }

    let middleNode = array[pos]
    let leftNode = array[pos - 1]
    let rightNode = array[pos + 1]

    let leftArray = []
    rightNode.id = middleNode.id
    for (let i = 0; i <= rightNode.nodes.length; i++) {
      leftArray.push({ index: rightNode.id + i, width: 0 })
    }

    let middleArray = []
    let startIndex = rightNode.id + rightNode.nodes.length + 1
    for (let i = 0; i <= middleNode.nodes.length; i++) {
      middleArray.push({ index: startIndex + i, width: 0 })
    }
    let rightArray = rightNode.next

    pipeline[leftNode.id].next = leftArray

    //转移middle(right)
    rightNode.next = middleArray
    rightNode.group = rightNode.id
    pipeline[rightNode.id] = rightNode
    for (let i = 0; i < rightNode.nodes.length; i++) {
      rightNode.nodes[i].group = rightNode.id
      pipeline[rightNode.id + i + 1] = rightNode.nodes[i]
    }

    //转移right(middle)
    middleNode.id = rightNode.id + rightNode.nodes.length + 1
    middleNode.next = rightArray
    middleNode.group = middleNode.id
    pipeline[middleNode.id] = middleNode
    for (let i = 0; i < middleNode.nodes.length; i++) {
      middleNode.nodes[i].group = middleNode.id
      pipeline[middleNode.id + i + 1] = middleNode.nodes[i]
    }
    pipeline[pipeline.length - 1].group = pipeline[pipeline.length - 1].id

    let idx = 0
    pipeline.forEach((e) => {
      e.id = idx
      idx++
    })
  },
  /**
   * 请求添加或者修改流水线的接口前需要通过此方法将数据转换一下
   *
   */
  exchangeData(pipelineForm, nodes) {
    //先获取root节点
    let rootMap = {}
    nodes.forEach((e) => {
      if (!rootMap[e.group]) {
        rootMap[e.group] = []
      }
      rootMap[e.group].push(e)
    })

    let pipeline = {
      pipelineId: pipelineForm.pipelineId,
      pipelineName: pipelineForm.pipelineName,
      pipelineType: pipelineForm.pipelineType,
      executeType: pipelineForm.executeType,
      stageList: [],
    }

    let stageId = null
    Object.values(rootMap).forEach((nodeList) => {
      let node = {}
      let subNode = []
      nodeList.forEach((e) => {
        if (e.root) {
          node.stageName = e.name
          node.type = e.group
          node.stageId = e.stageId
          node.configId = e.configId
          stageId = e.stageId
        } else {
          console.log('sub item', e)
          let data = e.originData.compareResults
          if (!data) {
            data = e.originData.compareInfo
          }

          let nodeConfig = {
            actionId: e.originData.actionId,
            compareInfo: data,
            paramList: e.originData.paramList,
          }
          subNode.push({
            nodeName: e.name,
            configDetail: nodeConfig,
            type: e.group,
            nodeId: e.nodeId,
            stageId: stageId,
          })
        }
      })

      node.nodes = subNode
      pipeline.stageList.push(node)
    })
    console.log('转换结果', pipeline)
    return pipeline
  },
  /**
   * 从后端接口获取到的数据需要通过此方法转换给ui
   *
   */
  displayData(list) {
    let data = []
    let preNode = {
      next: [],
    }
    let index = 0
    let groupId = 0
    list.forEach((e) => {
      let rootNode = {
        id: index,
        name: e.stageName,
        hint: e.stageName,
        status: 'success',
        group: groupId,
        root: true,
        stageId: e.stageId,
        configId: e.configId,
        list: e.nodes,
        next: [],
      }
      data.push(rootNode)

      preNode.next.push({ index: index, weight: 0 })
      index++
      if (e.nodes) {
        e.nodes.forEach((ele) => {
          data.push({
            id: index,
            name: ele.nodeName,
            hint: ele.nodeName,
            status: 'success',
            group: groupId,
            nodeId: ele.nodeId,
            originData: ele.configDetail,
            next: [],
          })
          preNode.next.push({ index: index, weight: 0 })
          index++
        })
      }

      preNode = rootNode
      groupId++
    })

    data[0].status = 'start'
    data[data.length - 1].status = 'end'
    console.log('filnal', data)
    return data
  },
  /**
   * 如果在页面点击的不是根节点，则将子节点转换为根结点
   *
   */
  getRootOfNode(pipeline, node) {
    if (node.root) {
      return node
    }

    let result = node
    pipeline.forEach((e) => {
      if (e.group == node.group && e.root) {
        result = e
      }
    })
    return result
  },
  /**
   * 移动节点的时候切换两列节点的group属性，(group属性在请求接口转化数据的时候使用)
   *
   */
  changeGroup(pipeline, node, isMoveLeft) {
    let temGroup = node.group
    pipeline.forEach((e) => {
      if (temGroup == e.group) {
        e.group = 'temp'
      }
    })

    if (isMoveLeft) {
      let preGroup = temGroup - 1
      pipeline.forEach((e) => {
        if (preGroup == e.group) {
          e.group = preGroup + 1
        }
        if ('temp' == e.group) {
          e.group = temGroup - 1
        }
      })
    } else {
      let preGroup = temGroup + 1
      pipeline.forEach((e) => {
        if (preGroup == e.group) {
          e.group = preGroup - 1
        }
        if ('temp' == e.group) {
          e.group = temGroup + 1
        }
      })
    }
  },
  transformTreeNode(pipeline) {
    let array = []
    let preNode = {}
    let itemArray = []
    pipeline.forEach((e) => {
      if (e.root) {
        preNode.nodes = JSON.parse(JSON.stringify(itemArray))
        preNode = e
        array.push(e)
        itemArray = []
      } else {
        itemArray.push(e)
      }
    })

    array[array.length - 1].nodes = []
    return array
  },
  resetId(pipeline) {
    let idx = 0
    pipeline.forEach((e) => {
      e.id = idx
      idx++
    })
  },
}
