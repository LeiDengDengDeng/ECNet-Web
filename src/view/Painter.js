/**
 * Created by aswasn on 2017/2/23.
 */

import * as d3 from 'd3'
import {HeaderDrag, BodyDrag, ArrowDrag, JointDrag, Click} from './Motion'
import {GraphVal, ElementType} from '../assets/constants'

export default class Painter {

    // 在图像中删除元素
    static eraseElement(id) {
        d3.select("svg *[id='" + id + "'").remove();
    }

    static setSelect(id,select){

        $('#ele-'+id).addClass(select ? 'selected' : 'not-selected').removeClass(select ? 'not-selected' : 'selected')
    }
    // 改变单个元素的颜色
    static setStroke(elementModel, color) {
        d3.selectAll("svg g[id='" + "ele-" + elementModel.getId() + "'] *").attr("stroke", color);
        d3.selectAll("svg g[id='" + elementModel.getId() + "'] text").attr("fill", color);
    }

    static drawElement(elementModel, controller) {
        const me = this;
        const graphModel = controller.graphModel;
        switch (elementModel.data.type) {
            case ElementType.BODY: {
                me.drawBody(d3.select('svg').selectAll(".ecm-body").data(graphModel.getBodyArray()).enter(), graphModel, controller);
            }
                break;
            case ElementType.HEADER: {
                me.drawHeader(d3.select('svg').selectAll(".ecm-header").data(graphModel.getHeaderArray()).enter(), graphModel, controller);
            }
                break;
            case ElementType.ARROW: {
                me.drawArrow(d3.select('svg').selectAll(".ecm-arrow").data(graphModel.getArrowArray()).enter(), graphModel, controller);
            }
                break;
            case ElementType.JOINT: {
                me.drawJoint(d3.select('svg').selectAll(".ecm-joint").data(graphModel.getJointArray()).enter(), graphModel, controller);
            }
                break;
        }
    }
    static drawBody(selection, graphModel, controller) {
        let bodyDrag = new BodyDrag();
        let group = selection.append("g").attr("id", d => d.data.id).attr("class", "ecm-body ecm-element");
        group.append("g").attr("id", d => ("ele-" + d.data.id)).append("rect").attr("x", d => d.data.x).attr("y", d => d.data.y)
            .attr("width", GraphVal.RECT_WIDTH).attr("height", GraphVal.RECT_HEIGHT)
            .attr("stroke-width", "2").attr("stroke", "black").attr("fill", "white").call(d3.drag()
            .on("start", d => bodyDrag.dragStart(d, controller))
            .on("drag", d => bodyDrag.drag(d, controller))
            .on("end", d => bodyDrag.dragEnd(d, graphModel, controller))
        ).on('click', d => Click.showDetail(d, graphModel, controller));

        // 添加文字
        let text = group.append("text")

        text.text(d => d.data.name).attr('id',d=>('text-'+d.data.id))
            .attr('data-mid-x',d=>(document.getElementById("ele-" + d.data.id).getBBox().x+GraphVal.RECT_WIDTH/2))
            .attr("x", d => (document.getElementById("ele-" + d.data.id).getBBox().x + document.getElementById("ele-" + d.data.id).getBBox().width * GraphVal.POSITION_OFFSET_X - document.getElementById('text-'+d.data.id).getBBox().width/2))
            .attr("y", d => (document.getElementById("ele-" + d.data.id).getBBox().y + document.getElementById("ele-" + d.data.id).getBBox().height * GraphVal.POSITION_OFFSET_Y))
            .attr("fill", "black").attr("fill-opacity", 0.5).style("user-select", "none").style("font-size", GraphVal.FONT_SIZE)

    }

