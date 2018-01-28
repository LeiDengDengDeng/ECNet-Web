/**
 * Created by aswasn on 2016/12/21.
 */

import ElementModel from './ElementModel'
import {ElementType, GraphVal} from '../assets/constants'
import Painter from "../view/Painter";
export default class HeaderModel extends ElementModel {
    // 圆是x2,y2,直线头是x1,y1
    constructor(x1, y1, x2, y2, id, name, content, keySentence) {
        super({id: id, type: ElementType.HEADER});

        this.data.x1 = x1;
        this.data.y1 = y1;
        this.data.x2 = x2;
        this.data.y2 = y2;

        this.data.content = content;
        this.data.name = name;
        this.data.keySentence = keySentence;

        this.data.body = null;

        // 链头所连接的箭头列表
        this.data.arrowArray = Array.of();
    }

    getContent() {
        return this.data.content;
    }

    getName() {
        return this.data.name;
    }

    getKeySentence() {
        return this.data.keySentence;
    }

    setContent(content) {
        this.data.content = content;
    }

    setName(name) {
        this.data.name = name;
        Painter.refreshText(this.getId(), name);
    }

    setKeySentence(keySentence) {
        this.data.keySentence = keySentence;
    }

    getBody() {
        return this.data.body;
    }

    setBody(body) {
        this.data.body = body;
    }

    // 与某个指定箭头绑定
    addArrow(arrow) {
        if (this.data.arrowArray.findIndex(function (value, index, arr) {
                return value === arrow;
            }) == -1) {
            this.data.arrowArray.push(arrow);
            arrow.setHeader(this);
        }
    }

    // 与某个指定箭头解绑定
    delArrow(arrow) {
        let index = this.data.arrowArray.findIndex(function (value, index, arr) {
            return value === arrow;
        });
        if (index != -1) {
            this.data.arrowArray.splice(index, 1);
            arrow.setHeader(null);
        }
    }

    // 删除链头时和箭头、链体解绑定
    delAllArrowsAndBody() {
        if (!!this.data.arrowArray) {
            for (let arrow of this.data.arrowArray) {
                arrow.setHeader(null);
            }
        }
        if (!!this.data.body) {
            this.data.body.delHeader(this);
        }
    }

    // 邻居算法中得到统计出度
    // _getDegrees() {
    //     return (!!this.data.arrowArray ? this.data.arrowArray.length : 0);
    // }

    // 得到周围的箭头数组
    getArrowArray() {
        return this.data.arrowArray;
    }


    // 得到周围的连接点数组
    _getNeighbourJoint() {
        let neighbours = [];
        let map = {};
        if (!!this.data.arrowArray) {
            for (let arrow of this.data.arrowArray) {
                if (!!arrow.getJoint()) {
                    neighbours.push(arrow.getJoint())
                }
            }
        }
        return neighbours;
    }

    // 绑定在界内的，解绑不在界内的
    bindConnectedItems(graphModel) {
        let me = this;
        // 首先判断是否有链体关系
        let hasBody = false;
        for (let body of graphModel.getBodyArray()) {
            if (body.data.x <= me.data.x1 && body.data.y <= me.data.y1
                && me.data.x1 <= (body.data.x + GraphVal.RECT_WIDTH)
                && me.data.y1 <= (body.data.y + GraphVal.RECT_HEIGHT)) {
                hasBody = true;
                if (!!me.getBody() && me.getBody() !== body) {
                    me.getBody().delHeader(me);
                }
                else if (!!me.getBody() && me.getBody() === body) {
                    break;
                }
                body.addHeader(me);
                break;
            }
        }
        if ((!hasBody) && (!!me.getBody())) {
            me.getBody().delHeader(me);
        }

        // 然后判断是否有箭头关系
        for (let arrow of graphModel.getArrowArray()) {
            if (!(!!arrow.getHeader() && arrow.getHeader() !== me)) {
                let distance2 = Math.pow((me.data.x2 - arrow.data.x1), 2) + Math.pow((me.data.y2 - arrow.data.y1), 2);
                if (distance2 <= Math.pow(GraphVal.CIRCLE_R, 2)) {
                    me.addArrow(arrow);
                } else {
                    me.delArrow(arrow);
                }
            }
        }
    }


    // 调整箭头键尾坐标,如果有body就调整，并且移动所有arrow的尾巴坐标
    adjustCoordinate() {
        if (!!this.getBody()) {
            let body = this.getBody();
            let vectorX = this._getX2() - (body._getX() + GraphVal.RECT_WIDTH / 2);
            let vectorY = this._getY2() - (body._getY() + GraphVal.RECT_HEIGHT / 2);
            let index = 0;
            // 相对于左上角
            let deltaX = [GraphVal.RECT_WIDTH, GraphVal.RECT_WIDTH / 2, 0, GraphVal.RECT_WIDTH / 2];
            let deltaY = [GraphVal.RECT_HEIGHT / 2, GraphVal.RECT_HEIGHT, GraphVal.RECT_HEIGHT / 2, 0];
            if (vectorY > 0 && Math.abs(vectorY) > Math.abs(vectorX)) {
                index = 1;
            } else if (vectorX < 0 && Math.abs(vectorX) >= Math.abs(vectorY)) {
                index = 2;
            } else if (vectorY < 0 && Math.abs(vectorY) >= Math.abs(vectorX)) {
                index = 3;
            } else {
                index = 0;
            }

            let changeX = body._getX() + deltaX[index] - this._getX1();
            let changeY = body._getY() + deltaY[index] - this._getY1();

            this._setX1(body._getX() + deltaX[index]);

            this._setY1(body._getY() + deltaY[index]);
            this._setX2(this._getX2() + changeX);
            this._setY2(this._getY2() + changeY);

            for (let arrow of this.getArrowArray()) {
                arrow._setX1(this._getX2());
                arrow._setY1(this._getY2());
            }
        }
    }


    // 邻居算法中得到周围的连接点
    // _getNeighbours() {
    //     let neighbours = [];
    //     let map = {};
    //     if (!!this.data.arrowArray) {
    //         for (let arrow of this.data.arrowArray) {
    //             if (!!arrow.getJoint()) {
    //                 neighbours.push(arrow.getJoint())
    //             }
    //         }
    //     }
    //     return neighbours;
    // }
}
