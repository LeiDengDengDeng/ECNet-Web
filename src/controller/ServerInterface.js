/**
 * Created by zgw on 2017/3/20.
 */

import {URL} from '../assets/constants';

export default class ServerInterface {

    // ECM存后台
    static saveLogic2Server(graphModel) {
        $.ajax({
            type: 'POST',
            url: URL.SAVE_LOGIC,
            data: graphModel || {},
            success(data) {
                alert(data);
            },
            error(data) {
                alert(`save Logic error:${data.responseText}`);
            },
        });
    }
    static getLogicModel(id, callback) {
        $.ajax({
            type: 'GET',
            url: `${URL.FIND_LOGIC_DETAIL}/${id}`,
            success(data) {
                callback(data);
            },
            error(data) {
                alert(`find Logic error:${data.responseText}`);
            },
        });
    }
    // ECM存后台
    static saveECM2Server(graphModel) {
        $.ajax({
            type: 'POST',
            url: URL.SAVE_ECM,
            data: graphModel.modelToXMLStyleObject() || {},
            success(data) {
                alert(data);
            },
            error(data) {
                alert(`save ECM error:${data.responseText}`);
            },
        });
    }

    static updateECMModel(graphModel) {
        console.log('updateing ...')
        $.ajax({
            type: 'POST',
            url: URL.UPDATE_ECM,
            data: graphModel.modelToXMLStyleObject() || {},
            success(data) {
                alert(data);
            },
            error(data) {
                alert(`update ECM error:${data.responseText}`);
            },
        });
    }

    static getECMModel(id, callback) {
        $.ajax({
            type: 'GET',
            url: `${URL.FIND_ECM_DETAIL}/${id}`,
            success(data) {
                callback(data);
            },
            error(data) {
                alert(`find ECM error:${data.responseText}`);
            },
        });
    }
}
