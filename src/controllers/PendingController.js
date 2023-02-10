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
      if (isNaN(newDate)) return returnStatus(res, 400);
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
        }, {
          $project: {
            _id: 1
          }
        }
      ])

      if (!foundGroup) return returnStatus(res, 403);
      await PendingModel.create({ content, bank, money, date: newDate, groupId })
      return returnStatus(res, 200);
    } catch (err) {
      console.log('[PENDING CREATE ERROR]', err);

      return returnStatus(res, 500);
    }
  }

  /**
   * Update a pending
   * PATCH /api/pending/:slug
   * BODY { userId, pendingId, content, date, money, bank }
   */
  async update(req, res) {
    const { userId, pendingId, content, date, money, bank } = req.body;
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
            _id: 1
          }
        }
      ]);

      if (foundPending.length === 0) return returnStatus(res, 403);

      await PendingModel.updateOne({ _id: pendingId }, { content, date: new Date(date), money, bank });

      return returnStatus(res, 200, foundPending);

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
   * DELETE /api/pending/delete-pending/:pendingId
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
