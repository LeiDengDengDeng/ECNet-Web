/**
 * Created by aswasn on 2016/12/18.
 */

// 引入共同需要的模块
import * as d3 from 'd3';
import 'd3-drag';
import '../assets/common';
import GraphModel from '../model/GraphModel';
import { GraphVal, ElementType, URL, ShortCutKey } from '../assets/constants';
import { CreateDrag, DrawClick, DrawDrag } from '../view/Motion';
import { Layout } from '../view/Layout';
import Painter from '../view/Painter';
import Copy from '../assets/copy';
import Table from '../view/Table';
import HeaderModel from '../model/HeaderModel';
import ArrowModel from '../model/ArrowModel';
import JointModel from '../model/JointModel';
import BodyModel from '../model/BodyModel';
import ServerInterface from './ServerInterface';
import {
    OriginalValue, GraphInfoOperation,
    GraphPosOperation, ElementAddOperation, ElementRemoveOperation,
} from '../model/Operation';

/**
 * IndexController和NewController的基类。存放一些共同的逻辑。
 *
 * 成员变量:
 * this.graphModel GraphModel   存有当前文件信息，具体见model/GraphModel.js
 * this.undoStack   Array<Operation>    记录撤销记录
 * this.clipboard   剪贴板，用来存储一个被复制的elementModel
 * this.multiSelectModel 用来记录当前多选值的对象
 */
function drawClickFun(type, constant, remove, me) {
    d3.select('#DrawBox').remove();
    d3.select('#svg-canvas').on('.drag .draw', null);
    d3.select('#svg-canvas').on('mousemove.draw', null);
    d3.select('#svg-canvas').on('click.draw', null);
    me.setMultiSelect();
    if (remove) {
        return;
    }
    // console.log(originFun2)
    const mousePos = d3.mouse(document.getElementById('svg-canvas'));
    console.log(mousePos);
    let x = -50,
        y = -50;
    const db = new DrawClick(x, y, type);
    d3.select('#svg-canvas').on('mousemove.draw', () => {
        const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));
        let x_move = parseFloat(mousePos_move[0]),
            y_move = parseFloat(mousePos_move[1]);
        db.drawClick_move(x_move, y_move);
    });

    const originFun = d3.select('#svg-canvas');
    // let originFun2 = d3.select('#svg-canvas').click
    console.log(originFun);
    if (constant) {
        d3.select('#svg-canvas').on('click.draw', () => {
            const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));

            let x_move = parseFloat(mousePos_move[0]),
                y_move = parseFloat(mousePos_move[1]);
            db.drawClick_click(x_move, y_move, me.graphModel, me);
        });
    } else {
        d3.select('#svg-canvas').on('click.draw', () => {
            const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));
            console.log(mousePos_move);
            let x_move = parseFloat(mousePos_move[0]),
                y_move = parseFloat(mousePos_move[1]);
            db.drawClick_click(x_move, y_move, me.graphModel, me);
            db.container.remove();
            d3.select('#svg-canvas').on('mousemove.draw', null);
            d3.select('#svg-canvas').on('click.draw', null);

            me.drawState = -1;
        });
    }
}
function drawDragFun(type, constant, remove, me) {
    d3.select('#DrawBox').remove();
    d3.select('#svg-canvas').on('.drag .draw', null);
    d3.select('#svg-canvas').on('mousemove.draw', null);
    d3.select('#svg-canvas').on('click.draw', null);
    me.setMultiSelect();
    if (remove) {
        return;
    }
    let x = -50,
        y = -50;
    const dh = new DrawDrag(x, y, type);
    d3.select('#svg-canvas').on('mousemove.draw', () => {
        const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));
        let x_move = parseFloat(mousePos_move[0]),
            y_move = parseFloat(mousePos_move[1]);
        dh.drawDrag_move(x_move, y_move);
    });
    const header_drag = d3.drag().on('start.draw', () => {
        const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));
        let x_move = parseFloat(mousePos_move[0]),
            y_move = parseFloat(mousePos_move[1]);
        dh.drawDrag_start(x_move, y_move);
        console.log('header draw ppp+112');
    }).on('drag.draw', () => {
        const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));
        let x_move = parseFloat(mousePos_move[0]),
            y_move = parseFloat(mousePos_move[1]);
        dh.drawDrag_drag(x_move, y_move);
    }).on('end.draw', () => {
        const mousePos_move = d3.mouse(document.getElementById('svg-canvas'));
        let x_move = parseFloat(mousePos_move[0]),
            y_move = parseFloat(mousePos_move[1]);

        dh.drawDrag_end(x_move, y_move, me.graphModel, me);
        if (!constant) {
            dh.container.remove();
            d3.select('#svg-canvas').on('.drag .draw', null);
            d3.select('#svg-canvas').on('mousemove.draw', null);
            me.drawState = -1;
            me.setMultiSelect();
            console.log('change state');
        } else {
            console.log('continue');
        }
    });
    d3.select('#svg-canvas').call(header_drag);
}
export default class BaseController {
    constructor() {
        this.svg = null;
        this.graphModel = null;
        this.undoStack = null;
        this.clipboard = null;
        this.multiSelectModel = null;
        this.DrawState = {
            NONE: -1,
            BODY: 0,
            HEADER: 1,
            ARROW: 2,
            JOINT: 3,
        };
        // 2017-07-06 添加关于按钮建立模型的功能，以及用于表示状态的标志


        this._init();
        this.handleFileSave();
        this.handleUndo();
        this.bindCreateButtons();
        this.bindLayoutButton();
        this.setDetailPanel();
        this.setRightMenu();
        this.setMultiSelect();
        this.refreshdrawState();
        this.initPrint();
        this.handleKeyEvent();
    }

