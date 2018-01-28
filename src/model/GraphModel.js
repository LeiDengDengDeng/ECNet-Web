/**
 * Created by aswasn on 2016/12/19.
 */

import { parseString, Builder } from 'xml2js';
import BodyModel from './BodyModel';
import HeaderModel from './HeaderModel';
import JointModel from './JointModel';
import ArrowModel from './ArrowModel';
import MultiSelectModel from './MultiSelectModel';
import { ElementType, GraphVal } from '../assets/constants';
import { Layout } from '../view/Layout';

const XLSX = require('xlsx');

export default class GraphModel {
    constructor(maxId, title, desc, caseReason, caseNumber,
                headerArray, bodyArray, arrowArray, jointArray,manageJudge,courtClerk) {
        this.data = {};

        this.data.maxId = maxId;
        this.data.title = title;
        this.data.desc = desc;
        this.data.caseReason = caseReason;
        this.data.caseNumber = caseNumber;
        this.data.manageJudge = manageJudge;
        this.data.courtClerk = courtClerk;
        this.data.headerArray = headerArray;
        this.data.bodyArray = bodyArray;
        this.data.arrowArray = arrowArray;
        this.data.jointArray = jointArray;
    }

    setTitle(title) {
        this.data.title = title;
    }

    getTitle() {
        return this.data.title;
    }

    setDesc(desc) {
        this.data.desc = desc;
    }

    getDesc() {
        return this.data.desc;
    }

    setCaseReason(caseReason) {
        this.data.caseReason = caseReason;
    }

    getCaseReason() {
        return this.data.caseReason;
    }

    setCaseNumber(caseNumber) {
        this.data.caseNumber = caseNumber;
    }

    getCaseNumber() {
        return this.data.caseNumber;
    }

    getHeaderArray() {
        return this.data.headerArray;
    }

    getBodyArray() {
        return this.data.bodyArray;
    }

    getArrowArray() {
        return this.data.arrowArray;
    }

    getJointArray() {
        return this.data.jointArray;
    }

    getElementArray() {
        return this.data.headerArray
            .concat(this.data.bodyArray).concat(this.data.arrowArray).concat(this.data.jointArray);
    }

    getElementById(type, id) {
        const array = (() => {
            switch (type) {
                case ElementType.BODY:
                    return this.getBodyArray();
                case ElementType.HEADER:
                    return this.getHeaderArray();
                case ElementType.ARROW:
                    return this.getArrowArray();
                case ElementType.JOINT:
                    return this.getJointArray();
                default:
                    return Array.of();
            }
        })();
        for (const element of array) {
            if (element.data.id === id) {
                return element;
            }
        }
        return {};
    }

    // 向GraphModel中添加一个新图元并处理好绑定问题
    insertElement(elementModel) {
        const me = this;
        let array = null;
        switch (elementModel.data.type) {
            case ElementType.BODY:
                array = me.getBodyArray();
                break;
            case ElementType.HEADER:
                array = me.getHeaderArray();
                break;
            case ElementType.ARROW:
                array = me.getArrowArray();
                break;
            case ElementType.JOINT:
                array = me.getJointArray();
                break;
            default:
                break;
        }
        if (array.indexOf(elementModel) === -1) {
            array.push(elementModel);
            elementModel.bindConnectedItems(me);
        }
    }

    deleteElement(elementModel) {
        let array = null;
        switch (elementModel.data.type) {
            case ElementType.HEADER:
                elementModel.delAllArrowsAndBody();
                array = this.data.headerArray;
                break;
            case ElementType.BODY:
                elementModel.delAllHeaders();
                array = this.data.bodyArray;
                break;
            case ElementType.ARROW:
                elementModel.delHeaderAndJoint();
                array = this.data.arrowArray;
                break;
            case ElementType.JOINT:
                elementModel.delAllArrows();
                array = this.data.jointArray;
                break;
            default:
                break;
        }

        if (array) {
            const index = array.findIndex(value => (value.getId() === elementModel.getId()));
            array.splice(index, 1);
        }
    }

    getElementByPosition(x, y) {
        for (const header of this.data.headerArray) {
            const distance = ((x - header.data.x2) * (x - header.data.x2))
                + ((y - header.data.y2) * (y - header.data.y2));
            if (distance < GraphVal.CIRCLE_R * GraphVal.CIRCLE_R) {
                return header;
            }
        }
        for (const rect of this.data.bodyArray) {
            if (x >= rect.data.x && y >= rect.data.y
                && x <= (rect.data.x + GraphVal.RECT_WIDTH)
                && y <= (rect.data.y + GraphVal.RECT_HEIGHT)) {
                return rect;
            }
        }
        for (const rect of this.data.jointArray) {
            if (x >= rect.data.x && y >= rect.data.y
                && x <= (rect.data.x + GraphVal.SQUARE_SIDE)
                && y <= (rect.data.y + GraphVal.SQUARE_SIDE)) {
                return rect;
            }
        }
        return null;
    }

