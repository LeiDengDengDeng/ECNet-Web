/**
 * Created by apple on 2017/4/13.
 */
const Logic = require('../models/logic');

exports.createLogic = async(title,caseReason,caseNumber) => {
    // chain all your queries here. make sure you return them.
    return Logic.create({
        title: title,
        caseReason: caseReason,
        caseNumber: caseNumber
    });
};

exports.updateLogic = async(model, title,caseReason,caseNumber) => {
    // chain all your queries here. make sure you return them.
    model.title = title;
    model.caseReason = caseReason;
    model.caseNumber = caseNumber;
    return model.save();
};

exports.deleteLogic = async(id) => {
    // chain all your queries here. make sure you return them.
    return Logic.destroy({
        'where': {'id': id}
    });
};

exports.findLogicById = async(id) => {
    // chain all your queries here. make sure you return them.
    return Logic.findById(id);
};


exports.findLogicList = async() => {
    // chain all your queries here. make sure you return them.
    return Logic.findAll({
        'order':'id DESC'
    });
};