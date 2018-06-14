import mongodb from 'mongodb';
import { error, info } from './config.mjs';

export default class MongoApply {
  constructor(mongoUrl, collectionName = 'uir_apply') {
    this.mongoUrl = mongoUrl;
    this.collectionName = collectionName;
  }
  async getDb() {
    const db = await mongodb.MongoClient.connect(this.mongoUrl);
    info('connected to ', this.mongoUrl);
    db.on('error', (e) => {
      error(e);
    });
    return db;
  }
  // 添加申请
  async insertApply(appId, userId, obj) {
    if (!appId || !userId) throw new Error('appId or userId must be provided.');
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const result = await col.insertOne({
      ...obj,
      appId,
      userId,
    });
    info('insertApply Result:', result.insertedId);
    const uirId = result.insertedId;
    db.close();
    return uirId;
  }

  // 获取申请列表
  async list() {
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const result = await col.find().toArray();
    info('list Apply:', result);
    db.close();
    return result;
  }
}
