import mongoose from 'mongoose';
import returnStatus from '../cores/returnStatus.js';
import PendingModel from '../models/pending.js';
import GroupModel from '../models/group.js';

class PendingController {
  /**
   * Create a pending
   * POST /api/pending
   * BODY { userId, groupId, content, date, money, bank }
   */
  async create(req, res) {
    const { userId, content, date, money, bank, groupId } = req.body;
    if (!groupId) return returnStatus(res, 400);
    try {
      const newDate = new Date(date);
      if (isNaN(newDate) || typeof money !== 'number') return returnStatus(res, 400);
      const foundGroup = await GroupModel.aggregate([
        {
          $lookup: {
            from: 'members',
            foreignField: 'groupId',
            localField: '_id',
            as: 'members'
          }
        }, {
          $match: {
            _id: mongoose.Types.ObjectId(groupId),
            "members.userId": mongoose.Types.ObjectId(userId),
          }
        }
      ])

      if (!foundGroup || foundGroup.length === 0) return returnStatus(res, 403);
      const response = await PendingModel.create({ content, bank, money, date: newDate, groupId })
      await GroupModel.updateOne({_id: foundGroup[0]._id}, {baseMoney: foundGroup[0].baseMoney + money})
      return returnStatus(res, 200, response);
    } catch (err) {

      return returnStatus(res, 500);
    }
  }

  /**
   * Update a pending
   * PUT /api/pending/:pendingId
   * BODY { userId, content, date, money, bank }
   */
  async update(req, res) {
    const { userId, content, date, money, bank } = req.body;
    const { pendingId } = req.params;
    if (!pendingId || !userId || (!content && !date && !money && !bank)) return returnStatus(res, 400);

    try {
      if (date && isNaN(new Date(date))) return returnStatus(res, 400);
      const foundPending = await PendingModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(pendingId)
          }
        },
        {
          $lookup: {
            from: 'groups',
            localField: 'groupId',
            foreignField: '_id',
            as: 'groups',
          }
        },
        {
          $lookup: {
            from: 'members',
            localField: 'groups._id',
            foreignField: 'groupId',
            as: 'members',
          }
        }, {
          $match: {
            "members.userId": mongoose.Types.ObjectId(userId)
          }
        }, {
          $project: {
            _id: 1,
            "groups._id": 1,
            "groups.baseMoney": 1,
          }
        }
      ]);

      if (foundPending.length === 0 || !foundPending[0].groups[0]._id) return returnStatus(res, 403);

      
      const oldPending = await PendingModel.findOneAndUpdate({ _id: pendingId }, { content, date: new Date(date), money, bank });

      
      if(oldPending && money !== undefined) {
        console.log({oldPending, money, foundPending: foundPending[0].groups, sum: foundPending[0].groups[0].baseMoney - oldPending.money + money})
        await GroupModel.updateOne({_id: foundPending[0].groups[0]._id}, {baseMoney: foundPending[0].groups[0].baseMoney - oldPending.money + money })
      }
      
      return returnStatus(res, 200, {oldPending, money, foundPending});

    } catch (err) {
      console.log('[PENDING UPDATE ERROR', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * GET pending
   * GET /api/pending?groupId&month&year
   * BODY { userId }
   */
  async get(req, res) {
    const { userId } = req.body;
    const { month, year, groupId } = req.query;

    if (!userId || !groupId) return returnStatus(res, 400);
    try {
      const foundGroup = await GroupModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(groupId)
          }
        }, {
          $lookup: {
            from: 'members',
            localField: '_id',
            foreignField: 'groupId',
            as: 'members'
          }
        }, {
          $match: {
            "members.userId": mongoose.Types.ObjectId(userId)
          }
        }, {
          $project: {
            _id: 1
          }
        }
      ])
      if (!foundGroup[0]) return returnStatus(res, 403);
      const pendingRes = await PendingModel.find({ 
        groupId, 
        $expr: { 
          $and: [
            {$eq: [{$month: "$date"}, month]},
            {$eq: [{$year: "$date"}, year]}
          ]
        }
      });
      
      return returnStatus(res, 200, pendingRes);  
    } catch (err) {
      console.log('[GET PENDING ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Delete pending
   * DELETE /api/pending/:pendingId
   * BODY { userId }
   */
  async delete(req, res) {
    const {userId} = req.body;
    const {pendingId} = req.params;

    if(!userId) return returnStatus(res, 400);
    try{
      const foundGroup = await PendingModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(pendingId)
          }
        }, {
          $lookup: {
            from: 'groups',
            localField: 'groupId',
            foreignField: '_id',
            as: 'groups',
          }
        }, {
          $lookup: {
            from: 'members',
            localField: 'groups._id',
            foreignField: 'groupId',
            as: 'members',
            pipeline: [
              {$match: {userId: mongoose.Types.ObjectId(userId)}}
            ]
          }
        }, {
          $match: {
            "members.userId": mongoose.Types.ObjectId(userId)
          }
        }, {
          $project: {
            _id: 1
          }
        }
      ]);

      if(foundGroup.length === 0) return returnStatus(res, 403);
      await PendingModel.deleteOne({_id: pendingId})
      return returnStatus(res, 200);
    }catch(err){
      console.log('[PENDING DELETE ERROR]', err);
      return returnStatus(res, 500);
    }
  }
}

export default new PendingController;
