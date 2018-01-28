/**
 * Created by apple on 2017/4/13.
 */
const logicNode = require('../models/logicNode');

exports.nodeFilter = (nodes)=>{
    nodes.forEach(n => {
        if(!n.leadTo){
            n.leadTo = 0;
        }
    });
    return nodes;
};

exports.bulkCreateNode = async(nodes) => {
    return logicNode.bulkCreate(nodes);
};