    static drawHeader(selection, graphModel, controller) {
        let headerDrag = new HeaderDrag();
        let group = selection.append("g").attr("id", d => d.data.id).attr("class", "ecm-header ecm-element");
        let element = group.append("g").attr("id", d => ("ele-" + d.data.id));
        element.append("line").attr("x1", d => d.data.x1).attr("y1", d => d.data.y1).attr("x2", d => d.data.x2).attr("y2", d => d.data.y2).attr("stroke-width", 2).attr("stroke", "black");
        element.append("circle").attr("cx", d => d.data.x2).attr("cy", d => d.data.y2).attr("r", GraphVal.CIRCLE_R).attr("fill", "white").attr("stroke-width", "2");
        group.call(d3.drag()
            .on("start", d => headerDrag.dragStart(d, controller))
            .on("drag", d => headerDrag.drag(d, controller))
            .on("end", d => headerDrag.dragEnd(d, graphModel, controller))
        ).on('click', d => Click.showDetail(d, graphModel, controller));

        // 添加文字
        group.append("text").attr('id',d=>('text-'+d.data.id))
            .attr("x", d => (d.data.x2 ))
            .attr("y", d => (d.data.y2 + GraphVal.CIRCLE_R * GraphVal.POSITION_OFFSET_Y))
            .attr('data-mid-x',d=>d.data.x2)
            .attr("fill", "black").attr("fill-opacity", GraphVal.TEXT_OPACITY).style("user-select", "none").style("font-size",  GraphVal.FONT_SIZE)
            .text(d => d.data.name)
    }

    static drawArrow(selection, graphModel, controller) {
        let arrowDrag = new ArrowDrag();
        let group = selection.append("g").attr("id", d => d.data.id).attr("class", "ecm-arrow ecm-element");
        let element = group.append("g").attr("id", d => ("ele-" + d.data.id));
        element.append("line").attr("x1", d => d.data.x1).attr("y1", d => d.data.y1).attr("x2", d => d.data.x2).attr("y2", d => d.data.y2)
            .attr("stroke-width", 2).attr("stroke", "black")
            .attr("marker-end", function (d) {
                return "url(#arrow)";
            }).call(d3.drag()
            .on("start", d => arrowDrag.dragStart(d, controller))
            .on("drag", d => arrowDrag.drag(d, controller))
            .on("end", d => arrowDrag.dragEnd(d, graphModel, controller))
        ).on('click', d => Click.showDetail(d, graphModel, controller));

        // 添加文字
        group.append("text").attr('id',d=>('text-'+d.data.id))
            .attr('data-mid-x',d=>(document.getElementById("ele-" + d.data.id).getBBox().x + document.getElementById("ele-" + d.data.id).getBBox().width *GraphVal.POSITION_OFFSET_X))
            .attr("x", d => (document.getElementById("ele-" + d.data.id).getBBox().x + document.getElementById("ele-" + d.data.id).getBBox().width *GraphVal.POSITION_OFFSET_X))
            .attr("y", d => (document.getElementById("ele-" + d.data.id).getBBox().y + document.getElementById("ele-" + d.data.id).getBBox().height * GraphVal.POSITION_OFFSET_Y))
            .attr("fill", "black").attr("fill-opacity", GraphVal.TEXT_OPACITY).style("user-select", "none").style("font-size", GraphVal.FONT_SIZE)

            .text(d => d.data.name)
    }

    static drawJoint(selection, graphModel, controller) {
        let jointDrag = new JointDrag();
        let group = selection.append("g").attr("id", d => d.data.id).attr("class", "ecm-joint ecm-element");
        group.append("g").attr("id", d => ("ele-" + d.data.id)).append("rect").attr("x", d => d.data.x).attr("y", d => d.data.y)
            .attr("width", GraphVal.SQUARE_SIDE).attr("height", GraphVal.SQUARE_SIDE)
            .attr("stroke-width", "2").attr("fill", "white").call(d3.drag()
            .on("start", d => jointDrag.dragStart(d, controller))
            .on("drag", d => jointDrag.drag(d, controller))
            .on("end", d => jointDrag.dragEnd(d, graphModel, controller))
        ).on('click', d => Click.showDetail(d, graphModel, controller));
        function textW (id) {
            return document.getElementById('text-'+id).getBBox().width/2


        }
        // 添加文字
        let text = group.append("text").attr('id',d=>('text-'+d.data.id)).attr("fill", "black")
            .attr("fill-opacity", GraphVal.TEXT_OPACITY).style("user-select", "none").style("font-size", GraphVal.FONT_SIZE)
            .attr('data-mid-x',d=>(document.getElementById("ele-" + d.data.id).getBBox().x+GraphVal.SQUARE_SIDE/2))

        text.text(d => d.data.name);

        text.attr("x", d => (document.getElementById("ele-" + d.data.id).getBBox().x + document.getElementById("ele-" + d.data.id).getBBox().width * GraphVal.POSITION_OFFSET_X - textW(d.data.id)))
            .attr("y", d => (document.getElementById("ele-" + d.data.id).getBBox().y + document.getElementById("ele-" + d.data.id).getBBox().height* GraphVal.POSITION_OFFSET_Y))

    }