    refreshdrawState() {
        this.drawState = this.DrawState.NONE;

        this.drawFunc = new Map();
        const me = this;


        this.drawFunc.set(ShortCutKey.KEY_BODY, (constant = false, remove = false) => {
            drawClickFun(ElementType.BODY, constant, remove, me);
        });
        this.drawFunc.set(ShortCutKey.KEY_HEADER, (constant = false, remove = false) => {
            drawDragFun(ElementType.HEADER, constant, remove, me);
        });
        this.drawFunc.set(ShortCutKey.KEY_ARROW, (constant = false, remove = false) => {
            drawDragFun(ElementType.ARROW, constant, remove, me);
        });
        this.drawFunc.set(ShortCutKey.KEY_JOINT, (constant = false, remove = false) => {
            drawClickFun(ElementType.JOINT, constant, remove, me);
        });
    }
    resetState() {
        this.setMultiSelect();
        this.clearMultiSelect();
        $('.toggle').removeClass('pushdown');
    }
    keyDown(key) {
        this.drawState.set(key, true);
    }
    keyUp(key) {
        this.drawState.set(key, false);
    }
    handleKeyEvent() {
        const me = this;
        d3.select('body').on('keypress', () => {
            console.log(document.activeElement.id);
            if (document.activeElement.id != 'body-global') {
                return;
            }
            const key = d3.event.key;
            console.log(key.toLowerCase());
            switch (key.toLowerCase()) {

                case ShortCutKey.KEY_BODY:
                    {
                        me.drawState = 0;
                    }
                    break;
                case ShortCutKey.KEY_HEADER:
                    {
                        me.drawState = 1;
                    }
                    break;
                case ShortCutKey.KEY_ARROW:
                    {
                        me.drawState = 2;
                    }
                    break;
                case ShortCutKey.KEY_JOINT:
                    {
                        me.drawState = 3;
                    }
                    break;
            }

            const fun = me.drawFunc.get(key);
            if (fun) {
                me.resetState();
                fun();
            }
        });
    }

    setGraphModel(graphModel) {
        this.graphModel = graphModel;
        this.table.setGraphModel(graphModel);
    }

