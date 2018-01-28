/**
 * Created by apple on 2017/4/5.
 */

// 引入共同需要的模块
require('../assets/common');

// import css
require('../css/list.css');

class ListController {
    static newInstance() {
        return new ListController();
    }
}
// run
$(document).ready(() => {
    ListController.newInstance();
});
