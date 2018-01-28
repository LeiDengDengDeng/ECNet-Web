/**
 * Created by aswasn on 2016/12/19.
 */

import { ElementType } from '../assets/constants';

export default class ElementModel {

    constructor(initData) {
        this.data = {};
        if (initData) {
            $.extend(true, this.data, initData);
        } else {
            this.data = {
                id: -1,
                type: ElementType.UNKNOWN,
            };
        }
    }

    // 排版算法坐标调整
    _setX(x) {
        this.data.x = x;
    }

    _getX() {
        return this.data.x;
    }


    _setY(y) {
        this.data.y = y;
    }

    _getY() {
        return this.data.y;
    }

    _getX1() {
        return this.data.x1;
    }

    _getY1() {
        return this.data.y1;
    }

    _setX1(x1) {
        this.data.x1 = x1;
    }

    _setY1(y1) {
        this.data.y1 = y1;
    }

    _getX2() {
        return this.data.x2;
    }

    _getY2() {
        return this.data.y2;
    }

    _setX2(x2) {
        this.data.x2 = x2;
    }

    _setY2(y2) {
        this.data.y2 = y2;
    }

    _getStartAngle() {
        return this.data.startAngle;
    }

    _getClockPara() {
        return Math.abs(this.data.startAngle) <= 90 ? 1 : -1;
    }

    _setStartAngle(startAngle) {
        this.data.startAngle = startAngle;
    }

    _setAdjusted(adjusted) {
        this.data.adjusted = adjusted;
    }

    _getAdjusted() {
        return this.data.adjusted;
    }

    static _getDegrees() {
        return 0;
    }

    // 得到每个小角度,用于neighbour算法
    _getAlpha() {
        return this._getDegrees() === 0 ? 180 : 180 / this._getDegrees();
    }

    getId() {
        return this.data.id;
    }

    getType() {
        return this.data.type;
    }

    // 在neighbour算法中使用,-1表示访问完成，0表示没有访问，>0表示访问次数
    _setVisited(visited) {
        this.data.visited = visited;
    }


    _getVisited() {
        return this.data.visited;
    }

    _setClockWise() {
        this.data.clockWise = true;
    }

    _getClockWise() {
        return this.data.clockWise;
    }
}