    getElementsByArea(lowX, lowY, highX, highY) {
        const me = this;
        const result = new MultiSelectModel();
        me.getBodyArray().forEach((element) => {
            // 链体：必须全部进入选框
            if (lowX <= element.data.x && lowY <= element.data.y
                && highX >= (element.data.x + GraphVal.RECT_WIDTH)
                && highY >= (element.data.y + GraphVal.RECT_HEIGHT)) {
                result.pushBody(element);
            }
        });
        me.getJointArray().forEach((element) => {
            // 连接点：必须全部进入选框
            if (lowX <= element.data.x && lowY <= element.data.y
                && highX >= (element.data.x + GraphVal.SQUARE_SIDE)
                && highY >= (element.data.y + GraphVal.SQUARE_SIDE)) {
                result.pushJoint(element);
            }
        });
        me.getHeaderArray().forEach((element) => {
            // 链头：圆形部分选中即可
            const cx = element.data.x2;
            const cy = element.data.y2;
            if (lowX <= (cx - GraphVal.CIRCLE_R) && lowY <= (cy - GraphVal.CIRCLE_R)
                && highX >= (cx + GraphVal.CIRCLE_R) && highY >= (cy + GraphVal.CIRCLE_R)) {
                result.pushHeader(element);
            }
        });
        me.getArrowArray().forEach((element) => {
            // 箭头：必须全部选中
            if (lowX <= element.data.x1 && lowX <= element.data.x2
                && lowY <= element.data.y1 && lowY <= element.data.y2
                && highX >= element.data.x1 && highX >= element.data.x2
                && highY >= element.data.y1 && highY >= element.data.y2) {
                result.pushArrow(element);
            }
        });
        return result;
    }

    fetchNextId() {
        this.data.maxId += 1;
        return this.data.maxId;
    }

    static ecmModelToGraphModel(ecmModel) {
        const bodyArray = Array.of();
        const jointArray = Array.of();
        const headerArray = Array.of();
        const arrowArray = Array.of();

        // cache for quick looking
        const bodyMap = {};
        const jointMap = {};
        const headerMap = {};

        // 链体
        if (ecmModel.ebody) {
            ecmModel.ebody.forEach((body) => {
                if (body.$) {
                    const privateAttr = body.$;
                    const name = body.name ? body.name[0] : '';
                    const content = body.content ? body.content[0] : '';
                    const evidenceConclusion = body.evidenceConclusion ? body.evidenceConclusion[0] : '';
                    const evidenceType = body.evidenceType ? body.evidenceType[0] : '';
                    const commiter = body.commiter ? body.commiter[0] : '';
                    const evidenceReason = body.evidenceReason ? body.evidenceReason[0] : '';
                    const bodyModel = new BodyModel(
                        Number(privateAttr.x), Number(privateAttr.y), Number(privateAttr.id),
                        name, content, evidenceType, commiter, evidenceReason, evidenceConclusion);
                    bodyArray.push(bodyModel);
                    bodyMap[privateAttr.id] = bodyModel;
                }
            });
        }
        // 连接点
        if (ecmModel.connector) {
            ecmModel.connector.forEach((joint) => {
                if (joint.$) {
                    const privateAttr = joint.$;
                    const jointModel = new JointModel(
                        Number(privateAttr.x), Number(privateAttr.y), Number(privateAttr.id),
                        joint.name[0], joint.content[0]);
                    jointArray.push(jointModel);
                    jointMap[privateAttr.id] = jointModel;
                }
            });
        }

        // 链头
        if (ecmModel.eheader) {
            ecmModel.eheader.forEach((header) => {
                if (header.$) {
                    const privateAttr = header.$;
                    const ownerID = (header.ownerID) ? header.ownerID[0] : null;
                    const headerModel = new HeaderModel(
                        Number(privateAttr.x1), Number(privateAttr.y1),
                        Number(privateAttr.x2), Number(privateAttr.y2),
                        Number(privateAttr.id), header.name[0],
                        header.content[0], header.keySentence[0]);
                    headerModel.setBody(bodyMap[ownerID]);
                    headerArray.push(headerModel);
                    headerMap[privateAttr.id] = headerModel;
                    // 给链体添加链头
                    if (bodyMap[ownerID]) {
                        bodyMap[ownerID].addHeader(headerModel);
                    }
                }
            });
        }
        // 箭头
        if (ecmModel.hrelation) {
            ecmModel.hrelation.forEach((arrow) => {
                if (arrow.$) {
                    const privateAttr = arrow.$;
                    const ownerID = (arrow.ownerID) ? arrow.ownerID[0] : null;
                    const sonID = (arrow.sonID) ? arrow.sonID[0] : null;
                    const arrowModel = new ArrowModel(
                        Number(privateAttr.x1), Number(privateAttr.y1),
                        Number(privateAttr.x2), Number(privateAttr.y2),
                        Number(privateAttr.id), arrow.name[0], arrow.content[0]);
                    arrowModel.setHeader(headerMap[ownerID]);
                    arrowModel.setJoint(jointMap[sonID]);
                    arrowArray.push(arrowModel);

                    // 给链头添加箭头
                    if (headerMap[ownerID]) {
                        headerMap[ownerID].addArrow(arrowModel);
                    }

                    // 给连接点添加箭头
                    if (jointMap[sonID]) {
                        jointMap[sonID].addArrow(arrowModel);
                    }
                }
            });
        }

        const maxID = ecmModel.maxID[0];
        const caseReason = ecmModel.caseReason ? ecmModel.caseReason[0] : '';
        const caseNumber = ecmModel.caseNumber ? ecmModel.caseNumber[0] : '';
        const title = ecmModel.title[0];
        const description = ecmModel.description[0];
        return new GraphModel(
            maxID, title, description, caseReason,
            caseNumber, headerArray, bodyArray, arrowArray, jointArray);
    }

