/**
 * Created by aswasn on 2016/12/21.
 */

import ElementModel from './ElementModel';
import {ElementType, GraphVal} from '../assets/constants';
import Painter from '../view/Painter';

export default class ArrowModel extends ElementModel {
    // 箭头是x2,y2,箭尾是x1,y1
    constructor(x1, y1, x2, y2, id, name, content) {
        super({id, type: ElementType.ARROW});

        this.data.x1 = x1;
        this.data.y1 = y1;
        this.data.x2 = x2;
        this.data.y2 = y2;

        this.data.content = content;
        this.data.name = name;
        this.data.header = null;
        this.data.joint = null;
    }

    getContent() {
        return this.data.content;
    }

    setContent(content) {
        this.data.content = content;
    }

    getName() {
        return this.data.name;
    }

    setName(name) {
        this.data.name = name;
        Painter.refreshText(this.getId(), name);
    }

    getHeader() {
        return this.data.header;
    }

    getJoint() {
        return this.data.joint;
    }

    setHeader(header) {
        this.data.header = header;
    }

    setJoint(joint) {
        this.data.joint = joint;
    }

    // 删除连接点时和箭头解绑定
    delHeaderAndJoint() {
        if (this.data.header) {
            this.data.header.delArrow(this);
        }
        if (this.data.joint) {
            this.data.joint.delArrow(this);
        }
    }

    // 绑定在界内的，解绑不在界内的
    bindConnectedItems(graphModel) {
        const me = this;
        // 先处理链头
        let hasHeader = false;
        for (const header of graphModel.getHeaderArray()) {
            const distance2 = ((me.data.x1 - header.data.x2) ** 2)
                + ((me.data.y1 - header.data.y2) ** 2);
            if (distance2 <= GraphVal.CIRCLE_R ** 2) {
                hasHeader = true;
                if ((!!me.getHeader()) && me.getHeader() !== header) {
                    me.getHeader().delArrow(me);
                } else if ((!!me.getHeader()) && me.getHeader() === header) {
                    break;
                }
                header.addArrow(me);
                break;
            }
        }
        if ((!hasHeader) && (!!me.getHeader())) {
            me.getHeader().delArrow(me);
        }

        // 再处理连接点
        let hasJoint = false;
        for (const joint of graphModel.getJointArray()) {
            if (joint.data.x <= me.data.x2 && joint.data.y <= me.data.y2
                && me.data.x2 <= (joint.data.x + GraphVal.SQUARE_SIDE)
                && me.data.y2 <= (joint.data.y + GraphVal.SQUARE_SIDE)) {
                hasJoint = true;
                if ((!!me.getJoint()) && me.getJoint() !== joint) {
                    me.getJoint().delArrow(me);
                } else if ((!!me.getJoint()) && me.getJoint() === joint) {
                    break;
                }
                joint.addArrow(me);
                break;
            }
        }
        if ((!hasJoint) && (!!me.getJoint())) {
            me.getJoint().delArrow(me);
        }
    }

    adjustCoordinate() {
        if (this.getJoint()) {
            const joint = this.getJoint();
            const vectorX = this._getX1() - (joint._getX() + (GraphVal.SQUARE_SIDE / 2));
            const vectorY = this._getY1() - (joint._getY() + (GraphVal.SQUARE_SIDE / 2));
            let index = 0;
            // 相对于左上角
            const deltaX = [GraphVal.SQUARE_SIDE,
                GraphVal.SQUARE_SIDE / 2, 0, GraphVal.SQUARE_SIDE / 2];
            const deltaY = [GraphVal.SQUARE_SIDE / 2,
                GraphVal.SQUARE_SIDE, GraphVal.SQUARE_SIDE / 2, 0];
            if (vectorY > 0 && Math.abs(vectorY) > Math.abs(vectorX)) {
                index = 1;
            } else if (vectorX < 0 && Math.abs(vectorX) >= Math.abs(vectorY)) {
                index = 2;
            } else if (vectorY < 0 && Math.abs(vectorY) >= Math.abs(vectorX)) {
                index = 3;
            } else {
                index = 0;
            }

            this._setX2(joint._getX() + deltaX[index]);
            this._setY2(joint._getY() + deltaY[index]);
        }
    }
}