    static moveElementByModel(elementModel) {
        switch (elementModel.data.type) {
            case ElementType.BODY:
                Painter._moveBodyByModel(elementModel);
                break;
            case ElementType.HEADER:
                Painter._moveHeaderByModel(elementModel);
                break;
            case ElementType.ARROW:
                Painter._moveArrowByModel(elementModel);
                break;
            case ElementType.JOINT:
                Painter._moveJointByModel(elementModel);
                break;
        }
    }

    // 根据Model修改链体位置
    static _moveBodyByModel(elementModel) {
        let id = elementModel.getId();
        d3.select("svg g[id='" + "ele-" + id + "'] rect").attr("x", elementModel.data.x).attr("y", elementModel.data.y);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr("x", bBox.x + bBox.width * GraphVal.POSITION_OFFSET_X - document.getElementById('text-'+id).getBBox().width/2)
            .attr("y", bBox.y + bBox.height * GraphVal.POSITION_OFFSET_Y);
    }

    // 根据Model修改链头位置
    static _moveHeaderByModel(elementModel) {
        let id = elementModel.getId();
        let group = d3.select("svg g[id='" + "ele-" + id + "']");
        group.select("circle").attr("cx", elementModel.data.x2).attr("cy", elementModel.data.y2);
        group.select("line").attr("x2", elementModel.data.x2).attr("y2", elementModel.data.y2)
            .attr("x1", elementModel.data.x1).attr("y1", elementModel.data.y1);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr("x", elementModel.data.x2 -document.getElementById('text-'+id).getBBox().width/2)
            .attr("y", elementModel.data.y2 + GraphVal.CIRCLE_R * GraphVal.POSITION_OFFSET_Y);
    }

    // 根据Model修改箭头位置
    static _moveArrowByModel(elementModel) {
        let id = elementModel.getId();
        d3.select("svg g[id='" + "ele-" + id + "']")
            .select("line").attr("x2", elementModel.data.x2).attr("y2", elementModel.data.y2)
            .attr("x1", elementModel.data.x1).attr("y1", elementModel.data.y1);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr("x", bBox.x + bBox.width / 4)
            .attr("y", bBox.y + bBox.height * 2 / 3);
    }

    // 根据Model修改连接点位置
    static _moveJointByModel(elementModel) {
        let id = elementModel.getId();
        d3.select("svg g[id='" + "ele-" + id + "'] rect").attr("x", elementModel.data.x).attr("y", elementModel.data.y);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr("x", bBox.x + bBox.width *GraphVal.POSITION_OFFSET_X- document.getElementById('text-'+id).getBBox().width/2)
            .attr("y", bBox.y + bBox.height * GraphVal.POSITION_OFFSET_Y);
    }

    // 根据坐标修改链体位置
    static moveBodyByCoordinate(id, x, y) {
        d3.select("svg g[id='" + "ele-" + id + "'] rect").attr("x", x).attr("y", y);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr('data-mid-x',bBox.x + bBox.width * GraphVal.POSITION_OFFSET_X)

            .attr("x", bBox.x + bBox.width * GraphVal.POSITION_OFFSET_X -document.getElementById('text-'+id).getBBox().width/2 )
            .attr("y", bBox.y + bBox.height * GraphVal.POSITION_OFFSET_Y);
    }

