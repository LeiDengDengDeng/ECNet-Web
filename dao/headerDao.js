/**
 * Created by zgw on 2017/3/20.
 */


const header = require('../models/header');

exports.headerFilter = (headers)=>{

    headers.forEach(t => {
        if(!t.ownerID){
            t.ownerID = 0;
        }
    });

    return headers;
};

exports.createBulkHeader = async(headers) => {
    headers = this.headerFilter(headers);
    return header.bulkCreate(headers);
};

// headers中原来没有的新增
// 有的update,原来有现在没有的做逻辑删除
// 以ecmID和relativeID作为标准
exports.coverBulkHeader = async(ecmID, headers) => {
    if (!headers || !headers.length) {
        return [];
    }
    headers = this.headerFilter(headers);

    let oldRecords = await header.findAll({
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

    console.log(`headers:${headers}`);

    // iterate update

    headers.forEach(t => {
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
        let newRecords = await this.createBulkHeader(newArr);
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

    header.destroy({
        'where': where
    });


    return headers;

};

// 根据ecmID查找所有的header
exports.findByECMId = async(ecmID) =>{
    return await header.findAll({
        'where': {
            'ecmID': ecmID
        },
        'order': 'relativeID asc'
    });
};

exports.deleteByECMId = async(ecmID) =>{
    return await header.destroy({
        'where': {
            'ecmID': ecmID
        }
    });
};
