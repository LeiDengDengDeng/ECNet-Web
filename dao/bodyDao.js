/**
 * Created by zgw on 2017/3/20.
 */


const body = require('../models/body');

exports.createBulkBody = async(bodies) => {
    bodies = body.bulkCreate(bodies);
    console.log(`CREATE Bodies:${JSON.stringify(bodies)}`);
    return bodies;
};

// bodies中原来没有的新增
// 有的update,原来有现在没有的做逻辑删除
// 以ecmID和relativeID作为标准
exports.coverBulkBody = async(ecmID, bodies) => {
    if (!bodies || !bodies.length) {
        return [];
    }

    let oldRecords = await body.findAll({
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

    console.log(`bodies:${bodies}`);

    // iterate update

    bodies.forEach(t => {
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
        let newRecords = await this.coverBulkBody(newArr);
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

    body.destroy({
        'where': where
    });


    return bodies;

};

// 根据ecmID查找所有的body
exports.findByECMId = async(ecmID) =>{
    return await body.findAll({
        'where': {
            'ecmID': ecmID
        },
        'order': 'relativeID asc'
    });
};

exports.deleteByECMId = async(ecmID) =>{
    return await body.destroy({
        'where': {
            'ecmID': ecmID
        }
    });
};

