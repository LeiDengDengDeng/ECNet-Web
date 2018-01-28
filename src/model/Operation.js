/**
 * Created by aswasn on 2017/2/3.
 */

import { OperationType } from '../assets/constants';
import Painter from '../view/Painter';

class OriginalValue {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    getName() {
        return this.name;
    }

    getValue() {
        return this.value;
    }
}

/**
 * 用来保存操作记录的类
 *
 * this.operationType   记录操作类型
 * this.elementModel    记录变动的对象
 * this.valueArray      原数据数组
 */
class Operation {

    constructor(type) {
        this.operationType = type;
    }

    recover(controller) {
        controller.clearMultiSelect();
    }
}

/**
 * 用来保存图像信息变更操作
 */
class GraphInfoOperation extends Operation {
    constructor(owner, elementModel, valueArray) {
        super(OperationType.GRAPH_INFO_CHANGE);
        this.owner = owner;
        this.elementModel = elementModel;
        this.valueArray = valueArray;
    }

    recover() {
        super.recover(this.owner);
        const me = this;
        me.valueArray.forEach((origin) => {
            me.elementModel.data[origin.getName()] = origin.getValue();
        });
        me.owner.redrawInfoPanels();
    }
}

/**
 * 用来保存图像位置变更操作
 */
class GraphPosOperation extends Operation {
    constructor(owner, originalModel) {
        super(OperationType.GRAPH_POS_CHANGE);
        this.owner = owner;
        this.originalModel = originalModel;
    }

    recover() {
        super.recover(this.owner);
        this.owner.graphModel = this.originalModel;
        this.owner.redraw();
    }
}
/**
 * 用来保存新增图元操作
 */
class ElementAddOperation extends Operation {
    constructor(graphModel, elementModel) {
        super(OperationType.ELEMENT_ADD);
        this.graphModel = graphModel;
        this.elementModel = elementModel;
    }

    recover() {
        const me = this;
        this.graphModel.deleteElement(this.elementModel);
        // this.graphModel.data.maxId--;
        Painter.eraseElement(me.elementModel.getId());
    }
}

/**
 * 用来保存删除图元操作
 */
class ElementRemoveOperation extends Operation {
    constructor(controller, elementModel) {
        super(OperationType.ELEMENT_REMOVE);
        this.controller = controller;
        this.elementModel = elementModel;
    }

    recover() {
        const me = this;
        me.controller.graphModel.insertElement(me.elementModel);

        Painter.drawElement(me.elementModel, me.controller);
    }
}

/**
 * 用来记录链体移动操作
 */
class BodyPosChangeOperation extends Operation {

    constructor(graphModel, elementModel, xOld, yOld) {
        super(OperationType.BODY_POS_CHANGE);
        this.graphModel = graphModel;
        this.elementModel = elementModel;
        this.xOld = xOld;
        this.yOld = yOld;
    }

    recover() {
        const me = this;
        me.elementModel.data.x = me.xOld;
        me.elementModel.data.y = me.yOld;
        me.elementModel.bindConnectedItems(me.graphModel);
        Painter.moveElementByModel(me.elementModel);
    }
}
/**
 * 用来记录链头移动操作
 */
class HeaderPosChangeOperation extends Operation {

    constructor(graphModel, elementModel, x1Old, y1Old, x2Old, y2Old) {
        super(OperationType.HEADER_POS_CHANGE);
        this.graphModel = graphModel;
        this.elementModel = elementModel;
        this.x1Old = x1Old;
        this.y1Old = y1Old;
        this.x2Old = x2Old;
        this.y2Old = y2Old;
    }

    recover() {
        const me = this;
        me.elementModel.data.x1 = me.x1Old;
        me.elementModel.data.y1 = me.y1Old;
        me.elementModel.data.x2 = me.x2Old;
        me.elementModel.data.y2 = me.y2Old;
        me.elementModel.bindConnectedItems(me.graphModel);
        Painter.moveElementByModel(me.elementModel);
    }
}
/**
 * 用来记录箭头移动操作
 */
class ArrowPosChangeOperation extends Operation {

    constructor(graphModel, elementModel, x1Old, y1Old, x2Old, y2Old) {
        super(OperationType.ARROW_POS_CHANGE);
        this.graphModel = graphModel;
        this.elementModel = elementModel;
        this.x1Old = x1Old;
        this.y1Old = y1Old;
        this.x2Old = x2Old;
        this.y2Old = y2Old;
    }

    recover() {
        const me = this;
        me.elementModel.data.x1 = me.x1Old;
        me.elementModel.data.y1 = me.y1Old;
        me.elementModel.data.x2 = me.x2Old;
        me.elementModel.data.y2 = me.y2Old;
        me.elementModel.bindConnectedItems(me.graphModel);
        Painter.moveElementByModel(me.elementModel);
    }
}
/**
 * 用来记录连接点移动操作
 */
class JointPosChangeOperation extends Operation {

    constructor(graphModel, elementModel, xOld, yOld) {
        super(OperationType.JOINT_POS_CHANGE);
        this.graphModel = graphModel;
        this.elementModel = elementModel;
        this.xOld = xOld;
        this.yOld = yOld;
    }

    recover() {
        const me = this;
        me.elementModel.data.x = me.xOld;
        me.elementModel.data.y = me.yOld;
        me.elementModel.bindConnectedItems(me.graphModel);
        Painter.moveElementByModel(me.elementModel);
    }
}
/**
 * 用于记录许多同时发生的改变
 */
class ElementsChangeOperation extends Operation {
    constructor(array) {
        super(OperationType.ELEMENTS_CHANGE);
        this.arr = array;
    }

    recover() {
        this.arr.forEach((operation) => {
            operation.recover();
        });
    }
}

export {
    OriginalValue, GraphInfoOperation, GraphPosOperation,
    ElementAddOperation, ElementRemoveOperation,
    BodyPosChangeOperation, HeaderPosChangeOperation,
    ArrowPosChangeOperation, JointPosChangeOperation,
    ElementsChangeOperation,
};
