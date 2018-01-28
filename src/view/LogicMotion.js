import * as d3 from 'd3'
import LogicPainter from './LogicPainter'

import { AddOperation, RemoveAndEditOperation } from '../model/LogicOperation';
export default class NodeDrag {
    //multiselect处理生成多选框的功能
    multiSelectStart(controller){

        for (let id of controller.multiSelectNodes)
        {
            LogicPainter.renderSelectedNode(id,false);
        }
        controller.clearMultiSelectNode()
        LogicPainter.drawMultiSelectArea(d3.event.x,d3.event.y);
    }
    multiSelectDrag(){
        LogicPainter.expandMultiSelectArea(d3.event.x,d3.event.y);
    }
    multiSelectEnd(controller){

        let x0 = d3.select("#multi-select-area").attr('x')
        let y0 = d3.select("#multi-select-area").attr('y')
        let width = d3.select("#multi-select-area").attr('width')
        let height = d3.select("#multi-select-area").attr('height')
        let x1= parseFloat(x0)+ parseFloat(width)
        let y1 = parseFloat(y0)+ parseFloat(height)

        d3.select("#multi-select-area").remove();
        if (width>3&&height>3)
        {

            let nodes = d3.selectAll(".node")
            // console.log(x0+','+y0+' '+x1+','+y1)
            controller.multiSelectNodes = Array.of()
            nodes.each(function(node,i){
                let pos =d3.select(this).attr('transform').replace('translate(','').replace(')','').split(',')

                let x = parseFloat(pos[0])+150
                let y = parseFloat(pos[1])
                if (x>x0 && y>y0 && x<x1 && y<y1){
                    let id = parseInt(d3.select(this).attr('id').replace('g-',''))

                    controller.multiSelectNodes.push(id)
                    LogicPainter.renderSelectedNode(id,true)
                }
                // console.log(controller.multiSelectNodes)
            });
        }

    }
//多选移动的拖拽操作
    getOriPath(id,straight){
        let path = d3.select("#path-"+id)
        if (straight){
            return {
                x: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[0]),
                y: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[1]),
                parentX: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[2]),
                parentY: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[3])
            }
        }else {
            return {
                x: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[0]),
                    y: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[2]),
                parentX: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[5]),
                parentY: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[6])
            }
        }

    }
    multiDragStart(controller){
        this.x_start = d3.event.x;
        this.y_start = d3.event.y;
        let selectNodes = controller.multiSelectNodes;
        this.foreLinks = Array.of()
        this.paraLinks = Array.of()
        this.childLinks = Array.of()
        let paraLinkId = new Set()
        let foreLinkId = new Set()
        let childLinkId = new Set();
        let links = new Map();
        let model = controller.graphModel

        selectNodes.sort()

        for (let i=0;i<selectNodes.length;i++)
        {
            let id = selectNodes[i]
            let node = model.findNodeById(id)
            if (node.leadTo){
                id = parseInt(id)
                let foreLink = {
                    parent: node.leadTo,
                    child: id
                };
                links.set(id,foreLink)
                if (!childLinkId.has(id)){
                    console.log(childLinkId)
                    console.log(id+' not in child')
                    foreLinkId.add(id)
                }else
                {
                    console.log(id+' in child , delete from child')
                    childLinkId.delete(id)
                    paraLinkId.add(id)
                }
            }
            let childs = model.findDirectChildrenId(id)
            if (childs)
            {

                console.log(childs)
                for (let child of childs)
                {
                    let childLink = {
                        parent: id ,
                        child : child
                    }
                    links.set(child,childLink)
                    child = parseInt(child)
                    if (!foreLinkId.has(child)){
                        console.log(foreLinkId)
                        console.log(child+' not in fore')
                        childLinkId.add(child)
                    } else
                    {
                        console.log(child+' in fore ,delete from fore')
                        foreLinkId.delete(child)
                        paraLinkId.add(child)
                    }
                }
            }else {
                continue
            }
        }


        for (let [key,value] of links.entries()){
            if (foreLinkId.has(key))
            {
                this.foreLinks.push(value)
            }else if(childLinkId.has(key))
            {
                this.childLinks.push(value)
            }else
            {
                this.paraLinks.push(value)
            }
        }
        //
        // console.log('paths')
        // console.log('fore'+this.foreLinks)
        // console.log('para'+this.paraLinks)
        // console.log('child'+this.childLinks)
    }
    multiDrag(controller,deltaX,deltaY){
        LogicPainter.moveNodes(controller.multiSelectNodes,this.foreLinks,this.childLinks,this.paraLinks,deltaX,deltaY,controller.isStraight)
    }

    dragStart(controller, node) {

        this.x_start = d3.event.x;
        this.y_start = d3.event.y;
        this.x_mul = d3.event.x
        this.y_mul = d3.event.y
        if(controller.multiSelectNodes.indexOf(parseInt(node.id))<0)
        {
            controller.clearMultiSelectNode()
        }
        if(controller.multiSelectNodes.length>0)
        {
            this.multiDragStart(controller)
            return
        }
        if (node.id>1)
        {
            let forepath_temp = {
                parent: node.parent.id,
                child: node.id
            }
            this.foreLinks = Array.of(forepath_temp)
        }
        this.oriChildPaths = Array.of();
        const path = d3.select(`#path-${node.id}`);
        if (node.parent) {
            if (controller.isStraight) {
                this.oriPath = {
                    x: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[0]),
                    y: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[1]),
                    parentX: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[2]),
                    parentY: parseFloat(path.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[3])
                };
            } else {
                this.oriPath = {
                    x: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[0]),
                    y: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[1]),
                    parentX: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[6]),
                    parentY: parseFloat(path.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[7])
                };
            }
        }
        if (node.children) {
            for (let childNode of node.children) {
                const childPath = d3.select(`#path-${childNode.id}`);
                if (controller.isStraight) {
                    this.oriChildPaths.push({
                        x: parseFloat(childPath.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[0]),
                        y: parseFloat(childPath.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[1]),
                        parentX: parseFloat(childPath.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[2]),
                        parentY: parseFloat(childPath.attr("d").replace(/[ML]/g, '').replace(/ /, ',').split(',')[3])
                    });
                } else {
                    this.oriChildPaths.push({
                        x: parseFloat(childPath.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[0]),
                        y: parseFloat(childPath.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[1]),
                        parentX: parseFloat(childPath.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[6]),
                        parentY: parseFloat(childPath.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(',')[7])
                    });
                    console.log(childPath.attr("d").replace(/[MC]/g, '').replace(/ /g, ',').split(','))
                }
            }
        }
    }

    drag(controller, node) {
        let mousePos = d3.mouse(document.getElementsByTagName('svg')[0])

        let x = mousePos[0]
        let y= mousePos[1]
        const deltaX = d3.event.x-this.x_mul
        const deltaY = d3.event.y-this.y_mul
        this.x_mul = d3.event.x
        this.y_mul = d3.event.y
        this.x_change = d3.event.x - this.x_start;
        this.y_change = d3.event.y - this.y_start;
        // console.log(x.toFixed(2)+','+y.toFixed(2))
        let coverRec = LogicPainter.findElementByPos(x,y)

        if (controller.coverChoose)
        {
            controller.switchCoverChoose(-1)
        }
        for (let id of coverRec){
            if (node.id==id||controller.multiSelectNodes.indexOf(id)>0)//确定所选的节点不在多选单元或者是单选内容中
            {
                continue
            }else
            {
                //渲染选中的停留节点，节点id：id
                controller.switchCoverChoose(id)

            }
        }
        if (controller.multiSelectNodes.length>0) {
            this.multiDrag(controller, deltaX,deltaY)
            return
        }
        LogicPainter.moveNode(controller, node, deltaX, deltaY, this.oriPath, this.oriChildPaths);
        //console.log('move node'+d3.event.x,+' '+d3.event.y);
    }

    dragEnd(controller, node) {
        const deltaX = d3.event.x-this.x_mul
        const deltaY = d3.event.y-this.y_mul
        this.x_mul = d3.event.x
        this.y_mul = d3.event.y
        this.x_change = d3.event.x - this.x_start;
        this.y_change = d3.event.y - this.y_start;
        let mousePos = d3.mouse(document.getElementsByTagName('svg')[0])
        let coverRec = LogicPainter.findElementByPos(mousePos[0],mousePos[1])
        if (controller.coverChoose)
        {
            controller.switchCoverChoose(-1)
        }
        for (let id of coverRec){
            if (node.id==id||controller.multiSelectNodes.indexOf(id)>0)//确定所选的节点不在多选单元或者是单选内容中
            {
                continue
            }else
            {
                //将所属关系转移到选定节点，节点id：id
                controller.switchCoverChoose(id)
                if(this.foreLinks&&this.foreLinks.length>0)
                {
                    controller.logOperation(new RemoveAndEditOperation(controller.graphModel,controller))
                    controller.graphModel.changeLeadTo(this.foreLinks,id)
                }
                controller.redraw()
                return

            }
        }
        if (controller.multiSelectNodes.length>0) {
            this.multiDrag(controller, deltaX,deltaY)
            return
        }
        LogicPainter.moveNode(controller, node, deltaX, deltaY, this.oriPath, this.oriChildPaths);
        node.x += this.y_change;
        node.y += this.x_change;
    }
}