    static serverModelToGraphModel(ecmModel) {
        const bodyArray = Array.of();
        const jointArray = Array.of();
        const headerArray = Array.of();
        const arrowArray = Array.of();

        // cache for quick looking
        const bodyMap = {};
        const jointMap = {};
        const headerMap = {};

        // 链体
        if (ecmModel.ebody) {
            ecmModel.ebody.forEach((body) => {
                if (body.$) {
                    const privateAttr = body.$;
                    const name = body.name ? body.name : '';
                    const content = body.content ? body.content : '';
                    const evidenceConclusion = body.evidenceConclusion ? body.evidenceConclusion : '';
                    const evidenceType = body.evidenceType ? body.evidenceType : '';
                    const commiter = body.commiter ? body.commiter : '';
                    const evidenceReason = body.evidenceReason ? body.evidenceReason : '';
                    const bodyModel = new BodyModel(0, 0, Number(privateAttr.id),
                        name, content, evidenceType, commiter, evidenceReason, evidenceConclusion);
                    bodyArray.push(bodyModel);
                    bodyMap[privateAttr.id] = bodyModel;
                }
            });
        }
        // 连接点
        if (ecmModel.connector) {
            ecmModel.connector.forEach((joint) => {
                if (joint.$) {
                    const privateAttr = joint.$;
                    const jointModel = new JointModel(0, 0, Number(privateAttr.id),
                        joint.name, joint.content);
                    jointArray.push(jointModel);
                    jointMap[privateAttr.id] = jointModel;
                }
            });
        }

        // 链头
        if (ecmModel.eheader) {
            ecmModel.eheader.forEach((header) => {
                if (header.$) {
                    const privateAttr = header.$;
                    const ownerID = (header.ownerID) ? header.ownerID : null;
                    const headerModel = new HeaderModel(0, 0, 0, 0,
                        Number(privateAttr.id), header.name, header.content, header.keySentence);
                    if (ownerID) {
                        headerModel.setBody(bodyMap[ownerID]);
                        bodyMap[ownerID].addHeader(headerModel);
                    }
                    headerArray.push(headerModel);
                    headerMap[privateAttr.id] = headerModel;
                }
            });
        }
        // 箭头
        if (ecmModel.hrelation) {
            ecmModel.hrelation.forEach((arrow) => {
                if (arrow.$) {
                    const privateAttr = arrow.$;
                    const ownerID = (arrow.ownerID) ? arrow.ownerID : null;
                    const sonID = (arrow.sonID) ? arrow.sonID : null;
                    const arrowModel = new ArrowModel(0, 0, 0, 0, Number(privateAttr.id),
                        arrow.name, arrow.content);
                    if (ownerID) {
                        arrowModel.setHeader(headerMap[ownerID]);
                        headerMap[ownerID].addArrow(arrowModel);
                    }
                    if (sonID) {
                        arrowModel.setJoint(jointMap[sonID]);
                        jointMap[sonID].addArrow(arrowModel);
                    }
                    arrowArray.push(arrowModel);
                }
            });
        }

        const maxID = ecmModel.maxID;
        const title = ecmModel.title;
        const description = ecmModel.description;
        const caseReason = ecmModel.caseReason;
        const caseNumber = ecmModel.caseNumber;
        const manageJudge = ecmModel.manageJudge;
        const courtClerk = ecmModel.courtClerk

        return new GraphModel(maxID, title, description,
            caseReason, caseNumber, headerArray, bodyArray, arrowArray, jointArray,manageJudge,courtClerk);
    }

