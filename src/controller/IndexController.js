/**
 * Created by aswasn on 2016/12/15.
 */

// import js modules
import BaseController from './BaseController';
import ServerInterface from './ServerInterface';
import { FileStatus } from '../assets/constants';
import GraphModel from '../model/GraphModel';
import Copy from '../assets/copy';
import { Layout } from '../view/Layout';

// import css
require('../css/index.css');

/**
 * IndexController处理index.html的各种逻辑
 *
 * 成员变量：
 * this.reader  FileReader  读文件用
 * this.fileStatus  Number  记录页面状态，具体有哪些状态看assets/constants.js里的FileStatus
 * this.originalGraph   GraphModel  保存一份刚打开时的图片用于重置
 */
class IndexController extends BaseController {

    constructor() {
        super();
        // 界面样式为未选择文件时
        this.changeStatus(FileStatus.UNSELECTED);
        this.handleFileChoose();
        this.originalGraph = null;
    }

    // 绑定文件选择事件
    handleFileChoose() {
        const me = this;
        // 初始化FileReader
        this.fileReader = new FileReader();
        // 为reader设置回调，将文件转为GraphModel并备份
        let fileType = 'ecm';
        this.fileReader.onload = function () {
            me.changeStatus(FileStatus.MODIFIED);
            if (fileType === 'ecm') {
                me.setGraphModel(GraphModel.importModelFromEcmFile(this.result));
            } else if (fileType === 'xlsx') {
                me.setGraphModel(GraphModel.importModelFromXlsxFile(this.result));
            }
            me.originalGraph = Copy.deepCopyGraphModel(me.graphModel);
            me.handleGraphReset();
            me.redraw();
            me.setDetailPanel();
            me.initEvidenceList();
            me.initFactList();
        };
        // 绑定事件，选择文件后调用回调
        $('#file-choose-btn').on('change', function () {
            if (this.files[0].name.endsWith('.xlsx')) {
                fileType = 'xlsx';
                me.fileReader.readAsBinaryString(this.files[0]);
            } else {
                fileType = 'ecm';
                me.fileReader.readAsText(this.files[0]);
            }
        });
    }

    // 处理界面样式变化
    changeStatus(st) {
        this.fileStatus = st;
        switch (this.fileStatus) {
            case FileStatus.UNSELECTED:
                this._statusUnselected();
                break;
            case FileStatus.UNMODIFIED:
                this._statusUnmodified();
                break;
            case FileStatus.MODIFIED:
                this._statusModified();
                break;
            default:
                break;
        }
    }


    handleGraphReset() {
        const me = this;

        $('.file-operation-btns #reset-btn').on('click', () => {
            me.graphModel = Copy.deepCopyGraphModel(me.originalGraph);
            me.redraw();
        });
    }

    // -----不要直接调用以下方法-----
    _statusUnselected() {
        $('.file-operation-btns').hide();
    }

    _statusUnmodified() {
        $('.file-operation-btns').show();
        $('.file-operation-btns a').addClass('disabled');
    }

    _statusModified() {
        $('.file-operation-btns').show();
        $('.file-operation-btns a').removeClass('disabled');
    }

    // -----不要直接调用以上方法-----


}


// run
$(document).ready(() => {
    console.log(window.location.search)
    const id = parseInt(window.location.search.substr(1), 10);
    const controller = new IndexController();
    if (id) {
        ServerInterface.getECMModel(id, (data) => {
            if (data === {}) {
                return;
            }
            let graphModel = GraphModel.serverModelToGraphModel(data);
            graphModel = Layout.neighbourLayout2(graphModel);
            graphModel.data.id = id;
            controller.setGraphModel(graphModel);
            controller.originalGraph = Copy.deepCopyGraphModel(controller.graphModel);
            controller.handleGraphReset();
            controller.redraw();
            controller.setDetailPanel();
            controller.initEvidenceList();
            controller.initFactList();
        });
    }
});