    _init() {
        // 初始化画布
        const svg = d3.select('.graph-wrapper').append('svg').attr('width', 2000)
            .attr('height', 2000)
            .attr('id', 'svg-canvas');
        this.svg = svg;
        this.graphModel = new GraphModel(0, '', '', '', '', Array.of(), Array.of(), Array.of(), Array.of());
        this.undoStack = Array.of();
        this.table = new Table(this, this.graphModel);

        // 定义箭头
        d3.select('#svg-canvas').append('g').attr('id', 'dragBox').append('circle').attr('r',20).attr('fill','black');
        svg.append('defs').append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5');
    }

    // 绑定文件保存事件
    handleFileSave() {
        const me = this;
        $('.graph-tools-wrapper #save-btn').on('click', () => {
            const title = `${me.graphModel.getTitle() || '未命名'}.ecm`;
            const uri = `data:text/plain;charset=utf-8,${encodeURIComponent(me.graphModel.modelToEcmFile())}`;
            const link = document.createElement('a');
            link.download = title;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            const id = me.graphModel.data.id;
            // console.log('update:'+ id)
            if (id) {
                ServerInterface.updateECMModel(me.graphModel);
            } else {
                ServerInterface.saveECM2Server(me.graphModel);
            }
        });
    }

    handleUndo() {
        const me = this;
        const $revokeBtn = $('#revoke-btn');
        $revokeBtn.addClass('disabled');
        $revokeBtn.on('click', () => {
            me.clearMultiSelect();
            me.undoStack.pop().recover();
            if (me.undoStack.length === 0) {
                $revokeBtn.addClass('disabled');
            }
        });
    }

    logOperation(operation) {
        const me = this;
        me.undoStack.push(operation);
        if (me.undoStack.length > 0) {
            $('.graph-tools-wrapper #revoke-btn').removeClass('disabled');
        }
    }

    // 设置具体信息面板
    setDetailPanel() {
        const me = this;
        const ecm = this.graphModel;
        // 绑定数据
        if (ecm) {
            $('#ecm-title').val(ecm.getTitle());
            $('#ecm-desc').val(ecm.getDesc());
            $('#ecm-caseNumber').val(ecm.getCaseNumber());
            $('#ecm-caseReason').val(ecm.getCaseReason());

            const $ecmSaveBtn = $('#ecm-save-btn');
            const $ecmResetBtn = $('#ecm-reset-btn');

            $ecmSaveBtn.off('click');
            $ecmResetBtn.off('click');

            $ecmSaveBtn.click(() => {
                // 记录undo
                const array = Array.of();
                array.push(new OriginalValue('title', ecm.getTitle()));
                array.push(new OriginalValue('desc', ecm.getDesc()));
                array.push(new OriginalValue('caseNumber', ecm.getCaseNumber()));
                array.push(new OriginalValue('caseReason', ecm.getCaseReason()));
                me.logOperation(new GraphInfoOperation(me, ecm, array));

                ecm.setTitle($('#ecm-title').val());
                ecm.setDesc($('#ecm-desc').val());
                ecm.setCaseNumber($('#ecm-caseNumber').val());
                ecm.setCaseReason($('#ecm-caseReason').val());
            });
            $ecmResetBtn.click(() => {
                me.clearMultiSelect();
                $('#ecm-title').val(ecm.getTitle());
                $('#ecm-desc').val(ecm.getDesc());
                $('#ecm-caseNumber').val(ecm.getCaseNumber());
                $('#ecm-caseReason').val(ecm.getCaseReason());
            });
        }
    }

    bindLayoutButton() {
        const me = this;
        d3.select('#layout-btn').on('click', (() => {
            me.clearMultiSelect();
            me.logOperation(new GraphPosOperation(me, Copy.deepCopyGraphModel(me.graphModel)));
            me.graphModel = Layout.neighbourLayout2(me.graphModel);
            me.redraw();
        }));
    }

