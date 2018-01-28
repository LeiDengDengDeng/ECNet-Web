/**
 * Created by apple on 2017/2/26.
 */
import {Click} from '../view/Motion'
import HeaderModel from '../model/HeaderModel'
import ArrowModel from '../model/ArrowModel'
import JointModel from '../model/JointModel'
import BodyModel from '../model/BodyModel'
import {ElementType} from '../assets/constants'
import Painter from '../view/Painter'
import * as d3 from 'd3'
const XLSX = require('xlsx');
const FileSaver = require('file-saver');
export default class Table {

    constructor(controller, graphModel) {
        this.controller = controller;
        this.graphModel = graphModel;
    }

    setGraphModel(graphModel) {
        this.graphModel = graphModel;
    }

    getGraphModel() {
        return this.graphModel;
    }

    _processEvidenceTable(){
        let $evidenceTable = $('#evidence-table').clone();
        $evidenceTable.find("tr:eq(0) td:eq(9)").remove();
        $evidenceTable.find("tr:eq(0)").before("<tr><td colspan=9>证据清单</td></tr>");
        $evidenceTable.find(".table-operations").remove();
        return $evidenceTable[0];
    }

    _processFactTable(){
        let $factTable = $('#fact-table').clone();
        $factTable.find("tr:eq(0) td:eq(6)").remove();
        $factTable.find("tr:eq(0)").before("<tr><td colspan=6>事实清单</td></tr>");
        $factTable.find(".table-operations").remove();
        $factTable.find(".no-export").remove();
        $factTable.find("[rowspan]").each(function(){
            $(this).attr("rowspan",$(this).attr("rowspan")-1);
        });
        return $factTable[0];
    }

