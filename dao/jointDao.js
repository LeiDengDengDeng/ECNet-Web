/**
 * Created by zgw on 2017/3/29.
 */


const joint = require('../models/joint');

exports.createBulkJoint = async(joints) => {
    joints = joint.bulkCreate(joints);
    console.log(`CREATE Joints:${JSON.stringify(joints)}`);
    return joints;
};

// joints中原来没有的新增
// 有的update,原来有现在没有的做逻辑删除
// 以ecmID和relativeID作为标准
exports.coverBulkJoint = async(ecmID, joints) => {
    if (!joints || !joints.length) {
        return [];
    }

    let oldRecords = await joint.findAll({
        'where': {
            'ecmID': ecmID
        }
    });

    let oldMap = {};

    oldRecords.forEach(t => {
        oldMap[t.relativeID] = t;
    });

    let newArr = Array.of();

    let idList = Array.of();

    console.log(`joints:${joints}`);

    // iterate update

    joints.forEach(t => {
        if (!!t.relativeID && !!oldMap[t.relativeID]) {
            let h = oldMap[t.relativeID];
            Object.assign(h, t);
            h.save();
            idList.push(t.relativeID);
        } else {
            newArr.push(t);
        }
    });


    // bulk create
    if (!!newArr && !!newArr.length) {
        let newRecords = await this.coverBulkJoint(newArr);
        newRecords.forEach(t => {
            idList.push(t.relativeID);
        });
    }

    // destroy
    let where = {
        'ecmID': {
            '$eq': ecmID,
        }
    };
    if (!!idList && !!idList.length) {
        where['relativeID'] = {'$notIn': idList};
    }

    joint.destroy({
        'where': where
    });


    return joints;

};

// 根据ecmID查找所有的body
exports.findByECMId = async(ecmID) =>{
    return await joint.findAll({
        'where': {
            'ecmID': ecmID
        },
        'order': 'relativeID asc'
    });
};

exports.deleteByECMId = async(ecmID) =>{
    return await joint.destroy({
        'where': {
            'ecmID': ecmID
        }
    });
};