    bindCreateButtons() {
        const me = this;
        const createDrag = new CreateDrag();
        d3.select('#add-header-btn').call(d3.drag()
            .on('start', () => createDrag.dragStart('add-header-btn', ElementType.HEADER))
            .on('drag', () => createDrag.drag())
            .on('end', () => createDrag.dragEnd(me.graphModel, me)));
        d3.select('#add-body-btn').call(d3.drag()
            .on('start', () => createDrag.dragStart('add-body-btn', ElementType.BODY))
            .on('drag', () => createDrag.drag())
            .on('end', () => createDrag.dragEnd(me.graphModel, me)));
        d3.select('#add-joint-btn').call(d3.drag()
            .on('start', () => createDrag.dragStart('add-joint-btn', ElementType.JOINT))
            .on('drag', () => createDrag.drag())
            .on('end', () => createDrag.dragEnd(me.graphModel, me)));
        d3.select('#add-arrow-btn').call(d3.drag()
            .on('start', () => createDrag.dragStart('add-arrow-btn', ElementType.ARROW))
            .on('drag', () => createDrag.drag())
            .on('end', () => createDrag.dragEnd(me.graphModel, me)));
// 为持续性输入按钮添加事件
        d3.select('#add-body-btn-toggle').on('click', () => {
            if (me.drawState == 0) {
                drawClickFun(ElementType.BODY, false, true, me);
                me.drawState = -1;
                me.resetState();
                return;
            }
            $('.toggle').removeClass('pushdown');
            $('#add-body-btn-toggle').addClass('pushdown');

            me.drawState = 0;
            drawClickFun(ElementType.BODY, true, false, me);
        });
        d3.select('#add-header-btn-toggle').on('click', () => {
            if (me.drawState == 1) {
                drawDragFun(ElementType.HEADER, false, true, me);
                me.drawState = -1;
                me.resetState();
                return;
            }
            $('.toggle').removeClass('pushdown');
            $('#add-header-btn-toggle').addClass('pushdown');

            me.drawState = 1;
            drawDragFun(ElementType.HEADER, true, false, me);
        });
        d3.select('#add-arrow-btn-toggle').on('click', () => {
            if (me.drawState == 2) {
                drawDragFun(ElementType.ARROW, false, true, me);
                me.drawState = -1;
                me.resetState();
                return;
            }
            $('.toggle').removeClass('pushdown');
            $('#add-arrow-btn-toggle').addClass('pushdown');

            me.drawState = 2;
            drawDragFun(ElementType.ARROW, true, false, me);
        });
        d3.select('#add-joint-btn-toggle').on('click', () => {
            if (me.drawState == 3) {
                drawClickFun(ElementType.JOINT, false, true, me);
                me.drawState = -1;
                me.resetState();
                return;
            }
            $('.toggle').removeClass('pushdown');
            $('#add-joint-btn-toggle').addClass('pushdown');

            me.drawState = 3;
            drawClickFun(ElementType.JOINT, true, false, me);
        });


        d3.select('#body-add-btn').on('click', (() => {
            const body = new BodyModel(100, 100,
                me.graphModel.fetchNextId(), '', '', '', '', '', '');// 默认在100，100位置
            me.graphModel.insertElement(body);
            me.initEvidenceList();
            Painter.drawBody(d3.select('svg').selectAll('.ecm-body').data(me.graphModel.getBodyArray()).enter(),
                me.graphModel, me);
        }));

        d3.select('#joint-add-btn').on('click', (() => {
            const joint = new JointModel(200, 100,
                me.graphModel.fetchNextId(), '', '');// 默认在200，100位置
            me.graphModel.insertElement(joint);
            Painter.drawJoint(d3.select('svg').selectAll('.ecm-joint').data(me.graphModel.getJointArray()).enter(),
                me.graphModel, me);
            me.initFactList();
        }));

        // 导出表格
        d3.select('#export-btn').on('click', (() => {
            me.table.exportTableToExcel();
        }));

        $('#collapseEvidenceList').on('show.bs.collapse', () => {
            me.initEvidenceList();
        });

        $('#collapseFactList').on('show.bs.collapse', () => {
            me.initFactList();
        });

        d3.select('#combine-btn').on('click', () => {
            $.ajax({
                type: 'POST',
                url: URL.COMBINE_WORD,
                data: me.graphModel.modelToXMLStyleObject() || {},
                dataType: 'text',
                success(data) {
                    const title = 'cyl.txt';
                    const uri = data;
                    const link = document.createElement('a');
                    link.download = title;
                    link.href = uri;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                error(XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.status);
                    alert(XMLHttpRequest.readyState);
                    alert(textStatus);
                    alert(errorThrown);
                    alert('网络繁忙，请稍后再试');
                },
            });
        });
    }

