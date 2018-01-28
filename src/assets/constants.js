/**
 * Created by aswasn on 2016/12/19.
 */

/**
 * 枚举文件的选择状况
 * @type {{UNSELECTED: number, UNMODIFIED: number, MODIFIED: number}}
 */
export const FileStatus = {
    UNSELECTED: 0,   // 未选择文件
    UNMODIFIED: 100, // 未修改文件
    MODIFIED: 200    // 已修改文件
};

/**
 * 枚举元素类型
 * @type {{UNKNOWN: number, HEADER: number, BODY: number, ARROW: number, JOINT: number}}
 */
export const ElementType = {
    UNKNOWN: -1,
    HEADER: 0, // 链头
    BODY: 1, // 链体
    ARROW: 2,    // 箭头
    JOINT: 3 // 联结点
};

/**
 * 把绘图的一些基本参数提取到这里
 */


export const GraphVal = {
    CIRCLE_R: 15,    // 链头圆的半径
    RECT_WIDTH: 80,  // 链体的宽
    RECT_HEIGHT: 30, // 链体的高
    SQUARE_SIDE: 30, // 连接点的边长
    STROKE_WIDTH: 1, // 线条粗细
    TEXT_OPACITY: 1,
    CIRCLE_DELTA: 10, // 判定范围
    DEFAULT_HEIGHT: 45,   // 默认链头线长
    HIGHLIGHT_COLOR: "#FE4C40",  // 高亮颜色
    NORMAL_COLOR: "#000000",  // 非高亮颜色
    POSITION_OFFSET_X:0.5,
    POSITION_OFFSET_Y:1.4,
    FONT_SIZE:'14px',
    // 框选相关
    MULTI_SELECT_AREA_STROKE_WIDTH: 1,   // 选框border宽度
    MULTI_SELECT_AREA_COLOR: "#008FD1",   // 选框颜色
    MULTI_SELECT_AREA_OPACITY: 0.1,   // 选框透明度
};



// 邻居算法的一些参数配置
export const Neighbour = {
    HEADER2JOINT: 150, // 链体和链接点的默认距离
    HEADER2BODY: 150, // 链体和链接点的默认距离
    BODY2JOINT: 300,
    BODY2BODY: 100,
    HEADER2HEADER: 80,
    JOINT2JOINT:50,
    K_RADIAN: Math.PI / 180, // 角度转化为弧度的常数
    LAYER_START_X: 50, // 第一层开始的x坐标
    LAYER_DELTA_X: 50, // 层次之间x坐标差
    LAYER_START_Y: 50, // 第一层开始的y坐标
    LAYER_DELTA_Y: 200, // 层次之间y坐标差
    START_ANGLE: 0
};


/**
 * 操作类型枚举
 */
export const OperationType = {
    GRAPH_INFO_CHANGE: 100,
    GRAPH_POS_CHANGE: 101,
    ELEMENT_ADD: 102,
    ELEMENT_REMOVE: 103,
    ELEMENTS_CHANGE: 104,

    BODY_POS_CHANGE: 200,
    HEADER_POS_CHANGE: 300,
    ARROW_POS_CHANGE: 400,
    JOINT_POS_CHANGE: 500,
};


// ----------说理逻辑图相关----------
export const LogicNodeType = {
    EVIDENCE: "证据",
    FACT: "事实",
    LAW: "法条",
    CONCLUSION: "结论",
    FINAL_CONCLUSION: "最终结论"
};

export const LogicNodeColor = {
    EVIDENCE: "#428C6D",
    FACT: "#fdb933",
    LAW: "#f3715c",
    CONCLUSION: "#426ab3",
    FINAL_CONCLUSION: "#495A80"
};

export const LogicValidate = {
    OK: 0,
    TOPIC_EMPTY: 1,
    TOPIC_TOO_LONG: 2,
    DETAIL_EMPTY: 4,
    DETAIL_TOO_LONG: 8,
    DUPLICATE_ROOT: 16
};

export const LogicTextLimit = {
    TOPIC: 15,
    DETAIL: 300
};


// ----------后端接口----------
export const URL = {
    SAVE_ECM: "/saveECM",
    SAVE_LOGIC: "/saveLogic",
    UPDATE_ECM: "/updateECM",
    UPDATE_LOGIC: "/updateLogic",
    COMBINE_WORD: "/combineWord",
    FIND_ECM_DETAIL: "/findECMDetail",
    FIND_LOGIC_DETAIL: "/findLogicDetail"
};

export const ShortCutKey = {
    KEY_BODY: 'b',
    KEY_HEADER:'h',
    KEY_ARROW: 'a',
    KEY_JOINT:'j',
    KEY_SAVE: 's',
    KEY_REDO:'z'
}
