/**
 * Created by aswasn on 2017/2/25.
 */

import GraphModel from '../model/GraphModel';
import BodyModel from '../model/BodyModel';
import HeaderModel from '../model/HeaderModel';
import JointModel from '../model/JointModel';
import ArrowModel from '../model/ArrowModel';

import { ElementType, GraphVal } from './constants';

export default class Copy {

    /**
     * 深拷贝GraphModel，返回一个完整的复制品
     * @param src
     * @returns {GraphModel}
     */
    static deepCopyGraphModel(src) {
        const result = new GraphModel(
            src.data.maxId, src.getTitle(), src.getDesc(), src.getCaseReason(), src.getCaseNumber(),
            Array.of(), Array.of(), Array.of(), Array.of());
        // 处理链体
        src.getBodyArray().forEach((body) => {
            const tmp = new BodyModel(body.data.x, body.data.y, body.getId(),
                body.getName(), body.getContent(), body.getEvidenceType(), body.getCommitter(),
                body.getEvidenceReason(), body.getEvidenceConclusion());
            result.getBodyArray().push(tmp);
        });
        // 处理链头
        src.getHeaderArray().forEach((header) => {
            const tmp = new HeaderModel(header.data.x1, header.data.y1,
                header.data.x2, header.data.y2,
                header.getId(), header.getName(), header.getContent(), header.getKeySentence());
            result.getHeaderArray().push(tmp);
        });
        // 处理箭头
        src.getArrowArray().forEach((arrow) => {
            const tmp = new ArrowModel(arrow.data.x1, arrow.data.y1, arrow.data.x2, arrow.data.y2,
                arrow.getId(), arrow.getName(), arrow.getContent());
            result.getArrowArray().push(tmp);
        });
        // 处理连接点
        src.getJointArray().forEach((joint) => {
            const tmp = new JointModel(joint.data.x, joint.data.y,
                joint.getId(), joint.getName(), joint.getContent());
            result.getJointArray().push(tmp);
        });

        // 处理连接
        result.getBodyArray().forEach((body) => {
            body.bindConnectedItems(result);
        });
        result.getHeaderArray().forEach((header) => {
            header.bindConnectedItems(result);
        });
        result.getArrowArray().forEach((arrow) => {
            arrow.bindConnectedItems(result);
        });
        result.getJointArray().forEach((joint) => {
            joint.bindConnectedItems(result);
        });
        return result;
    }

    // 简单拷贝一个元素的基本属性，不涉及元素之间的连接等问题，注意，id也被复制了
    static simpleCopyElement(src) {
        switch (src.data.type) {

            case ElementType.BODY:
                return new BodyModel(
                    src.data.x, src.data.y, src.getId(),
                    src.getName(), src.getContent(), src.getEvidenceType(), src.getCommitter(),
                    src.getEvidenceReason(), src.getEvidenceConclusion());

            case ElementType.HEADER:
                return new HeaderModel(
                    src.data.x1, src.data.y1, src.data.x2, src.data.y2,
                    src.getId(), src.getName(), src.getContent(), src.getKeySentence());

            case ElementType.ARROW:
                return new ArrowModel(
                    src.data.x1, src.data.y1, src.data.x2, src.data.y2,
                    src.getId(), src.getName(), src.getContent());

            case ElementType.JOINT:
                return new JointModel(
                    src.data.x, src.data.y, src.getId(), src.getName(), src.getContent());

            default:
                return null;
        }
    }

    // 复制元素的基本属性并分配一个新Id
    static copyElementWithNewId(src, graphModel) {
        const result = this.simpleCopyElement(src);
        result.data.id = graphModel.fetchNextId();
        return result;
    }

    // 传入剪贴板中的元素以及鼠标的坐标，将model的坐标修改好，不返回任何对象
    static refreshPositionOfPasteElement(model, x, y) {
        switch (model.data.type) {
            case ElementType.BODY:
                model._setX(x - (GraphVal.RECT_WIDTH / 2));
                model._setY(y - (GraphVal.RECT_HEIGHT / 2));
                break;
            case ElementType.HEADER:
            case ElementType.ARROW:
                model._setX2(x);
                model._setY2(y);
                model._setX1(x);
                model._setY1(y + GraphVal.DEFAULT_HEIGHT);
                break;
            case ElementType.JOINT:
                model._setX(x - (GraphVal.SQUARE_SIDE / 2));
                model._setY(y - (GraphVal.SQUARE_SIDE / 2));
                break;
            default: break;
        }
    }
}
