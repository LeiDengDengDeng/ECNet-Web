/**
 * Created by aswasn on 2017/3/17.
 */

import $ from '../assets/jquery-vendor'
import * as d3 from 'd3'
import NodeDrag from './LogicMotion'
require("d3-hierarchy");
require("d3-drag");
import {GraphVal,LogicNodeType} from '../assets/constants'
export default class LogicPainter {

    static drawTree(controller) {
        const isStraight = controller.isStraight;
        let data = controller.graphModel.data;
        let tree = d3.tree();
        let stratify = d3.stratify().id(d => d.id).parentId(d => d.leadTo);
        let root = stratify(data);

        let svg = d3.select("svg");
        svg.select("g[id='graph']").remove();
        let group = svg.append("g").attr("transform", "translate(0,0)").attr("id", "graph");
        let svgWidth = svg.attr("width"), svgHeight = svg.attr("height");

        // 根据层数计算宽度，根据叶子节点数计算高度
        let leaves = root.leaves();
        let graphHeight = leaves.length * 65;
        let graphWidth = 0;
        for (let leaf of leaves) {
            if (leaf.depth > graphWidth) {
                graphWidth = leaf.depth;
            }
        }
        graphWidth = (graphWidth) * 160;
        graphWidth = graphWidth > (svgWidth - 50) ? (svgWidth - 50) : graphWidth;
        graphHeight = graphHeight > (svgHeight - 50) ? (svgHeight - 50) : graphHeight;
        tree.size([graphHeight, graphWidth]);
        controller.root = tree(root);
        const drag = new NodeDrag();

        // 开始绘图
        d3.select("svg")
            .call(d3.drag()
            .on("start", () => drag.multiSelectStart(controller))
            .on("drag", () => drag.multiSelectDrag())
            .on("end", () => drag.multiSelectEnd(controller)))


        let node = group.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("id", d => ("g-" + d.id))
            .attr("class", function (d) {
                let result = "node ";
                switch (d.data.type) {
                    case LogicNodeType.EVIDENCE:
                        result += "evidence";
                        break;
                    case LogicNodeType.FACT:
                        result += "fact";
                        break;
                    case LogicNodeType.LAW:
                        result += "law";
                        break;
                    case LogicNodeType.CONCLUSION:
                        result += "conclusion";
                        break;
                    case LogicNodeType.FINAL_CONCLUSION:
                        result += "final-conclusion";
                        break;
                }
                return result;
            })
            .attr("transform", function (d) {
                return "translate(" + (parseFloat(d.y)+150) + "," + d.x+ ")";
            }).call(d3.drag()
                .on("start", d => drag.dragStart(controller, d))
                .on("drag", d => drag.drag(controller, d))
                .on("end", d => drag.dragEnd(controller, d)));

        node.append("text")
            .attr("id", d => ("text-" + d.id))
            .style("user-select", "none")
            .style("font-size", "14px")
            .style("text-anchor", function (d) {
                return d.children ? "end" : "start";
            })
            .text((d) => d.data.topic);

        node.append("rect")
            .attr("id", d => ('rect-' + d.id))
            .attr("x", function (d) {
                const width = document.getElementById("text-" + d.id).getBBox().width;
                return d.children ? 0 - width - 5 : -5;
            })
            .attr("y", function (d) {
                const height = document.getElementById("text-" + d.id).getBBox().height;
                return 0 - height - 2;
            })
            .attr('rx','3').attr('ry','3')
            .attr("width", function (d) {
                const width = document.getElementById("text-" + d.id).getBBox().width;
                return width + 10;
            })
            .attr("height", function (d) {
                const height = document.getElementById("text-" + d.id).getBBox().height;
                return height + 8;
            })
            .attr("stroke-width", 2)
            .attr("fill", "rgba(255,255,255,0)");


        let link = group.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("id", d => ("path-" + d.id))
            .attr("class", "link")
            .attr("stroke", "rgba(0,0,0,0.5)")
            .attr("stroke-width", "2")
            .attr("fill", "rgba(255,255,255,0)")
            .attr("d", function (d) {

                let {x: nodeX, y: nodeY, width: nodeWidth, height: nodeHeight} = document.getElementById('rect-'+d.id).getBBox();
                let {x: parentNodeX, y: parentNodeY, width: parentNodeWidth, height: parentNodeHeight} = document.getElementById('rect-'+d.parent.id).getBBox();
                let x, y, parentX, parentY;

                nodeY = parseFloat(d.y)+150;
                nodeX = d.x;
                parentNodeX = d.parent.x;
                parentNodeY = parseFloat(d.parent.y)+150;

                if (d.children && d.children.length > 0) {
                    x = nodeY - nodeWidth + 5;
                } else {
                    x = nodeY - 5;
                }
                y = nodeX - nodeHeight / 2 + 5;
                parentX = parentNodeY + 5;
                parentY = parentNodeX - parentNodeHeight / 2 + 4;

                if (isStraight) {
                    return "M" + x + "," + y
                        + "L" + " " + parentX + "," + parentY;
                } else {
                    return "M" + x + "," + y
                        + "C " + (x + parentX) / 2 + "," + y
                        + " " + (x + parentX) / 2 + "," + parentY
                        + " " + parentX + "," + parentY;
                }
            });
    }

