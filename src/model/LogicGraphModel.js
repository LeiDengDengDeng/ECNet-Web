/**
 * Created by aswasn on 2017/3/16.
 */

import * as d3 from 'd3'
import {LogicNodeType} from '../assets/constants'
import LogicPainter from '../view/LogicPainter'
require("d3-dsv");
// 说理逻辑图Model
export default class LogicGraphModel {

    constructor() {
        this.data = Array.of();
        this.id = -1;
        this.maxId = 0;
        this.title = null;
        this.caseReason = null;
        this.caseNumber = null;
        this.startDate = null;
        this.manageJudge = null;
        this.courtClerk = null

    }

    // 将Model设置为新建说理逻辑图的状态
    initAsNewModel() {
        this.maxId = 0;
        this.setTitle("未命名的说理逻辑图");
        this.data = Array.of();
        this.insertNode("最终结论", LogicNodeType.FINAL_CONCLUSION, "", null);
        LogicPainter.hideInfoPanel();
    }

    // 设置图像标题
    setTitle(title) {
        this.title = title;
    }

    // 设置案由
    setCaseReason(caseReason) {
        this.caseReason = caseReason;
    }

    // 设置案号
    setCaseNumber(caseNumber) {
        this.caseNumber = caseNumber;
    }

    // 插入一个新节点
    insertNode(topic, type, detail, leadToId) {
        let newId = this.fetchNextId();
        this.data.push({
            id: newId,
            topic: topic,
            type: type,
            detail: detail,
            leadTo: leadToId
        });
        return newId;
    }


    // 删除一个节点，其子节点追加到被删除节点的父节点上
    removeNode(id) {
        let index = this.findIndexById(id);
        if (index != -1) {
            let parentId = this.data[index].leadTo;
            this.data.splice(index, 1);
            if (parentId) {// 非根结点被删除
                for (let node of this.data) {
                    if (node.leadTo && parseInt(node.leadTo) == parseInt(id)) {
                        node.leadTo = parseInt(parentId);
                    }
                }
            } else {// 根结点被删，则删掉所有节点
                this.initAsNewModel();
            }
        }
    }

    // 删除一个节点及其所有子节点
    removeNodeAndChildren(id) {
        let node = this.findNodeById(id);
        if (node.type == LogicNodeType.FINAL_CONCLUSION) {
            this.initAsNewModel();
        } else {
            let index = this.findIndexById(node.id);
            if (index != -1) {
                this.data.splice(index, 1);
                for (let sonId of this.findDirectChildrenId(id)) {
                    this.removeNodeAndChildren(sonId);
                }
            }
        }
    }

    // 修改节点信息
    modifyNode(id, topic, type, detail, parentId) {
        let node = this.findNodeById(id);
        if (node) {
            topic &&(node.topic = topic);
            type && (node.type = type);
            detail && (node.detail = detail);
            parentId && (node.leadTo = parentId);
        }
        console.log(node)
    }


    isChildren(parentId, checkId) {
        let childrenArr = this.findAllChildrenId(parentId);
        return !((childrenArr.findIndex(function (val, idx, arr) {
            return val == checkId;
        })) == -1);
    }

    // 根据id得到其在model.data中的index
    findIndexById(id) {
        return this.data.findIndex(function (val, idx, arr) {
            return (parseInt(val.id) == parseInt(id));
        });
    }

    // 根据id得到node
    findNodeById(id) {
        let index = this.findIndexById(id);
        if (index != -1) {
            return this.data[index];
        } else {
            return null;
        }
    }

    // 根据parentId找到所有直属childrenId
    findDirectChildrenId(parentId) {
        let result = Array.of();
        for (let node of this.data) {
            let leadTo = node.leadTo;
            if (leadTo && parseInt(leadTo) == parseInt(parentId)) {
                result.push(node.id);
            }
        }
        return result;
    }

    // 根据parentId找到所有childrenId
    findAllChildrenId(parentId) {
        let result = Array.of();
        let directChildren = this.findDirectChildrenId(parentId);
        Array.prototype.push.apply(result, directChildren);
        for (let id of directChildren) {
            Array.prototype.push.apply(result, this.findAllChildrenId(id));
        }
        return result;
    }

    // 不仅设置model.data，而且修改maxId
    setDataObj(obj) {
        this.data = obj;
        this.maxId = this.findMaxId();
    }

    // 寻找到model.data中的maxId
    findMaxId() {
        let result = 0;
        for (let obj of this.data) {
            let id = parseInt(obj.id);
            if (id > result) {
                result = id;
            }
        }
        return result;
    }

    // 获取下一个可用id 从1开始
    fetchNextId() {
        return ++this.maxId;
    }
    // 把一个组内的所有节点改变绑定关系
    changeLeadTo(forePaths,leadTo){
        let currentNode = leadTo
        for (let path of forePaths ){
            let node = path.child
            this.modifyNode(node,null,null,null,currentNode)
        }
        console.log('当前状态')
        console.log(this.data)
        while (currentNode){
            let parentNode = this.findNodeById(currentNode).leadTo
            currentNode = parentNode

            if (currentNode==leadTo)
            {

                this.modifyNode(currentNode,null,null,null,1)//将成环的节点连接到初始节点
                break
            }
        }

    }

    // 读入一个csv字符串，返回一个[object,object,...,columns:["","",...]]
    static csvStr2Obj(str) {
        if (str != null) {
            return d3.csvParse(str);
        }
    }

    // 把model.data转为csv字符串
    obj2csvStr() {
        return d3.csvFormat(this.data);
    }

}