    initEvidenceList() {
        this.table.initEvidenceList();
    }

    initFactList() {
        this.table.initFactList();
    }

    // 重绘画布
    redraw() {
        const me = this;

        me.svg.selectAll('g').remove();

        // 画链体
        Painter.drawBody(me.svg.selectAll('.ecm-body').data(me.graphModel.getBodyArray()).enter(), me.graphModel, me);

        // 画连接点
        Painter.drawJoint(me.svg.selectAll('.ecm-joint').data(me.graphModel.getJointArray()).enter(), me.graphModel, me);

        // 画箭头
        Painter.drawArrow(me.svg.selectAll('.ecm-arrow').data(me.graphModel.getArrowArray()).enter(), me.graphModel, me);

        // 画链头
        Painter.drawHeader(me.svg.selectAll('.ecm-header').data(me.graphModel.getHeaderArray()).enter(), me.graphModel, me);

        me.redrawInfoPanels();
    }

    // 重新填充右侧链图信息面板，并隐藏所有图元面板
    redrawInfoPanels() {
        const me = this;
        // 右侧信息面板
        me.setDetailPanel();
        const panelIds = ['head-panel', 'body-panel', 'arrow-panel', 'joint-panel'];
        for (let i = 0; i < panelIds.length; i++) {
            $(`#${panelIds[i]}`).hide();
        }
    }

    initPrint() {
        $('.graph-tools-wrapper #print-btn').on('click', () => {
            const content = window.document.body.innerHTML;
            const startstr = '<!--startprint-->';
            const endstr = '<!--endprint-->';
            let con = content.substr(content.indexOf(startstr) + 17);
            con = con.substring(0, con.indexOf(endstr));
            const newWindow = window.open();
            newWindow.document.write(con);
            newWindow.print();
        });
    }