    static drawTable(graphModel) {
        $("#graph-title-input").val(graphModel.title);
        $(".node-table-wrapper tbody").empty();
        let html = "";
        for (let node of graphModel.data) {
            let parentTopic = node.leadTo ? graphModel.findNodeById(node.leadTo).topic : "";
            html += "<tr>" +
                "<td>" + node.id + "</td>" +
                "<td>" + node.topic + "</td>" +
                "<td>" + node.type + "</td>" +
                "<td>" + node.detail + "</td>" +
                "<td>" + node.leadTo + " " + parentTopic + "</td>" +
                "<td>" +
                "<button data-id='" + node.id + "' class='btn btn-success btn-xs add-btn' title='添加子节点' data-toggle='modal' data-target='#node-add-modal'>添加</button>" +
                "<button data-id='" + node.id + "' class='btn btn-danger btn-xs del-btn' title='删除节点' data-toggle='modal' data-target='#node-del-modal'>删除</button>" +
                "<button data-id='" + node.id + "' class='btn btn-warning btn-xs edit-btn' title='编辑节点' data-toggle='modal' data-target='#node-edit-modal'>编辑</button>" +
                "</td>" +
                "</tr>";
        }
        $(".node-table-wrapper tbody").append(html);
    }

    // 根据focus的node不同，leadTo的select内容也有所不同
    static fillLeadToSelect(graphModel, idNow, type, $select) {
        let data = graphModel.data;
        let leadTo = "";
        $select.empty();
        let html = "";
        if (type == LogicNodeType.FINAL_CONCLUSION) {
            html += "<option value=''></option>>";
        } else {
            for (let node of data) {
                let id = parseInt(node.id);
                if (id == parseInt(idNow)) {
                    leadTo = node.leadTo;
                } else {
                    if (!graphModel.isChildren(idNow, id)) {
                        html += "<option value='" + id + "'>" + id + " " + node.topic + "</option>";
                    }
                }
            }
        }
        $select.append(html);
        $select.val(leadTo);
    }

    // 第二个参数没有时，所有的节点都加入select中，否则将leadTo锁定为第二个参数代表的节点
    static fillAddModalLeadToSelect(graphModel, parentId) {
        let $select = $("#node-add-modal #node-add-leadTo-select");
        if (parentId) {
            let node = graphModel.findNodeById(parentId);
            node && $select.append("<option value='" + parentId + "'>" + parentId + " " + node.topic + "</option>");
        } else {
            let html = "";
            for (let node of graphModel.data) {
                let id = parseInt(node.id);
                html += "<option value='" + id + "'>" + id + " " + node.topic + "</option>";
            }
            $select.append(html);
        }
    }

    // 隐藏信息panel
    static hideInfoPanel() {
        let $infoPanel = $(".node-info-wrapper .node-panel");
        $infoPanel.removeClass("panel-primary panel-info panel-danger panel-success panel-warning");
        $infoPanel.hide();
    }

    // 隐藏逻辑图panel
    static hideLogicInfoPanel() {
        let $infoPanel = $("#collapseLogic");
        $infoPanel.collapse('hide');
    }

