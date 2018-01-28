/**
 * Created by aswasn on 2017/3/26.
 */

import LogicGraphModel from '../model/LogicGraphModel'
import $ from './jquery-vendor'

export default class LogicCopy {
    static copyGraphModel(oldModel) {
        let newModel = new LogicGraphModel();
        newModel.setTitle(oldModel.title);
        newModel.maxId = oldModel.maxId;
        $.extend(true, newModel.data, oldModel.data);
        return newModel;
    }
}
