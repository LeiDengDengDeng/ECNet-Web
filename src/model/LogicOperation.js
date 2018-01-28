/**
 * Created by aswasn on 2017/3/26.
 */
import LogicCopy from '../assets/logic-copy'
class AddOperation {
    constructor(id, controller) {
        this.id = id;
        this.controller = controller;
    }

    recover() {
        this.controller.graphModel.removeNode(this.id);
        this.controller.redraw();
    }
}

class RemoveAndEditOperation {
    constructor(graphModel, controller) {
        this.backup = LogicCopy.copyGraphModel(graphModel);
        this.controller = controller;
    }

    recover() {
        this.controller.graphModel = this.backup;
        this.controller.redraw();
    }
}

export {AddOperation, RemoveAndEditOperation};