    // 显示信息panel
    static showInfoPanel(graphModel, node) {
        $(".node-info-wrapper .node-panel .alert").hide();
        let $infoPanel = $(".node-info-wrapper .node-panel");
        let $panelIdInput = $(".node-info-wrapper #panel-id-input");
        let $panelTopicInput = $(".node-info-wrapper #panel-topic-input");
        let $panelTypeSelect = $(".node-info-wrapper #panel-type-select");
        let $panelLeadToSelect = $(".node-info-wrapper #panel-leadTo-select");
        let $panelDetailInput = $(".node-info-wrapper #panel-detail-input");

        // 清掉各种状态
        $infoPanel.removeClass("panel-primary panel-info panel-danger panel-success panel-warning");
        $panelTypeSelect.removeAttr("disabled");
        $panelLeadToSelect.removeAttr("disabled");

        // 填入信息
        $panelIdInput.val(node.id);
        $panelTopicInput.val(node.topic);
        $panelDetailInput.val(node.detail);
        $panelTypeSelect.val(node.type);
        LogicPainter.fillLeadToSelect(graphModel, node.id, node.type, $(".node-info-wrapper #panel-leadTo-select"));

        // 设置外框样式以及最终结论相关禁用
        switch (node.type) {
            case LogicNodeType.EVIDENCE:
                $infoPanel.addClass("panel-success");
                break;
            case LogicNodeType.FACT:
                $infoPanel.addClass("panel-warning");
                break;
            case LogicNodeType.LAW:
                $infoPanel.addClass("panel-danger");
                break;
            case LogicNodeType.CONCLUSION:
                $infoPanel.addClass("panel-info");
                break;
            case LogicNodeType.FINAL_CONCLUSION: {
                $infoPanel.addClass("panel-primary");
                $panelTypeSelect.attr("disabled", "disabled");
                $panelLeadToSelect.attr("disabled", "disabled");
            }
                break;
        }
        console.log('info panel')
        console.log(node)
        $infoPanel.show();
    }

    // 显示逻辑图panel
    static showLogicInfoPanel(graphModel) {
        $(".node-info-wrapper .info-panel .alert").hide();
        let $infoPanel = $("#collapseLogic");
        let $titleInput = $("#title-input");
        let $caseReasonInput = $("#caseReason-input");
        let $caseNumberInput = $("#caseNumber-input");


        // 填入信息
        $titleInput.val(graphModel.title);
        $caseReasonInput.val(graphModel.caseReason);
        $caseNumberInput.val(graphModel.caseNumber);
    }

    // 为选中的节点设置特殊样式，第二个参数代表是否选中
    static renderSelectedNode(id, selected) {
        if (selected) {
            $(`#g-${id}`).addClass('selected');
        } else {
            $(`#g-${id}`).removeClass('selected');
        }
    }

    // 设置被拖拽到上方的节点，改变其样式
    static renderCoverNode(id,covered){
        if (covered) {
            $(`#g-${id}`).addClass('covered');
        } else {
            $(`#g-${id}`).removeClass('covered');
        }
    }



    // 为删除节点modal填写信息
    static prepareDelModal(graphModel, id) {
        let node = graphModel.findNodeById(id);
        let parentTopic = node.leadTo ? graphModel.findNodeById(node.leadTo).topic : "";
        $("#node-del-modal .del-id-td").text(node.id);
        $("#node-del-modal .del-topic-td").text(node.topic);
        $("#node-del-modal .del-type-td").text(node.type);
        $("#node-del-modal .del-detail-td").text(node.detail);
        $("#node-del-modal .del-leadTo-td").text(node.leadTo + " " + parentTopic);
    }

    // 为添加节点modal准备空白input和合适的select
    static prepareAddModal(graphModel, parentId) {
        $("#node-add-modal .alert").hide();
        $("#node-add-modal #node-add-topic-input").val("");
        $("#node-add-modal #node-add-detail-input").val("");
        $("#node-add-modal #node-add-type-select").val("证据");
        $("#node-add-modal #node-add-leadTo-select").empty();
        if (parentId) {
            LogicPainter.fillAddModalLeadToSelect(graphModel, parentId);
        } else {
            LogicPainter.fillAddModalLeadToSelect(graphModel);
        }
    }