    // 把ecm文件解析为GraphModel.data对象，返回一个js对象
    static importModelFromEcmFile(str) {
        let graphModel = null;

        parseString(str, (err, result) => {
            // result是一个js对象，接下来从中取出我们需要的属性组成GraphModel的js对象并返回
            const ecmModel = result.ECMModel;
            graphModel = GraphModel.ecmModelToGraphModel(ecmModel);
        });

        return graphModel;
    }

    static importModelFromXlsxFile(xlsxData) {
        const me = this;
        function ab2str(data) {
            let o = '';
            let l = 0;
            const w = 10240;
            for (; l < data.byteLength / w; ++l) {
                o += String.fromCharCode.apply(
                    null, new Uint16Array(data.slice(l * w, (l * w) + w)));
            }
            o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
            return o;
        }

        function s2ab(s) {
            const b = new ArrayBuffer(s.length * 2);
            const v = new Uint16Array(b);
            for (let i = 0; i !== s.length; ++i) v[i] = s.charCodeAt(i);
            return [v, b];
        }

        const wb = XLSX.read(ab2str(s2ab(xlsxData)[1]), {type: 'binary'});

        const factList = wb.Sheets['事实清单'];
        const evidenceList = wb.Sheets['证据清单'];

        const bodyArray = Array.of();
        const jointArray = Array.of();
        const headerArray = Array.of();
        const arrowArray = Array.of();
        const headerMap = {};

        const begin = 3;
        const evidenceEnd = parseInt(evidenceList['!ref'].replace(/[A-Z]\d:[A-Z]/, ''), 10);
        const factEnd = parseInt(factList['!ref'].replace(/[A-Z]\d:[A-Z]/, ''), 10);
        let i = begin;
        let maxID = 0;
        while (i <= factEnd) {
            if (factList[`A${i}`]) {
                const id = parseInt(factList[`A${i}`].v, 10);
                maxID = Math.max(id, maxID);
            }
            i += 1;
        }
        i = begin;
        while (i <= evidenceEnd) {
            if (evidenceList[`A${i}`]) {
                const id = parseInt(evidenceList[`A${i}`].v, 10);
                maxID = Math.max(id, maxID);
                const name = evidenceList[`B${i}`].v;
                const content = evidenceList[`C${i}`].v;
                const evidenceType = evidenceList[`D${i}`].v;
                const committer = evidenceList[`E${i}`] ? evidenceList[`E${i}`].v : '';
                const evidenceReason = evidenceList[`F${i}`].v;
                const evidenceConclusion = evidenceList[`G${i}`].v;
                const body = new BodyModel(0, 0, id, name, content,
                    evidenceType, committer, evidenceReason, evidenceConclusion);
                bodyArray.push(body);
                const hContent1 = evidenceList[`H${i}`] ? evidenceList[`H${i}`].v : '';
                if (hContent1 === '' || hContent1 === '无') {
                    i += 1;
                    continue;
                }
                const hKeySentence1 = evidenceList[`I${i}`].v;
                const hid1 = me.fetchNextId();
                const header1 = new HeaderModel(0, 0, 0, 0, hid1, '', hContent1, hKeySentence1);
                body.addHeader(header1);
                header1.setBody(body);
                headerArray.push(header1);
                headerMap[hContent1] = header1;
                let j = i + 1;
                while (!evidenceList[`A${j}`] && j <= evidenceEnd) {
                    const hContent = evidenceList[`H${j}`].v;
                    const hKeySentence = evidenceList[`I${j}`].v;
                    const hid = me.fetchNextId();
                    const header = new HeaderModel(0, 0, 0, 0, hid, '', hContent, hKeySentence);
                    body.addHeader(header);
                    header.setBody(body);
                    headerArray.push(header);
                    headerMap[hContent] = header;
                    j += 1;
                }
            }
            i += 1;
        }
        i = begin;
        while (i <= factEnd) {
            if (factList[`A${i}`]) {
                const id = parseInt(factList[`A${i}`].v, 10);
                maxID = Math.max(id, maxID);
                const name = factList[`B${i}`].v;
                const content = factList[`C${i}`].v;
                const joint = new JointModel(0, 0, id, name, content);
                jointArray.push(joint);
                const hContent1 = factList[`D${i}`].v;
                if (hContent1 === '' || hContent1 === '无') {
                    i += 1;
                    continue;
                }
                const header1 = headerMap[hContent1];
                const arrow1 = new ArrowModel(0, 0, 0, 0, me.fetchNextId(), '', '');
                arrow1.setJoint(joint);
                joint.addArrow(arrow1);
                arrow1.setHeader(header1);
                header1.addArrow(arrow1);
                arrowArray.push(arrow1);
                let j = i + 1;
                while (!factList[`A${j}`] && j <= factEnd) {
                    const hContent = factList[`D${j}`] ? factList[`D${j}`].v : '';
                    const header = headerMap[hContent];
                    if (!header) {
                        j += 1;
                        continue;
                    }
                    const arrow = new ArrowModel(0, 0, 0, 0, me.fetchNextId(), '', '');
                    arrow.setJoint(joint);
                    joint.addArrow(arrow);
                    arrow.setHeader(header);
                    header.addArrow(arrow);
                    arrowArray.push(arrow);
                    j += 1;
                }
            }
            i += 1;
        }
        let graphModel = new GraphModel(maxID, '', '', '', '', headerArray, bodyArray, arrowArray, jointArray);
        graphModel = Layout.neighbourLayout2(graphModel);
        return graphModel;
    }

