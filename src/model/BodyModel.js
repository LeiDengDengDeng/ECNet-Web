/**
 * Created by aswasn on 2016/12/21.
 */

import ElementModel from './ElementModel';
import { ElementType, GraphVal } from '../assets/constants';
import Painter from '../view/Painter';

export default class BodyModel extends ElementModel {
    // 矩形是左上角坐标
    constructor(x, y, id, name, content,
                evidenceType, committer, evidenceReason, evidenceConclusion) {
        super({ id, type: ElementType.BODY });

        this.data.x = x;
        this.data.y = y;

        this.data.name = name;
        this.data.content = content;
        this.data.evidenceType = evidenceType;
        this.data.committer = committer;
        this.data.evidenceReason = evidenceReason;
        this.data.evidenceConclusion = evidenceConclusion;
        // 链体所连接的链头列表
        this.data.headerArray = Array.of();
    }

    setName(name) {
        this.data.name = name;
        Painter.refreshText(this.getId(), name);
    }

    getName() {
        return this.data.name;
    }

    setContent(content) {
        this.data.content = content;
    }

    getContent() {
        return this.data.content;
    }

    setEvidenceType(evidenceType) {
        this.data.evidenceType = evidenceType;
    }

    getEvidenceType() {
        return this.data.evidenceType;
    }

    setCommitter(committer) {
        this.data.committer = committer;
    }

    getCommitter() {
        return this.data.committer;
    }

    setEvidenceReason(evidenceReason) {
        this.data.evidenceReason = evidenceReason;
    }

    getEvidenceReason() {
        return this.data.evidenceReason;
    }

    setEvidenceConclusion(evidenceConclusion) {
        this.data.evidenceConclusion = evidenceConclusion;
    }

    getEvidenceConclusion() {
        return this.data.evidenceConclusion;
    }

    // 给链体加上一个链头
    addHeader(header) {
        if (this.data.headerArray.indexOf(header) === -1) {
            this.data.headerArray.push(header);
            header.setBody(this);
        }
    }

    // 从链体上解绑一个链头
    delHeader(header) {
        const index = this.data.headerArray.indexOf(header);
        if (index !== -1) {
            this.data.headerArray.splice(index, 1);
            header.setBody(null);
        }
    }

    // 删除链体时和链头解绑定
    delAllHeaders() {
        if (this.data.headerArray) {
            this.data.headerArray.forEach(header => header.setBody(null));
        }
    }

    // 绑定在界内的，解绑不在界内的
    bindConnectedItems(graphModel) {
        const me = this;
        graphModel.getHeaderArray().forEach((header) => {
            if (!(!!header.getBody() && header.getBody() !== me)) {
                if (header.data.x1 >= me.data.x && header.data.y1 >= me.data.y
                    && header.data.x1 <= (me.data.x + GraphVal.RECT_WIDTH)
                    && header.data.y1 <= (me.data.y + GraphVal.RECT_HEIGHT)) {
                    me.addHeader(header);
                } else {
                    me.delHeader(header);
                }
            }
        });
    }

    getHeaderArray() {
        return this.data.headerArray;
    }

    getNeighbourJoint() {
        return this._getNeighbours();
    }

    getHeaderArray2Joint(joint) {
        const headerArray = Array.of();
        const headerMap = {};
        if (!!joint && !!this.data.headerArray) {
            this.data.headerArray.forEach((header) => {
                if (header.getArrowArray()) {
                    for (const arrow of header.getArrowArray()) {
                        if (arrow.getJoint() === joint && !headerMap[header.getId()]) {
                            headerMap[header.getId()] = header;
                            headerArray.push(header);
                            break;
                        }
                    }
                }
            });
        }
        return headerArray;
    }

    // 得到周围连接点数量
    _getDegrees() {
        const neighbours = this._getNeighbours(false);
        return neighbours ? neighbours.length : 0;
    }

    // 得到邻居连接点
    _getNeighbours(sort = true) {
        const neighbours = Array.of();
        const map = {};
        if (this.data.headerArray) {
            this.data.headerArray.forEach((header) => {
                if (header.getArrowArray()) {
                    for (const arrow of header.getArrowArray()) {
                        if (!!arrow.getJoint() && !map[arrow.getJoint().getId()]) {
                            map[arrow.getJoint().getId()] = arrow.getJoint();
                            neighbours.push(arrow.getJoint());
                        }
                    }
                }
            });
        }

        if (sort) {
            neighbours.sort((a, b) => b._getDegrees() - a._getDegrees());
        }
        return neighbours;
    }

}