    // 根据坐标修改链头位置
    static moveHeaderByCoordinate(id, x1, y1, x2, y2) {
        let group = d3.select("svg g[id='" + "ele-" + id + "']");
        group.select("circle").attr("cx", x2).attr("cy", y2);
        group.select("line").attr("x2", x2).attr("y2", y2)
            .attr("x1", x1).attr("y1", y1);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr('data-mid-x',x2)
            .attr("x", x2 - document.getElementById('text-'+id).getBBox().width/2)
            .attr("y", y2 + GraphVal.CIRCLE_R * GraphVal.POSITION_OFFSET_Y);
    }

    // 根据坐标修改箭头位置
    static moveArrowByCoordinate(id, x1, y1, x2, y2) {
        d3.select("svg g[id='" + "ele-" + id + "']")
            .select("line").attr("x2", x2).attr("y2", y2)
            .attr("x1", x1).attr("y1", y1);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr('data-mid-x',bBox.x + bBox.width/4)
            .attr("x", bBox.x + bBox.width / 4)
            .attr("y", bBox.y + bBox.height * 2 / 3);

    }

    // 根据坐标修改连接点位置
    static moveJointByCoordinate(id, x, y) {
        d3.select("svg g[id='" + "ele-" + id + "'] rect").attr("x", x).attr("y", y);

        // 修改文字位置
        let bBox = document.getElementById("ele-" + id).getBBox();
        d3.select("svg g[id='" + id + "'] text")
            .attr("x", bBox.x + bBox.width * GraphVal.POSITION_OFFSET_X - document.getElementById('text-'+id).getBBox().width/2)
            .attr("y", bBox.y + bBox.height * GraphVal.POSITION_OFFSET_Y)
            .attr('data-mid-x',bBox.x + bBox.width * GraphVal.POSITION_OFFSET_X);

    }

    // ---------------------------------多选相关---------------------------------
    // 绘制多选框
    static drawMultiSelectArea(x, y) {
        d3.select("svg").append("rect").attr("id", "multi-select-area").attr("class", "multi-select-area")
            .attr("stroke-width", GraphVal.MULTI_SELECT_AREA_STROKE_WIDTH)
            .attr("stroke", GraphVal.MULTI_SELECT_AREA_COLOR)
            .attr("fill", GraphVal.MULTI_SELECT_AREA_COLOR)
            .attr("fill-opacity", GraphVal.MULTI_SELECT_AREA_OPACITY)
            .attr("x", x).attr("y", y).attr("width", 0).attr("height", 0)
            .attr('ax',x).attr('ay',y)
    }

    // 拖动时扩张选框边界
    static expandMultiSelectArea(x, y) {
        let area = d3.select("#multi-select-area");
        let old_x = area.attr("ax"), old_y = area.attr("ay");
        let width = x - old_x, height = y - old_y;

        if (width < 0 ) {
            width = width*-1
            area.attr('x',x)
        }else {
            area.attr('x',area.attr('ax'))
        }
        if (height < 0 ) {
            height = height*-1
            area.attr('y',y)
        }else {
            area.attr('y',area.attr('ay'))
        }
        area.attr("width", width);
        area.attr("height", height);
    }

    // 给MultiSelectModel中的元素渲染指定的颜色
    static markMultiSelectedElements(model, select) {
        let me = this;
        for (let ele of model.getBodyArray()) {
            me.setSelect(ele.getId(),select)
        }
        for (let ele of model.getHeaderArray()) {


            me.setSelect(ele.getId(),select)
        }
        for (let ele of model.getJointArray()) {

            me.setSelect(ele.getId(),select)
        }
        for (let ele of model.getArrowArray()) {

            me.setSelect(ele.getId(),select)
        }
    }

    // -----------------------------end of 多选相关------------------------------

    static refreshText(id, text) {
        d3.select("svg g[id='" + id + "'] text").text(text);
        let xp = $('#text-'+id).data('mid-x')

        let text_s = d3.select("svg g[id='" + id + "'] text")
        text_s.attr("x", xp - document.getElementById('text-'+id).getBBox().width/2)
    }

}
