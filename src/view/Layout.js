/**
 * Created by zgw on 2017/2/19.
 */
import ElementModel from '../model/ElementModel'
import {ElementType, GraphVal, Neighbour} from '../assets/constants'


class Layout {
    static neighbourLayout(graphModel) {

        // 设置全部元素没有访问
        for (let ele of graphModel.getHeaderArray()) {
            ele._setVisited(false);
        }
        for (let ele of graphModel.getBodyArray()) {
            ele._setVisited(false);
        }
        for (let ele of graphModel.getJointArray()) {
            ele._setVisited(false);
        }
        for (let ele of graphModel.getArrowArray()) {
            ele._setVisited(false);
        }


        // 得到最大出度的连接点/链头
        let findMaxDegreeElement = function (graphModel) {
            let element = null;
            let max = -1;
            if (!!graphModel.getHeaderArray()) {
                for (let ele of graphModel.getHeaderArray()) {
                    if (max < ele._getDegrees() && !ele._getVisited()) {
                        element = ele;
                        max = ele._getDegrees();
                    }
                }
            }

            if (!!graphModel.getJointArray()) {
                for (let ele of graphModel.getJointArray()) {
                    if (max < ele._getDegrees() && !ele._getVisited()) {
                        element = ele;
                        max = ele._getDegrees();
                    }
                }
            }
            return {element: element, max: max};
        };

        // 判断是否所有连接点/链头都访问过
        let visitedAll = function (graphModel) {
            if (!!graphModel.getHeaderArray()) {
                for (let ele of graphModel.getHeaderArray()) {
                    if (!ele._getVisited()) {
                        return false;
                    }
                }
            }

            if (!!graphModel.getJointArray()) {
                for (let ele of graphModel.getJointArray()) {
                    if (!ele._getVisited()) {
                        return false;
                    }
                }
            }
            return true;
        };

        // 遍历所有连通分量,一个连通分量一层,层按y坐标展开
        let layer_start_x = Neighbour.LAYER_START_X; // 记录每一层的开始x坐标
        let layer_start_y = Neighbour.LAYER_START_Y; // 记录每一层的开始y坐标
        while (!visitedAll(graphModel)) {
            let queue = new PriorityQueue();
            let ret = findMaxDegreeElement(graphModel);
            let ele = ret.element, max = ret.max;
            queue.enqueue(ele, max);

            // 最后做整体平移
            ele._setX(layer_start_x);
            ele._setY(layer_start_y);
            // 顺时针为正方向
            ele._setStartAngle(Neighbour.START_ANGLE);

            // 每次寻找周围拥有最大度的链头/连接点
            while (!queue.isEmpty()) {
                let ele = queue.dequeue();
                let fatherStartAngle = ele._getStartAngle();
                ele._setVisited(true);

                layer_start_y = Math.max(layer_start_y, ele.getType() === ElementType.JOINT ? ele._getY() : ele._getY2());

                let arrows = ele.getArrowArray();
                if (!!arrows) {
                    for (let i = 0; i < arrows.length; i++) {
                        let arrow = arrows[i];

                        let angle = i * ele._getAlpha() + fatherStartAngle;

                        if (!arrow._getVisited()) {
                            if (ele.getType() === ElementType.HEADER) {
                                arrow._setX1(ele._getX2());
                                arrow._setY1(ele._getY2());
                                arrow._setX2(Math.cos(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getX2());
                                arrow._setY2(Math.sin(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getY2());
                                if (!!arrow.getJoint() && !arrow.getJoint()._getVisited()) {

                                    arrow.getJoint()._setStartAngle(angle - 180);
                                    arrow.getJoint()._setX(Math.cos(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getX2());
                                    arrow.getJoint()._setY(Math.sin(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getY2());

                                    queue.enqueue(arrow.getJoint(), arrow.getJoint()._getDegrees());
                                }

                            }
                            else if (ele.getType() === ElementType.JOINT) {
                                arrow._setX2(ele._getX());
                                arrow._setY2(ele._getY());
                                arrow._setX1(Math.cos(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getX());
                                arrow._setY1(Math.sin(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getY());
                                if (!!arrow.getHeader() && !arrow.getHeader()._getVisited()) {

                                    arrow.getHeader()._setStartAngle(angle - 180);
                                    arrow.getHeader()._setX2(Math.cos(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getX());
                                    arrow.getHeader()._setY2(Math.sin(angle * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT + ele._getY());
                                    // 链头的尾部坐标到以链头尾中心向外探索时再设置

                                    queue.enqueue(arrow.getHeader(), arrow.getHeader()._getDegrees());
                                }
                            }
                            arrow._setVisited(true);
                        }
                    }
                }

                if (ele.getType() === ElementType.HEADER) {

                    // body在链头的初始角度+180°方向画
                    if (!!ele.getBody() && !ele.getBody()._getVisited()) {
                        ele.getBody()._setX(Math.cos((ele._getStartAngle() + 180) * Neighbour.K_RADIAN) * Neighbour.HEADER2BODY + ele._getX2());
                        ele.getBody()._setY(Math.sin((ele._getStartAngle() + 180) * Neighbour.K_RADIAN) * Neighbour.HEADER2BODY + ele._getY2());
                        ele.getBody()._setVisited(true);
                    }

                    if (!!ele.getBody()) {
                        ele._setX1(ele.getBody()._getX());
                        ele._setY1(ele.getBody()._getY());
                    } else {
                        ele._setX1(Math.cos((ele._getStartAngle() + 180) * Neighbour.K_RADIAN) * Neighbour.HEADER2BODY + ele._getX2());
                        ele._setY1(Math.sin((ele._getStartAngle() + 180) * Neighbour.K_RADIAN) * Neighbour.HEADER2BODY + ele._getY2());
                    }


                }
            }

            layer_start_y += Neighbour.LAYER_DELTA_Y;
        }

        // 补上游离态的链体/箭头,游离态横向展开
        for (let body of graphModel.getBodyArray()) {
            if (!body._getVisited()) {
                body._setX(layer_start_x);
                body._setY(layer_start_y);
                layer_start_x += (GraphVal.RECT_WIDTH + Neighbour.LAYER_DELTA_X);
                body._setVisited(true);
            }
        }

        // 箭头摆在下一层
        layer_start_x = Neighbour.LAYER_START_X;
        layer_start_y += (GraphVal.RECT_HEIGHT + Neighbour.LAYER_DELTA_Y);


        for (let arrow of graphModel.getArrowArray()) {
            if (!arrow._getVisited()) {
                arrow._setX1(layer_start_x);
                arrow._setY1(layer_start_y);
                layer_start_x += (Neighbour.HEADER2JOINT + Neighbour.LAYER_DELTA_X);
                arrow._setVisited(true);
            }
        }

        // 坐标整体平移
        // 先得到最小的

        Layout.adjustCoordinate(graphModel);

        return graphModel;
    }

    static neighbourLayout2(graphModel) {

        // 设置全部元素没有访问
        let elementArray = graphModel.getElementArray();
        for (let ele of elementArray) {
            ele._setVisited(0);
            ele._setStartAngle(0);
            ele._setAdjusted(false);
        }


        // 得到最大出度的连接点/链头
        let findMaxDegreeElement = function (graphModel) {
            let element = null;
            let max = -1;
            if (!!graphModel.getBodyArray()) {
                for (let ele of graphModel.getBodyArray()) {
                    if (max < ele._getDegrees() && ele._getVisited() !== -1) {
                        element = ele;
                        max = ele._getDegrees();
                    }
                }
            }

            if (!!graphModel.getJointArray()) {
                for (let ele of graphModel.getJointArray()) {
                    if (max < ele._getDegrees() && ele._getVisited() !== -1) {
                        element = ele;
                        max = ele._getDegrees();
                    }
                }
            }
            return {element: element, max: max};
        };

        // 判断是否所有连接点/链头都访问过
        let visitedAll = function (graphModel) {
            if (!!graphModel.getBodyArray()) {
                for (let ele of graphModel.getBodyArray()) {
                    if (ele._getVisited() !== -1) {
                        return false;
                    }
                }
            }

            if (!!graphModel.getJointArray()) {
                for (let ele of graphModel.getJointArray()) {
                    if (ele._getVisited() !== -1) {
                        return false;
                    }
                }
            }
            return true;
        };

        // 遍历所有连通分量,一个连通分量一层,层按y坐标展开
        let layer_start_x = Neighbour.LAYER_START_X; // 记录每一层的开始x坐标
        let layer_start_y = Neighbour.LAYER_START_Y; // 记录每一层的开始y坐标
        while (!visitedAll(graphModel)) {
            let queue = new PriorityQueue();
            let ret = findMaxDegreeElement(graphModel);
            let ele = ret.element, max = ret.max;
            queue.enqueue(ele, max);

            // 最后做整体平移
            ele._setX(layer_start_x);
            ele._setY(layer_start_y);
            // 顺时针为正方向
            ele._setStartAngle(Neighbour.START_ANGLE);


            // 每次寻找周围拥有最大度的链体/连接点
            while (!queue.isEmpty()) {
                let ele = queue.dequeue();
                let clockPara = ele._getClockPara();
                let fatherStartAngle = ele._getStartAngle();
                let neighbours = ele._getNeighbours();


                let delta = !!neighbours && neighbours.length > 1 ? 180 / (neighbours.length - 1) : 180;

                ele._setVisited(-1);

                layer_start_y = Math.max(layer_start_y, ele._getY());


                for (let i = 0; i < neighbours.length; i++) {
                    let neighbour = neighbours[i];
                    if (neighbour._getVisited() !== -1) {

                        // 多次出现取几何中心
                        let angle = fatherStartAngle + clockPara * delta * i;
                        neighbour._setStartAngle(
                            (angle - 180 + neighbour._getVisited() * neighbour._getStartAngle()) / (neighbour._getVisited() + 1)
                        );
                        neighbour._setX(
                            (ele._getX() + Math.cos(angle * Neighbour.K_RADIAN) * Neighbour.BODY2JOINT
                            + neighbour._getX() * neighbour._getVisited()) / (neighbour._getVisited() + 1)
                        );

                        neighbour._setY(
                            (ele._getY() + Math.sin(angle * Neighbour.K_RADIAN) * Neighbour.BODY2JOINT
                            + neighbour._getY() * neighbour._getVisited()) / (neighbour._getVisited() + 1)
                        );
                        neighbour._setVisited(neighbour._getVisited() + 1);

                        queue.enqueue(neighbour, neighbour._getDegrees());

                    }

                }

            }

            // 依旧冲突的坐标使用碰撞检测区分位置
            Layout.adjustCollision(graphModel);

            layer_start_y += Neighbour.LAYER_DELTA_Y;

        }


        // 设置链头坐标，先设置有链体的，这里会重合
        for (let body of graphModel.getBodyArray()) {
            let joints = body.getNeighbourJoint();
            // 对于有连接点的，在连接点和链头的中垂线上画图
            if (!!joints && joints.length > 0) {
                for (let joint of joints) {
                    let headers = body.getHeaderArray2Joint(joint);
                    let delta = 180 / (headers.length + 1);
                    let alpha = 0;
                    let distance = Math.sqrt((body._getX() - joint._getX()) * (body._getX() - joint._getX()) + (body._getY() - joint._getY()) * (body._getY() - joint._getY())) / 2;
                    if (body._getX() !== joint._getX()) {
                        let k = (body._getY() - joint._getY()) / (body._getX() - joint._getX());
                        alpha = 90 - Math.atan(k) * 180 / Math.PI;
                    } else {
                        alpha = 0;
                    }


                    for (let i = 0; i < headers.length; i++) {
                        let header = headers[i];
                        if (header._getVisited() !== -1) {
                            header._setX1(body._getX());
                            header._setY1(body._getY());

                            header._setX2((body._getX() + joint._getX()) / 2 + distance / Math.tan(delta * (i + 1) * Neighbour.K_RADIAN) * Math.cos(alpha * Neighbour.K_RADIAN));
                            header._setY2((body._getY() + joint._getY()) / 2 + distance / Math.tan(delta * (i + 1) * Neighbour.K_RADIAN) * Math.sin(alpha * Neighbour.K_RADIAN));

                            header._setVisited(-1);
                        }
                    }
                }
            }
            let headers = body.getHeaderArray();

            let delta = 180 / (headers.length + 1);

            for (let i = 0; i < headers.length; i++) {
                let header = headers[i];
                if (header._getVisited() !== -1) {
                    header._setX1(body._getX());
                    header._setY1(body._getY());
                    header._setX2(body._getX() + Math.cos((body._getStartAngle() + delta * (i + 1)) * Neighbour.K_RADIAN) * Neighbour.HEADER2BODY);
                    header._setY2(body._getY() + Math.sin((body._getStartAngle() + delta * (i + 1)) * Neighbour.K_RADIAN) * Neighbour.HEADER2BODY);
                    header._setVisited(-1);
                }
            }

        }


        // 没有链体但是有连接点的链头，顺着连接点分布。游离态的链头,游离态横向展开
        for (let header of graphModel.getHeaderArray()) {
            if (header._getVisited() !== -1) {
                header._setVisited(-1);
                let joints = header._getNeighbourJoint();
                if (!joints && joints.length > 0) {
                    let joint = joints[0];
                    header._setX1(joint._getX() + Math.cos((joint._getStartAngle() - 180) * Neighbour.K_RADIAN) * (Neighbour.HEADER2JOINT + Neighbour.HEADER2BODY));
                    header._setY1(joint._getY() + Math.sin((joint._getStartAngle() - 180) * Neighbour.K_RADIAN) * (Neighbour.HEADER2JOINT + Neighbour.HEADER2BODY));
                    header._setX2(joint._getX() + Math.cos((joint._getStartAngle() - 180) * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT);
                    header._setY2(joint._getY() + Math.sin((joint._getStartAngle() - 180) * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT);
                } else {
                    header._setX1(layer_start_x);
                    header._setY1(layer_start_y);
                    header._setX2(layer_start_x + Neighbour.HEADER2BODY);
                    header._setY2(layer_start_y);
                    layer_start_x += (2 * Neighbour.HEADER2BODY + Neighbour.LAYER_DELTA_X);
                }

            }
        }


        // 游离态箭头摆在下一层
        layer_start_x = Neighbour.LAYER_START_X;
        layer_start_y += (GraphVal.RECT_HEIGHT + Neighbour.LAYER_DELTA_Y);

        // 设置箭头坐标
        for (let arrow of graphModel.getArrowArray()) {
            if (arrow._getVisited() !== -1) {
                arrow._setVisited(-1);
                if (!!arrow.getHeader() && !!arrow.getJoint()) {
                    arrow._setX1(arrow.getHeader()._getX2());
                    arrow._setY1(arrow.getHeader()._getY2());
                    arrow._setX2(arrow.getJoint()._getX());
                    arrow._setY2(arrow.getJoint()._getY());
                }
                else if (!!arrow.getHeader() && !arrow.getJoint()) {
                    arrow._setX1(arrow.getHeader()._getX2());
                    arrow._setY1(arrow.getHeader()._getY2());
                    arrow._setX2(arrow.getHeader()._getX2() + Neighbour.HEADER2JOINT);
                    arrow._setY2(arrow.getHeader()._getY2());
                }
                else if (!arrow.getHeader() && !!arrow.getJoint()) {
                    arrow._setX1(arrow.getJoint()._getX() + Math.cos(arrow.getJoint()._getStartAngle() * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT);
                    arrow._setY1(arrow.getJoint()._getY() + Math.sin(arrow.getJoint()._getStartAngle() * Neighbour.K_RADIAN) * Neighbour.HEADER2JOINT);
                    arrow._setX2(arrow.getJoint()._getX());
                    arrow._setY2(arrow.getJoint()._getY());
                } else {
                    arrow._setX1(layer_start_x);
                    arrow._setY1(layer_start_y);
                    arrow._setX2(layer_start_x + Neighbour.HEADER2JOINT);
                    arrow._setY2(layer_start_y);
                    layer_start_x += (2 * Neighbour.HEADER2JOINT + Neighbour.LAYER_DELTA_X);
                }
            }

        }

        // 坐标整体平移
        // 先得到最小的

        Layout.adjustCoordinate(graphModel);

        Layout.adjustCollision(graphModel);

        Layout.adjustHeaderAndArrow(graphModel);

        return graphModel;
    }

    // 调整链体和连接点，避免碰撞
    static adjustCollision(graphModel) {
        let bodyArray = graphModel.getBodyArray();
        let jointArray = graphModel.getJointArray();
        let headerArray = graphModel.getHeaderArray();
        let map = {};
        let base = 10001;
        for (let body of bodyArray) {
            if (body._getVisited() === -1) {
                body._setX(Math.round(body._getX()));
                body._setY(Math.round(body._getY()));
                while (map[body._getX() * base + body._getY()]) {
                    body._setX(body._getX() + Neighbour.BODY2BODY);
                    body._setY(body._getY() + Neighbour.BODY2BODY);
                }
                map[body._getX() * base + body._getY()] = body.getId();
            }
        }

        for (let joint of jointArray) {
            if (joint._getVisited() === -1) {
                joint._setX(Math.round(joint._getX()));
                joint._setY(Math.round(joint._getY()));
                while (map[joint._getX() * base + joint._getY()]) {
                    joint._setX(joint._getX() + Neighbour.JOINT2JOINT);
                    joint._setY(joint._getY() + Neighbour.JOINT2JOINT);
                }
                map[joint._getX() * base + joint._getY()] = joint.getId();
            }
        }

        for (let header of headerArray) {
            if (header._getVisited() === -1) {
                header._setX2(Math.round(header._getX2()));
                header._setY2(Math.round(header._getY2()));
                while (map[header._getX2() * base + header._getY2()]) {
                    header._setX2(header._getX2() + Neighbour.HEADER2HEADER);
                    header._setY2(header._getY2() + Neighbour.HEADER2HEADER);
                }
                map[header._getX2() * base + header._getY2()] = header.getId();
            }
        }


        return graphModel;
    }

    // 按照层次调整
    static adjustCoordinate(graphModel) {
        {
            let minX = 99999999;
            let minY = 99999999;

            let elementArray = graphModel.getElementArray();

            for (let ele of elementArray) {
                if (ele._getVisited() === -1 && !ele._getAdjusted()) {
                    switch (ele.getType()) {
                        case ElementType.HEADER:
                        case ElementType.ARROW:
                            minX = Math.min(ele._getX1(), ele._getX2(), minX);
                            minY = Math.min(ele._getY1(), ele._getY2(), minY);
                            break;
                        case ElementType.BODY:
                        case ElementType.JOINT:
                            minX = Math.min(ele._getX(), minX);
                            minY = Math.min(ele._getY(), minY);
                            break;
                    }
                }
            }

            let deltaX = Neighbour.LAYER_START_X - minX;
            let deltaY = Neighbour.LAYER_START_Y - minY;

            for (let ele of elementArray) {
                if (ele._getVisited() === -1 && !ele._getAdjusted()) {
                    switch (ele.getType()) {
                        case ElementType.HEADER:
                        case ElementType.ARROW:
                            ele._setX1(ele._getX1() + deltaX);
                            ele._setX2(ele._getX2() + deltaX);
                            ele._setY1(ele._getY1() + deltaY);
                            ele._setY2(ele._getY2() + deltaY);
                            break;
                        case ElementType.BODY:
                        case ElementType.JOINT:
                            ele._setX(ele._getX() + deltaX);
                            ele._setY(ele._getY() + deltaY);
                            break;
                    }
                    ele._setAdjusted(true);
                }
            }
        }

        return graphModel;
    }

    static adjustHeaderAndArrow(graphModel) {
        let elementArray = graphModel.getElementArray();

        for (let ele of elementArray) {
            if (ele._getVisited() === -1) {
                switch (ele.getType()) {
                    case ElementType.HEADER:
                    case ElementType.ARROW:
                        ele.adjustCoordinate();
                        break;

                }
            }
        }
    }

    static springLayout(graphModel) {

        // 1 graphModel -> nodes
        let nodes = Array.of();
        let links = Array.of();

        for (let body of graphModel.getBodyArray()) {
            nodes.push({id: body.getId(), type: body.getType(), x: body._getX(), y: body._getY()});
        }
        for (let joint of graphModel.getJointArray()) {
            nodes.push({id: joint.getId(), type: joint.getType(), x: joint._getX(), y: joint._getY()});
        }
        for (let header of graphModel.getHeaderArray()) {
            nodes.push({id: header.getId(), type: header.getType(), x: header._getX2(), y: header._getY2()});

            if (!header.getBody()) {
                nodes.push({
                    id: -header.getId(),
                    type: header.getType(),
                    x: header._getX1(),
                    y: header._getY1(),
                });

            }

            links.push({
                id: header.getId(),
                type: header.getType(),
                startId: header.getId(),
                endId: !!header.getBody() ? header.getBody().getId() : -header.getId()
            });
        }
        for (let arrow of graphModel.getArrowArray()) {

            if (!arrow.getHeader()) {
                nodes.push({
                    id: (-arrow.getId()) + 'header',
                    type: arrow.getType(),
                    x: arrow._getX2(),
                    y: arrow._getY2()
                });
            }

            if (!arrow.getJoint()) {
                nodes.push({
                    id: (-arrow.getId()) + 'joint',
                    type: arrow.getType(),
                    x: arrow._getX1(),
                    y: arrow._getY1()
                });
            }

            links.push({
                id: arrow.getId(),
                type: arrow.getType(),
                startId: !!arrow.getJoint() ? arrow.getJoint().getId() : (-arrow.getId() + 'joint'),
                endId: !!arrow.getHeader() ? arrow.getHeader().getId() : (-arrow.getId() + 'header')
            });
        }


        //4.反复2,3步 迭代300次
        for (let i = 0; i < 10; i++) {
            nodes = Layout.springIterate(nodes, links);
        }


        // 还原坐标
        for (let node of nodes) {
            let ele = graphModel.getElementById(node.type, node.id);
            if (!!ele && !$.isEmptyObject(ele)) {
                switch (ele.getType()) {
                    case ElementType.BODY:
                        ele._setX(node.x);
                        ele._setY(node.y);
                        break;
                    case ElementType.JOINT:
                        ele._setX(node.x);
                        ele._setY(node.y);
                        break;
                    case ElementType.HEADER:
                        ele._setX2(node.x);
                        ele._setY2(node.y);
                        break;
                }
            }
        }

        for (let edge of links) {
            let ele = graphModel.getElementById(edge.type, edge.id);
            if (!!ele) {
                let startNode = Layout.findNodeById(nodes, edge.startId);
                let endNode = Layout.findNodeById(nodes, edge.endId);
                switch (ele.getType()) {
                    case ElementType.HEADER:
                        ele._setX1(endNode.x);
                        ele._setY1(endNode.y);
                        break;
                    case ElementType.ARROW:
                        ele._setX1(startNode.x);
                        ele._setY1(startNode.y);
                        ele._setX2(endNode.x);
                        ele._setY2(endNode.y);
                        break;
                }
            }
        }


        Layout.adjustCoordinate(graphModel);

        return graphModel;

    }

    static findNodeById(nodes, id) {

        for (let node of nodes) {
            if (node.id === id) {
                return node;
            }
        }

        return null;
    };

    static springIterate(nodes, edges) {


        //2计算每次迭代局部区域内两两节点间的斥力所产生的单位位移（一般为正值）
        let area = 800 * 600;
        let k = Math.sqrt(area / nodes.length);
        let diffx, diffy, diff;

        let dispx = {};
        let dispy = {};

        let ejectfactor = 2;

        for (let node of nodes) {

            dispx[node.id] = 0;
            dispy[node.id] = 0;

            for (let node2 of nodes) {
                if (node != node2) {
                    diffx = node.x - node2.x;
                    diffy = node.y - node2.y;

                    diff = Math.sqrt(diffx * diffx + diffy * diffy);

                    if (diff < 30)
                        ejectfactor = 5;

                    if (diff > 0 && diff < 250) {
                        let id = node.id;
                        dispx[id] += diffx / diff * k * k / diff * ejectfactor;
                        dispy[id] += diffy / diff * k * k / diff * ejectfactor;
                    }
                }
            }
        }
        //3. 计算每次迭代每条边的引力对两端节点所产生的单位位移（一般为负值）
        let condensefactor = 1;
        let visnodeS = null, visnodeE = null;

        for (let edge of edges) {
            let eStartID = edge.startId;
            let eEndID = edge.endId;


            visnodeS = Layout.findNodeById(nodes, eStartID);
            visnodeE = Layout.findNodeById(nodes, eEndID);

            diffx = visnodeS.x - visnodeE.y;
            diffy = visnodeS.x - visnodeE.y;
            diff = Math.sqrt(diffx * diffx + diffy * diffy);

            dispx[eStartID] -= diffx * diff / k * condensefactor;
            dispy[eStartID] -= diffy * diff / k * condensefactor;

            dispx[eEndID] += diffx * diff / k * condensefactor;
            dispy[eEndID] += diffy * diff / k * condensefactor;

        }

        //set x,y
        let maxt = 4, maxty = 3;
        for (let node of nodes) {

            let dx = dispx[node.id];
            let dy = dispy[node.id];

            let disppx = Math.floor(dx);
            let disppy = Math.floor(dy);
            if (disppx < -maxt)
                disppx = -maxt;
            if (disppx > maxt)
                disppx = maxt;
            if (disppy < -maxty)
                disppy = -maxty;
            if (disppy > maxty)
                disppy = maxty;

            node.x += disppx;
            node.y += disppy;
        }

        return nodes;
    }

}

// 优先队列，效率待提升
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    compare(queueElement1, queueElement2) {
        if (queueElement1.priority > queueElement2.priority) {
            return true;
        } else if (queueElement1.priority < queueElement2.priority) {
            return false;
        } else {
            if (queueElement1.element.getType() === queueElement2.element.getType()) {
                return queueElement1.element.getId() < queueElement2.element.getId(); //id小的优先画
            } else {
                return queueElement1 == ElementType.BODY;
            }

        }
    }

    enqueue(element, priority) {

        if (element.getType() !== ElementType.JOINT && element.getType() !== ElementType.BODY) {
            console.log('进入优先队列的元素有误');
        }

        let queueElement = {element: element, priority: priority};
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.compare(queueElement, this.items[i])) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(queueElement);
        }
    };

    dequeue() {
        let ele = this.items.shift();
        return !!ele ? ele.element : null;
    };


    isEmpty() {
        return this.items.length == 0;
    };

    size() {
        return this.items.length;
    };


}

export {Layout}