    _generateArray(table) {
        var out = [];
        var rows = table.getElementsByTagName('tr');
        var ranges = [];

        for (var R = 0; R < rows.length; ++R) {
            var outRow = [];
            var row = rows[R];
            var columns = row.getElementsByTagName('td');
            for (var C = 0; C < columns.length; ++C) {//length -1: hacked code, don't export operations
                var cell = columns[C];
                var colspan = parseInt(cell.getAttribute('colspan'));
                var rowspan = parseInt(cell.getAttribute('rowspan'));
                var cellValue = cell.innerText;

                var option = $(cell).find("option:selected");
                if(option.length>0){
                    cellValue = option.text();
                }

                if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

                //Skip ranges
                ranges.forEach(function (range) {
                    if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
                        for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
                    }
                });

                //Handle Row Span
                if (rowspan || colspan) {
                    rowspan = rowspan || 1;
                    colspan = colspan || 1;

                    ranges.push({s: {r: R, c: outRow.length}, e: {r: R + rowspan - 1, c: outRow.length + colspan - 1}});
                }
                ;

                //Handle Value
                outRow.push(cellValue !== "" ? cellValue : null);

                //Handle Colspan
                if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
            }
            out.push(outRow);

        }
        return [out, ranges];
    };

    _arrayToSheet(data) {
        function datenum(v/*:Date*/, date1904/*:?boolean*/)/*:number*/ {
            var epoch = v.getTime();
            if(date1904) epoch += 1462*24*60*60*1000;
            return (epoch + 2209161600000) / (24 * 60 * 60 * 1000);
        }
        var ws = {};
        var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
        for(var R = 0; R != data.length; ++R) {
            for(var C = 0; C != data[R].length; ++C) {
                if(range.s.r > R) range.s.r = R;
                if(range.s.c > C) range.s.c = C;
                if(range.e.r < R) range.e.r = R;
                if(range.e.c < C) range.e.c = C;
                var cell = {v: data[R][C]};
                if(cell.v == null) continue;
                var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

                if(typeof cell.v === 'number') cell.t = 'n';
                else if(typeof cell.v === 'boolean') cell.t = 'b';
                else if(cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                }
                else cell.t = 's';

                ws[cell_ref] = cell;
            }
        }
        if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    }

    exportTableToExcel(){
        var factTable = this._processFactTable();
        var factArray = this._generateArray(factTable);

        var evidenceTable = this._processEvidenceTable();
        var evidenceArray = this._generateArray(evidenceTable);

        /* original data */
        var factData = factArray[0];
        var factRanges = factArray[1];
        var factWsName = "事实清单";
        var evidenceData = evidenceArray[0];
        var evidenceRanges = evidenceArray[1];
        var evidenceWsName = "证据清单";
        function Workbook() {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }
        var wb = new Workbook();
        var factWs = this._arrayToSheet(factData);
        var evidenceWs = this._arrayToSheet(evidenceData);

        /* add ranges to worksheet */
        factWs['!merges'] = factRanges;
        evidenceWs['!merges'] = evidenceRanges;

        /* add worksheet to workbook */
        wb.SheetNames.push(evidenceWsName);
        wb.SheetNames.push(factWsName);
        wb.Sheets[factWsName] = factWs;
        wb.Sheets[evidenceWsName] = evidenceWs;
        var type = "xlsx";
        var fn = "zgw.xlsx";
        var wbout = XLSX.write(wb, {bookType: type, bookSST: false, type: 'binary'});
        var fname = fn || 'test.' + type;
        function s2ab(s) {
            if (typeof ArrayBuffer !== 'undefined') {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            } else {
                var buf = new Array(s.length);
                for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
        }
        try {
            FileSaver.saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), fname);
        } catch (e) {
            console.log(e, wbout);
        }
        return wbout;
    }

    initEvidenceList() {
        let that = this;
        $("#evidence-table tr:gt(0)").remove();
        let newRow = "";
        let bodyArray = this.graphModel.getBodyArray();
        for (let i = 0; i < bodyArray.length; i++) {
            let body = bodyArray[i];
            let length = body.getHeaderArray().length;
            let rowSpan = 1;
            let content = "";
            let keySentence = "";
            let operations = "<button class='header-add-btn btn btn-success btn-xs'>新增</button>";
            if (length != 0) {
                rowSpan = length;
                content = body.getHeaderArray()[0].getContent();
                keySentence = body.getHeaderArray()[0].getKeySentence();
                operations = "<button class='header-delete-btn btn btn-danger btn-xs'>删除</button>" + operations;
            }
            let headerRow = "<td attribute='header-content'>" + content + "</td>" +
                "<td attribute='header-keySentence'>" + keySentence + "</td>" +
                "<td class='table-operations'>" + operations + "</td>";
            newRow += "<tr body=" + i + " header=0>" +
                "<td attribute='id' rowspan=" + rowSpan + ">" + body.data.id + "</td>" +
                "<td attribute='name' rowspan=" + rowSpan + ">" + body.getName() + "</td>" +
                "<td attribute='content' rowspan=" + rowSpan + ">" + body.getContent() + "</td>" +
                "<td attribute='evidenceType' rowspan=" + rowSpan + ">" + body.getEvidenceType() + "</td>" +
                "<td attribute='committer' rowspan=" + rowSpan + ">" + body.getCommitter() + "</td>" +
                "<td attribute='evidenceReason' rowspan=" + rowSpan + ">" + body.getEvidenceReason() + "</td>" +
                "<td attribute='evidenceConclusion' rowspan=" + rowSpan + ">" + body.getEvidenceConclusion() + "</td>" + headerRow +
                "</tr>";
            for (let j = 1; j < rowSpan; j++) {
                newRow += "<tr body=" + i + " header=" + j + " >" +
                    "<td attribute='header-content'>" + body.getHeaderArray()[j].getContent() + "</td>" +
                    "<td attribute='header-keySentence'>" + body.getHeaderArray()[j].getKeySentence() + "</td>" +
                    "<td class='table-operations'>" + "<button class='header-delete-btn btn btn-danger btn-xs'>删除</button>" + "</td>" +
                    "</tr>";
            }
        }
        $("#evidence-table tr:eq(0)").after(newRow);
        $('#evidence-table').editableTableWidget();
        $('#evidence-table tr:eq(0) td').removeAttr("tabindex");
        $("#evidence-table td[attribute='id']").removeAttr("tabindex");
        $('#evidence-table .table-operations').removeAttr("tabindex");
        $("#evidence-table .header-delete-btn").on("click", {table: this}, this._onHeaderDeleteBtnClicked);
        $("#evidence-table .header-add-btn").on("click", {table: this}, this._onHeaderAddBtnClicked);
        $('#evidence-table td').on('change', {table: this}, this._onEvidenceTableChanged);
    }

    _onHeaderDeleteBtnClicked(event) {
        let table = event.data.table;
        let bodyIndex = parseInt($(this).parent().parent().attr("body"), 10);
        let headerIndex = parseInt($(this).parent().parent().attr("header"), 10);
        let header = table.graphModel.getBodyArray()[bodyIndex].getHeaderArray()[headerIndex];
        table.graphModel.deleteElement(header);
        table.initEvidenceList();
        table.initFactList();
        Painter.eraseElement(header.data.id);
    }

    _onHeaderAddBtnClicked(event) {
        let table = event.data.table;
        let bodyIndex = parseInt($(this).parent().parent().attr("body"), 10);
        let body = table.graphModel.getBodyArray()[bodyIndex];
        //默认新增链头悬在链体正上方
        let header = new HeaderModel(body.data.x, body.data.y, body.data.x, body.data.y - 100,
            table.graphModel.fetchNextId(), "", "", "");
        table.graphModel.insertElement(header);
        table.initEvidenceList();
        table.initFactList();
        Painter.drawHeader(d3.select("svg").selectAll(".ecm-header").data(table.graphModel.getHeaderArray()).enter(),
            table.graphModel, table.controller);
        Click.showDetail(header);
    }

    _onEvidenceTableChanged(event, newValue) {
        let table = event.data.table;
        let attribute = $(this).attr("attribute");
        let bodyIndex = parseInt($(this).parent().attr("body"), 10);
        let headerIndex = parseInt($(this).parent().attr("header"), 10);
        let bodyArray = table.graphModel.getBodyArray();
        if (attribute.lastIndexOf("header") === -1) {
            bodyArray[bodyIndex].data[attribute] = newValue;
            Click.showDetail(bodyArray[bodyIndex]);
        } else {
            let headerArray = bodyArray[bodyIndex].getHeaderArray();
            if (headerIndex >= headerArray.length) {
                let body = bodyArray[bodyIndex];
                //默认新增链头悬在链体正上方
                let header = new HeaderModel(body.data.x, body.data.y, body.data.x, body.data.y - 100,
                    table.graphModel.fetchNextId(), "", "", "");
                table.graphModel.insertElement(header);
                Painter.drawHeader(d3.select("svg").selectAll(".ecm-header").data(table.graphModel.getHeaderArray()).enter(),
                    table.graphModel, table.controller);
            }
            attribute = attribute.replace("header-", "");
            headerArray[headerIndex].data[attribute] = newValue;
            Click.showDetail(headerArray[headerIndex]);
        }
    }

    initFactList() {
        let that = this;
        $("#fact-table tr:gt(0)").remove();
        let newRow = "";
        let jointArray = this.graphModel.getJointArray();
        let headerArray = this.graphModel.getHeaderArray();

        //初始化选项
        let options = "<option value='-1'>无</option>";
        for (let j = 0; j < headerArray.length; j++) {
            options += "<option value='" + headerArray[j].data.id + "'>" + headerArray[j].getContent() + "</option>";
        }
        let selectBegin = "<select class='arrow-selector form-control'>";
        let selectEnd = "</select>";

        for (let i = 0; i < jointArray.length; i++) {
            let joint = jointArray[i];
            let length = joint.getArrowArray().length;
            let content = selectBegin + options + selectEnd;
            let bodyId = "";
            let keySentence = "";
            let operations = "";
            let startIndex = 0;
            while (startIndex < length && !joint.getArrowArray()[startIndex].getHeader()) {
                startIndex++;
            }
            let rowSpan = 1;
            //处理空箭头问题
            for (let j = startIndex; j < length; j++) {
                if (joint.getArrowArray()[j].getHeader()) {
                    rowSpan++;
                }
            }
            if (startIndex < length) {
                let original = "<option value='" + joint.getArrowArray()[startIndex].getHeader().data.id + "'>" +
                    joint.getArrowArray()[startIndex].getHeader().getContent() + "</option>";
                let replacement = "<option value='" + joint.getArrowArray()[startIndex].getHeader().data.id + "' selected='selected'>" +
                    joint.getArrowArray()[startIndex].getHeader().getContent() + "</option>";
                content = selectBegin + options.replace(original, replacement) + selectEnd;
                if (!!joint.getArrowArray()[startIndex].getHeader().getBody()) {//处理链头没有连链体问题
                    bodyId = joint.getArrowArray()[startIndex].getHeader().getBody().data.id;
                }
                keySentence = joint.getArrowArray()[startIndex].getHeader().getKeySentence();
                operations = "<button class='arrow-delete-btn btn btn-danger btn-xs'>删除</button>";
            }
            let arrowRow = "<td class='unchangable-td'>" + content + "</td>" +
                "<td class='unchangable-td'>" + bodyId + "</td>" +
                "<td class='unchangable-td'>" + keySentence + "</td>" +
                "<td class='table-operations'>" + operations + "</td>";
            newRow += "<tr joint=" + i + " arrow=" + 0 + ">" +
                "<td class='unchangable-td' rowspan=" + rowSpan + ">" + joint.data.id + "</td>" +
                "<td attribute='name' rowspan=" + rowSpan + ">" + joint.getName() + "</td>" +
                "<td attribute='content' rowspan=" + rowSpan + ">" + joint.getContent() + "</td>" + arrowRow +
                "</tr>";

            for (let j = startIndex + 1; j < length; j++) {
                if (!joint.getArrowArray()[j].getHeader()) {
                    continue;
                }
                let original = "<option value='" + joint.getArrowArray()[j].getHeader().data.id + "'>" +
                    joint.getArrowArray()[j].getHeader().getContent() + "</option>";
                let replacement = "<option value='" + joint.getArrowArray()[j].getHeader().data.id + "' selected='selected'>" +
                    joint.getArrowArray()[j].getHeader().getContent() + "</option>";
                let bodyId = "";
                if (!!joint.getArrowArray()[j].getHeader().getBody()) {
                    bodyId = joint.getArrowArray()[j].getHeader().getBody().data.id;//处理链头没有连链体问题
                }
                newRow += "<tr joint=" + i + " arrow=" + j + ">" +
                    "<td class='unchangable-td'>" + selectBegin + options.replace(original, replacement) + selectEnd + "</td>" +
                    "<td class='unchangable-td'>" + bodyId + "</td>" +
                    "<td class='unchangable-td'>" + joint.getArrowArray()[j].getHeader().getKeySentence() + "</td>" +
                    "<td class='table-operations'>" + "<button class='arrow-delete-btn btn btn-danger btn-xs'>删除</button>" + "</td>" +
                    "</tr>";
            }
            if (startIndex < length) {
                //新增空行以完成新增箭头工作
                newRow += "<tr class='no-export' joint=" + i + " arrow=" + length + ">" +
                    "<td class='unchangable-td'>" + selectBegin + options + selectEnd + "</td>" +
                    "<td class='unchangable-td'></td>" +
                    "<td class='unchangable-td'></td>" +
                    "<td class='table-operations'></td>" +
                    "</tr>";
            }
        }
        $("#fact-table tr:eq(0)").after(newRow);
        $('#fact-table').editableTableWidget();
        $('#fact-table tr:eq(0) td').removeAttr("tabindex");
        $("#fact-table td[attribute='id']").removeAttr("tabindex");
        $('#fact-table .unchangable-td').removeAttr("tabindex");
        $('#fact-table .table-operations').removeAttr("tabindex");

        $("#fact-table .arrow-delete-btn").on("click", {table: this}, this._onArrowDeleteBtnClicked);
        $('#fact-table td').on('change', {table: this}, this._onFactTableChanged);
        $('#fact-table .arrow-selector').on('change', {table: this}, this._onArrowSelectorChanged);
    }

    _onArrowDeleteBtnClicked(event) {
        let table = event.data.table;
        let jointIndex = parseInt($(this).parent().parent().attr("joint"), 10);
        let arrowIndex = parseInt($(this).parent().parent().attr("arrow"), 10);
        let arrow = table.graphModel.getJointArray()[jointIndex].getArrowArray()[arrowIndex];
        table.graphModel.deleteElement(arrow);
        table.initFactList();
        Painter.eraseElement(arrow.data.id);
    }

    _onFactTableChanged(event, newValue) {
        let table = event.data.table;
        let jointIndex = parseInt($(this).parent().attr("joint"), 10);
        let joint = table.graphModel.getJointArray()[jointIndex];
        let attribute = $(this).attr("attribute");
        joint.data[attribute] = newValue;
        Click.showDetail(joint);
    }

    _onArrowSelectorChanged(event) {
        event.stopPropagation();
        let table = event.data.table;
        let graphModel = table.graphModel;
        let jointIndex = parseInt($(this).parent().parent().attr("joint"), 10);
        let arrowIndex = parseInt($(this).parent().parent().attr("arrow"), 10);
        let joint = graphModel.getJointArray()[jointIndex];
        if (arrowIndex < joint.getArrowArray().length) {
            let arrow = joint.getArrowArray()[arrowIndex];
            let headerId = parseInt($(this).find("option:selected").val());
            if (headerId != -1) {
                let header = graphModel.getElementById(ElementType.HEADER, headerId);
                arrow.data.x1 = header.data.x2;
                arrow.data.y1 = header.data.y2;
                arrow.bindConnectedItems(graphModel);
                table.initFactList();
                Painter.moveElementByModel(arrow);
                Click.showDetail(header);
            } else {
                graphModel.deleteElement(arrow);
                table.initFactList();
                Painter.eraseElement(arrow.data.id);
            }
        } else {
            let headerId = parseInt($(this).find("option:selected").val());
            if (headerId != -1) {
                let header = graphModel.getElementById(ElementType.HEADER, headerId);
                let arrow = new ArrowModel(header.data.x2, header.data.y2, joint.data.x, joint.data.y, graphModel.fetchNextId(), "", "");
                graphModel.insertElement(arrow);
                Painter.drawArrow(d3.select("svg").selectAll(".ecm-arrow").data(graphModel.getArrowArray()).enter(),
                    graphModel, table.controller);
                table.initFactList();
                Click.showDetail(header);
            }
        }
    }
}
