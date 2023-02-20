import returnStatus from '../cores/returnStatus.js';
import WordModel from '../models/word.js';

class WordController {
  /**
   * GET words
   * GET /api/word
   */
  async get(req, res) {
    const { userId } = req.body;
    if (!userId) return returnStatus(res, 400);
    try {
      const words = await WordModel.find({ userId });
      return returnStatus(res, 200, words);
    }
    catch (err) {
      console.log(`[ERROR] GET WORDS ${err}`);
      return returnStatus(res, 500);
    }
  }

  /**
   * CREATE word
   * POST /api/word
   */
  async create(req, res) {
    const { userId, word, mean, description, imgSrc } = req.body;

    if (!userId) return returnStatus(res, 400);
    try {
      const newWord = await WordModel.create({
        userId,
        word,
        mean,
        description,
        imgSrc,
      })

      return returnStatus(res, 200, newWord);
    }
    catch (err) {
      console.log(`[WORD ERROR] CREATE WORD`, err);
      return returnStatus(res, 500);
    }
  }

  /**
   * UPDATE
   * PUT /api/word/:wordId
   */
  async update(req, res) {
    const { userId, word, mean, description, imgSrc } = req.body;
    const { wordId } = req.params;

    if (!userId || !wordId) return returnStatus(res, 400);
    try {
      const updatedWord = await WordModel.findOneAndUpdate(
        { userId, _id: wordId },
        {
          userId,
          word,
          mean,
          description,
          imgSrc,
        },
        { new: true }
      )
      return returnStatus(res, 200, updatedWord);
    }
    catch (err) {
      console.log(`[WORD ERROR] CREATE WORD`, err);
      return returnStatus(res, 500);
    }
  }

  /**
   * DELETE WORD
   * /api/word/:wordId
   */
  async delete(req, res) {
    const { userId } = req.body;
    const { wordId } = req.params;

    if (!userId || !wordId) return returnStatus(res, 400);
    try {
      const response = await WordModel.deleteOne({ userId, _id: wordId });
      return returnStatus(res, 200, response);
    }
    catch (err) {
      console.log(`[ERROR DELETE WORD]`, err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Action (increase,decrease priority)
   * POST /api/word/action
   */
  async action(req, res) {
    // ACTION = DECREASE | INCREASE
    let { userId, wordId, action } = req.body;
    try {
      action = action.toUpperCase();
      if (!userId || !wordId || !['DECREASE', 'INCREASE'].includes(action)) {
        return returnStatus(res, 400);
      }

      const updatedWord = await WordModel.findOneAndUpdate(
        { userId, _id: wordId },
        { $inc: { priority: action === 'INCREASE' ? 1 : -1 } },
        { new: true },
      );
      return returnStatus(res, 200, updatedWord);

    } catch (err) {
      console.log(`[ERROR WORD ACTION]`, err);
      return returnStatus(res, 500);
    }
  }

}

export default new WordController;