/**
 * Created by zgw on 2017/3/29.
 */


const arrow = require('../models/arrow');


exports.arrowFilter = (arrows)=>{

    arrows.forEach(t => {
        if(!t.sonID){
            t.sonID = 0;
        }
        if(!t.ownerID){
            t.ownerID = 0;
        }
    });

    return arrows;
};

exports.createBulkArrow = async(arrows) => {
    arrows = this.arrowFilter(arrows);
    arrows = arrow.bulkCreate(arrows);
    console.log(`CREATE Arrows:${JSON.stringify(arrows)}`);
    return arrows;
};


// arrows中原来没有的新增
// 有的update,原来有现在没有的做逻辑删除
// 以ecmID和relativeID作为标准
exports.coverBulkArrow = async(ecmID, arrows) => {
    if (!arrows || !arrows.length) {
        return [];
    }
    arrows = this.arrowFilter(arrows);

    let oldRecords = await arrow.findAll({
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

    console.log(`arrows:${arrows}`);

    // iterate update

    arrows.forEach(t => {
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
        let newRecords = await this.createBulkArrow(newArr);
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

    arrow.destroy({
        'where': where
    });


    return arrows;

};

// 根据ecmID查找所有的arrow
exports.findByECMId = async(ecmID) =>{
    return await arrow.findAll({
        'where': {
            'ecmID': ecmID
        },
        'order': 'relativeID asc'

    });
};

exports.deleteByECMId = async(ecmID) =>{
    return await arrow.destroy({
        'where': {
            'ecmID': ecmID
        }
    });
};