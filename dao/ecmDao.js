/**
 * Created by zgw on 2017/3/20.
 */

const ECM = require('../models/ecm');


exports.createECM = async(title, desc,caseReason,caseNumber) => {
    // chain all your queries here. make sure you return them.

    return ECM.create({
        title: title,
        description: desc,
        caseReason :caseReason,
        caseNumber:caseNumber

    });


};


exports.updateECM = async(model, title, desc,caseReason,caseNumber) => {
    // chain all your queries here. make sure you return them.
    model.title = title;
    model.description = desc;
    model.caseReason = caseReason;
    model.caseNumber = caseNumber;
    return model.save();
};

exports.deleteECM = async(id) => {
    // chain all your queries here. make sure you return them.
    return ECM.destroy({
        'where': {'id': id}
    });
};

exports.findECMById = async(id) => {
    // chain all your queries here. make sure you return them.
    return ECM.findById(id);
};


exports.findECMList = async() => {
    // chain all your queries here. make sure you return them.
    return ECM.findAll({
        'order':'id DESC'
    });
};

exports.findECMByCaseNumber= async(caseNumber) => {
    // chain all your queries here. make sure you return them.
    return ECM.findOne({
        'where':{'caseNumber': caseNumber}
    });
};