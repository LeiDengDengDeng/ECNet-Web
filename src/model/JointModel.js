/**
 * Created by aswasn on 2016/12/21.
 */

import ElementModel from './ElementModel'
import {ElementType, GraphVal} from '../assets/constants'
import Painter from "../view/Painter";
export default class JointModel extends ElementModel {
    // 方块是左上角坐标
    constructor(x, y, id, name, content) {

        super({id: id, type: ElementType.JOINT});

        this.data.x = x;
        this.data.y = y;

        this.data.content = content;
        this.data.name = name;

        // 连接点所连接的箭头列表
        this.data.arrowArray = Array.of();
    }

    setName(name) {
        this.data.name = name;
        Painter.refreshText(this.getId(), name);

    }

    setContent(content) {
        this.data.content = content;
    }

    getName() {
        return this.data.name;
    }

    getContent() {
        return this.data.content;
    }

    // 邻居算法中得到统计周围多少个链体/连接点
    _getDegrees() {
        let neighbours = this._getNeighbours(false);
        return !!neighbours ? neighbours.length : 0;
    }

    // 得到周围的箭头数组
    getArrowArray() {
        return this.data.arrowArray;
    }

    // 邻居算法中得到周围的链头
    _getNeighbours(sort = true) {
        let neighbours = Array.of();
        let map = {}; // for duplicate check
        if (!!this.data.arrowArray) {
            for (let arrow of this.data.arrowArray) {
                if (!!arrow.getHeader()) {
                    let header = arrow.getHeader();
                    if (!!header.getBody() && !map[header.getBody().getId()]) {
                        map[header.getBody().getId()] = header.getBody();
                        neighbours.push(header.getBody());
                    }
                    if (!!header.getArrowArray()) {
                        for (let nextArrow of header.getArrowArray()) {
                            if (nextArrow !== arrow && !!nextArrow.getJoint() && nextArrow.getJoint() !== this && !map[nextArrow.getJoint().getId()]) {
                                map[nextArrow.getJoint().getId()] = nextArrow.getJoint();
                                neighbours.push(nextArrow.getJoint());
                            }
                        }
                    }
                }
            }
        }

        if(sort){
            neighbours.sort(function (a, b) {
                return b._getDegrees() - a._getDegrees();
            });
        }


        return neighbours;
    }

    // 给连接点添加一个箭头
    addArrow(arrow) {
        if (this.data.arrowArray.findIndex(function (value, index, arr) {
                return value === arrow;
            }) == -1) {
            this.data.arrowArray.push(arrow);
            arrow.setJoint(this);
        }
    }

    // 给连接点解绑一个箭头
    delArrow(arrow) {
        let index = this.data.arrowArray.findIndex(function (value, index, arr) {
            return value === arrow;
        });
        if (index != -1) {
            this.data.arrowArray.splice(index, 1);
            arrow.setJoint(null);
        }

    }

    // 删除连接点时和箭头解绑定
    delAllArrows() {
        if (!!this.data.arrowArray) {
            for (let arrow of this.data.arrowArray) {
                arrow.setJoint(null);
            }
        }
    }

    // 绑定在界内的，解绑不在界内的
    bindConnectedItems(graphModel) {
        let me = this;
        for (let arrow of graphModel.getArrowArray()) {
            if (!(!!arrow.getJoint() && arrow.getJoint() !== me)) {
                if (arrow.data.x2 >= me.data.x && arrow.data.y2 >= me.data.y
                    && arrow.data.x2 <= (me.data.x + GraphVal.SQUARE_SIDE) && arrow.data.y2 <= (me.data.y + GraphVal.SQUARE_SIDE)) {
                    me.addArrow(arrow);
                } else {
                    me.delArrow(arrow);
                }
            }
        }
    }
}