    // 把GraphModel转为XML形式的ECM文件Object
    modelToXMLStyleObject() {
        const me = this;
        const ECMModel = {
            ECMModel: {
                id: me.data.id,
                caseReason: me.data.caseReason,
                caseNumber: me.data.caseNumber,
                title: me.data.title,
                description: me.data.desc,
                maxID: me.data.maxId,
                courtClerk:me.data.courtClerk,
                manageJudge:me.data.manageJudge,
                ebody: [],
                eheader: [],
                connector: [],
                hrelation: [],
            },
        };
        me.getBodyArray().forEach((body) => {
            ECMModel.ECMModel.ebody.push({
                $: {
                    x: body.data.x,
                    y: body.data.y,
                    height: GraphVal.RECT_HEIGHT,
                    width: GraphVal.RECT_WIDTH,
                    id: body.data.id,
                },
                name: body.data.name,
                content: body.data.content,
                evidenceType: body.data.evidenceType,
                commiter: body.data.committer,
                evidenceReason: body.data.evidenceReason,
                evidenceConclusion: body.data.evidenceConclusion,
                files: '',
            });
        });
        me.getHeaderArray().forEach((header) => {
            let ownerID = null;
            let connected = false;
            if (header.data.body) {
                connected = true;
                ownerID = header.data.body.data.id;
            }
            ECMModel.ECMModel.eheader.push({
                $: {
                    x1: header.data.x1,
                    y1: header.data.y1,
                    x2: header.data.x2,
                    y2: header.data.y2,
                    id: header.data.id,
                },
                name: header.data.name,
                content: header.data.content,
                ownerID,
                connected,
                keySentence: header.data.keySentence,
            });
        });
        me.getArrowArray().forEach((arrow) => {
            let ownerID = null;
            let sonID = null;
            const connected = [false, false];
            if (arrow.data.header) {
                connected[0] = true;
                ownerID = arrow.getHeader().getId();
            }
            if (arrow.data.joint) {
                connected[1] = true;
                sonID = arrow.getJoint().getId();
            }
            ECMModel.ECMModel.hrelation.push({
                $: {
                    x1: arrow.data.x1,
                    y1: arrow.data.y1,
                    x2: arrow.data.x2,
                    y2: arrow.data.y2,
                    id: arrow.data.id,
                },
                name: arrow.data.name,
                content: arrow.data.content,
                ownerID,
                sonID,
                connected,
            });
        });
        me.getJointArray().forEach((joint) => {
            ECMModel.ECMModel.connector.push({
                $: {
                    x: joint.data.x,
                    y: joint.data.y,
                    height: GraphVal.SQUARE_SIDE,
                    width: GraphVal.SQUARE_SIDE,
                    id: joint.data.id,
                },
                name: joint.data.name,
                content: joint.data.content,
            });
        });
        return ECMModel;
    }

    // 把GraphModel转为XML形式的ECM文件Object，然后以字符串的形式返回
    modelToEcmFile() {
        const ECMModel = this.modelToXMLStyleObject();
        return new Builder().buildObject(ECMModel);
    }
}
