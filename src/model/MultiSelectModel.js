/**
 * Created by aswasn on 2017/3/4.
 */

import {ElementType} from '../assets/constants'

// 多选Model
export default class MultiSelectModel {

    constructor() {
        this.bodyArray = Array.of();
        this.headerArray = Array.of();
        this.arrowArray = Array.of();
        this.jointArray = Array.of();
    }

    getBodyArray() {
        return this.bodyArray;
    }

    getHeaderArray() {
        return this.headerArray;
    }

    getArrowArray() {
        return this.arrowArray;
    }

    getJointArray() {
        return this.jointArray;
    }

    pushBody(elementModel) {
        if (!!elementModel && elementModel.data.type == ElementType.BODY) {
            this.bodyArray.push(elementModel);
        }
    }

    pushHeader(elementModel) {
        if (!!elementModel && elementModel.data.type == ElementType.HEADER) {
            this.headerArray.push(elementModel);
        }
    }

    pushArrow(elementModel) {
        if (!!elementModel && elementModel.data.type == ElementType.ARROW) {
            this.arrowArray.push(elementModel);
        }
    }

    pushJoint(elementModel) {
        if (!!elementModel && elementModel.data.type == ElementType.JOINT) {
            this.jointArray.push(elementModel);
        }
    }

    // 目前没有调用的必要，直接整个model销毁
    clearAll() {
        this.bodyArray = null;
        this.headerArray = null;
        this.arrowArray = null;
        this.jointArray = null;

        this.bodyArray = Array.of();
        this.headerArray = Array.of();
        this.arrowArray = Array.of();
        this.jointArray = Array.of();
    }

    // 判断元素是否在多选Model中
    isSelected(model, type) {
        let me = this;
        switch (type) {
            case ElementType.BODY: {
                return (me.getBodyArray().indexOf(model) != -1);
            }
                break;
            case ElementType.HEADER: {
                return (me.getHeaderArray().indexOf(model) != -1);
            }
                break;
            case ElementType.ARROW: {
                return (me.getArrowArray().indexOf(model) != -1);
            }
                break;
            case ElementType.JOINT: {
                return (me.getJointArray().indexOf(model) != -1);
            }
                break;
        }
    }

}