    // 设置右键菜单 而且 判断了多选是否应该消失
    setRightMenu() {
        const me = this;
        d3.select('svg').on('mousedown', function () {
            const svgX = d3.mouse(document.getElementById('svg-canvas'))[0];
            const svgY = d3.mouse(document.getElementById('svg-canvas'))[1];
            const elementModel = me.graphModel.getElementByPosition(svgX, svgY);
            if (d3.event.which === 3) {
                me.clearMultiSelect();
                let data = null;
                if (elementModel) {
                    // 点击到了某个元素
                    data =
                    [
                        [
                                { text: elementModel.data.name },
                                { text: `id:${elementModel.data.id}` },
                        ],
                        [
                            {
                                text: '复制图元',
                                func() {
                                    me.clipboard =
                                            Copy.copyElementWithNewId(elementModel, me.graphModel);
                                },
                            },
                            {
                                text: '删除图元',
                                func() {
                                    me.logOperation(
                                            new ElementRemoveOperation(me, elementModel));
                                    me.graphModel.deleteElement(elementModel);
                                    Painter.eraseElement(elementModel.getId());
                                },
                            },
                        ],
                    ];
                } else {
                    data =
                    [
                        [{
                            text: '新增图元',
                            data: [[{
                                text: '链体',
                                func: () => {
                                    const model = new BodyModel(svgX, svgY,
                                            me.graphModel.fetchNextId(), '新链体', '', '', '', '', '');
                                    me.graphModel.insertElement(model);
                                    Painter.drawBody(d3.select('svg')
                                            .selectAll('.ecm-body')
                                            .data(me.graphModel.getBodyArray()).enter(), me.graphModel, me);
                                    me.logOperation(
                                            new ElementAddOperation(me.graphModel, model));
                                },
                            }, {
                                text: '链头',
                                func: () => {
                                    const model = new HeaderModel(
                                            svgX, svgY + GraphVal.DEFAULT_HEIGHT, svgX, svgY,
                                            me.graphModel.fetchNextId(), '新链头', '', '');
                                    me.graphModel.insertElement(model);
                                    Painter.drawHeader(d3.select('svg')
                                            .selectAll('.ecm-header')
                                            .data(me.graphModel.getHeaderArray()).enter(), me.graphModel, me);
                                    me.logOperation(
                                            new ElementAddOperation(me.graphModel, model));
                                },
                            }, {
                                text: '箭头',
                                func: () => {
                                    const model = new ArrowModel(
                                            svgX, svgY + GraphVal.DEFAULT_HEIGHT, svgX, svgY,
                                            me.graphModel.fetchNextId(), '新箭头', '');
                                    me.graphModel.insertElement(model);
                                    Painter.drawArrow(d3.select('svg')
                                            .selectAll('.ecm-arrow')
                                            .data(me.graphModel.getArrowArray()).enter(), me.graphModel, me);
                                    me.logOperation(new ElementAddOperation(me.graphModel, model));
                                },
                            }, {
                                text: '连接点',
                                func: () => {
                                    const model = new JointModel(svgX, svgY,
                                            me.graphModel.fetchNextId(), '新连接点', '');
                                    me.graphModel.insertElement(model);
                                    Painter.drawJoint(d3.select('svg')
                                            .selectAll('.ecm-joint')
                                            .data(me.graphModel.getJointArray()).enter(), me.graphModel, me);
                                    me.logOperation(new ElementAddOperation(me.graphModel, model));
                                },
                            }]],
                        }, {
                            text: '粘贴图元',
                            func() {
                                if (me.clipboard) {
                                    const model = me.clipboard;
                                    Copy.refreshPositionOfPasteElement(model, svgX, svgY);
                                    me.graphModel.insertElement(model);
                                    Painter.drawElement(model, me);
                                    me.logOperation(new ElementAddOperation(me.graphModel, model));
                                    me.clipboard = Copy.copyElementWithNewId(model, me.graphModel);
                                }
                            },
                        }],
                    ];
                }
                $.smartMenu.remove();
                $(this).smartMenu(data);
                return false;
            }
            $.smartMenu.remove();
            if (!elementModel) {
                me.clearMultiSelect();
            }

            return true;
        });
    }

    clearMultiSelect() {
        if (this.multiSelectModel) {
            Painter.markMultiSelectedElements(this.multiSelectModel, false);
        }
        this.multiSelectModel = null;
    }

    setMultiSelect() {
        const me = this;
        const multiSelectStart = () => {
            const pos = d3.mouse(document.getElementById('svg-canvas'));
            Painter.drawMultiSelectArea(pos[0], pos[1]);
        };

        const multiSelect = () => {
            const pos = d3.mouse(document.getElementById('svg-canvas'));
            Painter.expandMultiSelectArea(pos[0], pos[1]);
        };

        const multiSelectEnd = () => {
            const area = d3.select('#multi-select-area');
            const lowX = area.attr('x');
            const lowY = area.attr('y');
            const pos = d3.mouse(document.getElementById('svg-canvas'));
            const highX = pos[0];
            const highY = pos[1];
            if ((highX - lowX) > 5 && (highY - lowY) > 5) {   // 防止过于敏感触发多选
                if (me.multiSelectModel) {
                    Painter.markMultiSelectedElements(me.multiSelectModel, false);
                }
                me.multiSelectModel = null;
                me.multiSelectModel = me.graphModel.getElementsByArea(lowX, lowY, highX, highY);
                Painter.markMultiSelectedElements(
                    me.multiSelectModel, true);
            }
            Painter.eraseElement('multi-select-area');
        };

        d3.select('svg').call(d3.drag()
            .on('start .multi', () => multiSelectStart())
            .on('drag .multi', () => multiSelect())
            .on('end .multi', () => multiSelectEnd())
            .filter(() => {
                console.log(`state:${me.drawState}`);
                return (me.drawState < 0);
            }));
    }

}