    // 为编辑节点modal填写input和合适的select
    static prepareEditModal(graphModel, id) {
        $("#node-edit-modal .alert").hide();
        let node = graphModel.findNodeById(id);
        $("#node-edit-modal #node-edit-type-select").removeAttr("disabled");
        $("#node-edit-modal #node-edit-leadTo-select").removeAttr("disabled");
        if (node) {
            $("#node-edit-modal #node-edit-id-input").val(node.id);
            $("#node-edit-modal #node-edit-topic-input").val(node.topic);
            $("#node-edit-modal #node-edit-detail-input").val(node.detail);
            $("#node-edit-modal #node-edit-type-select").val(node.type);
            LogicPainter.fillLeadToSelect(graphModel, id, node.type, $("#node-edit-modal #node-edit-leadTo-select"));
            $("#node-edit-modal #node-edit-leadTo-select").val(node.leadTo);
            if (node.type == LogicNodeType.FINAL_CONCLUSION) {
                $("#node-edit-modal #node-edit-type-select").attr("disabled", "disabled");
                $("#node-edit-modal #node-edit-leadTo-select").attr("disabled", "disabled");
            }
        }

    }
/* edit by zhaosimeng
    2017/06/24
 */

    static drawMultiSelectArea(x,y) {
        d3.select('svg').append('rect').attr('id','multi-select-area').attr('class','multi-select-area')
            .attr('stroke-width',GraphVal.MULTI_SELECT_AREA_STROKE_WIDTH)
            .attr('stroke',GraphVal.MULTI_SELECT_AREA_COLOR)
            .attr('fill',GraphVal.MULTI_SELECT_AREA_COLOR)
            .attr('fill-opacity',GraphVal.MULTI_SELECT_AREA_OPACITY)
            .attr('x',x).attr('y',y).attr('width',0).attr('height',0)
            .attr('ax',x).attr('ay',y)
        console.log("drag start "+x.toFixed(2)+" "+y.toFixed(2));
    }
    static expandMultiSelectArea(newx, newy) {
        let area = d3.select('#multi-select-area');
        let ox =  area.attr('ax');
        let oy = area.attr('ay');
        let width = newx-ox
        let height = newy-oy
        if (width<0)
        {
            width = width*-1
            area.attr('x',newx)
        }
        else {
            area.attr('x',ox)
        }
        if (height<0)
        {
            height = height*-1
            area.attr('y',newy)
        }else
        {
            area.attr('y',oy)
        }

        area.attr('width',width).attr('height',height);
    }


    static findElementByPos(xin,yin,node=null){
        let nodes = d3.selectAll('.node')
        let res = Array.of()
        let c = 0
        let x = parseFloat(xin)
        let y = parseFloat(yin)
        if (node)//根据鼠标位置信息判断会有偏差，故根据当前选择的节点位置信息获取x，y
        {
            const n = d3.select("#g-"+node.id)
            let pos = n.attr('transform').replace('translate(','').replace(')','').split(',')
            x = parseFloat(pos[0])
            y = parseFloat(pos[1]);
        }
        nodes.each(function (d,i) {
            let node = d3.select(this)
            let pos = node.attr('transform').replace('translate(','').replace(')','').split(',')
            let px = parseFloat(pos[0])
            let py = parseFloat(pos[1])
            let width = parseFloat(node.select('rect').attr('width'))
            let height = parseFloat(node.select('rect').attr('height'))
            // console.log(x.toFixed(2)+','+y.toFixed(2)+' '+px.toFixed(2)+','+py.toFixed(2)+' '+width.toFixed(2)+','+height.toFixed(2))
            if (px<x+width/2&&px>x-width/2&&py<y+height/2&&py>y-height/2){
                res.push(parseInt(node.attr('id').replace('g-','')))
            }
            c++

        })
        // console.log(c +' '+ res.length)
        return res
    }

