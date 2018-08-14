const {SUCCESS, FAILED, CNF} = require("./constants")
const debug = require('debug');
const assert = require('assert');
const db = require("../tools/db")
const dateUtil = require("../utils/dateUtil")

/**
 * 删除任务
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function del(ctx, next) {
    let {uid, id} = ctx.query;
    await db.del(CNF.DB_TABLE.task_info, {id: id, uid: uid}, function (res) {
        SUCCESS(ctx, res);
    }).catch(function (error) {
        console.error(error);
        FAILED(ctx, error);
    })
}


/**
 * 创建任务
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function create(ctx, next) {
    let taskinfo = ctx.request.body;
    await db.create(CNF.DB_TABLE.task_info, taskinfo, function (res) {
        assert.notEqual(res, -1, "create task fail");
        SUCCESS(ctx, res);
    }).catch(function (error) {
        console.error(error);
        FAILED(ctx, error);
    })
}

/**
 * 更新任务信息
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function update(ctx, next) {
    let reqinfo = ctx.request.body;
    let taskinfo = {};
    if (reqinfo.taskName) {
        taskinfo.taskName = reqinfo.taskName;
    }
    if (reqinfo.startTime) {
        taskinfo.startTime = reqinfo.startTime;
    }
    if (reqinfo.endTime) {
        taskinfo.endTime = reqinfo.endTime;
    }
    if (reqinfo.stat) {updateTaskInfo
        taskinfo.stat = reqinfo.stat;
    }
    preUpdateTask(reqinfo, taskinfo);
    let condition = {
        version: reqinfo.version,
        uid: reqinfo.uid,
        id: reqinfo.id
    }
    await db.update(CNF.DB_TABLE.task_info, taskinfo, condition, function (res) {
        assert.notEqual(res, -1, "update task fail");
        SUCCESS(ctx, res);
    }).catch(function (error) {
        console.error(error);
        FAILED(ctx, error);
    })
}

/**
 *
 * @param taskinfo
 * @returns {Promise<*>}
 */
async function preUpdateTask(reqinfo, taskinfo) {
    var taskinfo = taskinfo || {};
    //启动任务
    if (reqinfo && reqinfo.stat == 1) {
        await db.getById(CNF.DB_TABLE.task_info, reqinfo.id, async function (res) {
            var nowTime = dateUtil.nowTime();
            taskinfo.assignerUid = res[0].uid;
            taskinfo.assignerName = res[0].realName;
            taskinfo.assignTime = nowTime
            taskinfo.startTime = nowTime
            taskinfo.planEndTime = dateUtil.dateAdd(nowTime, res[0].planHour || 0);
        })
    } else if (reqinfo && reqinfo.stat == 2) {//任务完成
        taskinfo.endTime = dateUtil.nowTime();
    }
    return taskinfo;
}

/**
 *  查询任务列表
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function query(ctx, next) {
    let condition = ctx.request.body;
    await db.geByCondition(CNF.DB_TABLE.task_info, condition, function (res) {
        SUCCESS(ctx, convert(res));
    }).catch(function (error) {
        console.error(error);
        FAILED(ctx, error);
    })
}

function convert(res) {
    if (res && res.length > 0) {
        res.forEach(function (item, index) {
            if (item.create_time) {
                item.create_time = dateUtil.formatTime(new Date(item.create_time))
            }
            if (item.update_time) {
                item.update_time = dateUtil.formatTime(new Date(item.update_time))
            }
            if (item.assignTime) {
                item.assignTime = dateUtil.formatTime(new Date(item.assignTime))
            }
            if (item.planEndTime) {
                item.planEndTime = dateUtil.formatTime(new Date(item.planEndTime))
                //剩余时间负数说明超时了
                item.remainTime = dateUtil.dateDiff(item.planEndTime, dateUtil.nowTime())+dateUtil.dateUnit();
            }
            if (item.endTime) {
                item.endTime = dateUtil.formatTime(new Date(item.endTime))
            }
            if (item.startTime) {
                item.startTime = dateUtil.formatTime(new Date(item.startTime))
            }

            if (item.level == 1) {
                item.levelText = "一级";
            } else if (item.level == 2) {
                item.levelText = "二级";
            } else if (item.level == 3) {
                item.levelText = "三级";
            }
        })
    }
    return res;
}

module.exports = {
    del,
    create,
    update,
    query
}