    //-----------
    static moveNode(controller, node, xChange, yChange, oriPath, oriChildPaths) {
        const group = d3.select(`#g-${node.id}`);
        const parent = node.parent;

        let pos = d3.select("#g-"+node.id).attr('transform').replace('translate(','').replace(')','').split(',')
        let x = parseFloat(pos[0])
        let y = parseFloat(pos[1])
        // 移动节点自己
        const rx = d3.select("#rect-"+node.id).attr('x')
        const ry = d3.select("#rect-"+node.id).attr('y')
        const width = d3.select("#rect-"+node.id).attr('width')
        const height = d3.select("#rect-"+node.id).attr('height')

        const l_anchor_point = {
            x:x+parseFloat(rx),
            y:y+parseFloat(ry)+parseFloat(height)/2
        }

        const r_anchor_point = {
            x:x+parseFloat(rx) + parseFloat(width),
            y:y+parseFloat(ry) + parseFloat(height)/2.0
        }
        group.attr('transform', `translate(${x + xChange},${y + yChange})`);
        // 移动path
        const path = d3.select(`#path-${node.id}`);
        node.parent && path.attr("d", (function () {
            if (controller.isStraight) {
                return "M" + (l_anchor_point.x) + "," + (l_anchor_point.y)
                    + "L" + " " + oriPath.parentX + "," + oriPath.parentY;
            } else {
                return "M" + (l_anchor_point.x) + "," + (l_anchor_point.y)
                    + "C " + (x + xChange + oriPath.parentX) / 2 + "," + (y + yChange)
                    + " " + (x + xChange + oriPath.parentX) / 2 + "," + oriPath.parentY
                    + " " + oriPath.parentX + "," + oriPath.parentY;
            }
        })());
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                const path = d3.select(`#path-${node.children[i].id}`);
                path && path.attr("d", (function () {
                    if (controller.isStraight) {
                        return "M" + oriChildPaths[i].x + "," + oriChildPaths[i].y
                            + "L" + " " + (r_anchor_point.x) + "," + (r_anchor_point.y);
                    } else {
                        return "M" + oriChildPaths[i].x + "," + oriChildPaths[i].y
                            + "C " + (oriChildPaths[i].x + xChange + x) / 2 + "," + oriChildPaths[i].y
                            + " " + (oriChildPaths[i].x + xChange + x) / 2 + "," + (y + yChange)
                            + " " + (r_anchor_point.x) + "," + (r_anchor_point.y);
                    }
                })());
            }
        }

    }
    //多个节点同时移动
    static moveNodes(nodes,forePaths,childPaths,parallarPaths,deltaX,deltaY,straight=true)
    {
        //移动节点
        for (let nodeId of nodes){
            let pos =d3.select("#g-"+nodeId).attr('transform').replace('translate(','').replace(')','').split(',')
            let nx = parseFloat(pos[0])+deltaX
            let ny = parseFloat(pos[1])+deltaY
            d3.select("#g-"+nodeId).attr('transform','translate('+nx+','+ny+")");
        }
        let paths = Array.of()
        paths = paths.concat(forePaths,childPaths,parallarPaths)

        // console.log('paths')
        // console.log(paths)
        //
        //
        // console.log('forepath')
        // console.log(forePaths)
        // console.log('parapath')
        // console.log(parallarPaths)
        // console.log('childpath')
        // console.log(childPaths)

        for (let forePath of paths){
            console.log(forePath)

            const parentId = forePath.parent
            const childId = forePath.child
            let posParent = d3.select("#g-"+parentId).attr('transform').replace('translate(','').replace(')','').split(',')
            let px = parseFloat(posParent[0])
            let py = parseFloat(posParent[1])

            let posChild = d3.select("#g-"+childId).attr('transform').replace('translate(','').replace(')','').split(',')
            let cx = parseFloat(posChild[0])
            let cy = parseFloat(posChild[1])

            const p_rx = d3.select("#rect-"+parentId).attr('x')
            const p_ry = d3.select("#rect-"+parentId).attr('y')

            const c_rx = d3.select("#rect-"+childId).attr('x')
            const c_ry = d3.select("#rect-"+childId).attr('y')


            const p_width = d3.select("#rect-"+parentId).attr('width')
            const p_height = d3.select("#rect-"+parentId).attr('height')
            const c_height = d3.select("#rect-"+childId).attr('height')

            const p_anchor_point = {
                x:px+parseFloat(p_rx)+parseFloat(p_width),
                y:py+parseFloat(p_ry)+parseFloat(p_height)/2
            }

            const c_anchor_point = {
                x:cx+parseFloat(c_rx) ,
                y:cy+parseFloat(c_ry) + parseFloat(c_height)/2.0
            }
            const path = d3.select('#path-'+forePath.child)
            path & path.attr('d',(function(){
                if(straight){
                    return "M"+(c_anchor_point.x)+','+(c_anchor_point.y)+'L '+p_anchor_point.x+','+p_anchor_point.y;
                }else{
                    return "M"+(c_anchor_point.x)+','+(c_anchor_point.y)
                    +"C "+(p_anchor_point.x+cx)/2+','+(c_anchor_point.y)
                    +" "+(p_anchor_point.x+cx)/2+','+p_anchor_point.y
                    +' '+p_anchor_point.x+','+p_anchor_point.y;
                }
            }));
        }
    }

}
