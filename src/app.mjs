import mongodb from 'mongodb';
import { error, info } from './config.mjs';

export default class MongoApply {
  constructor(mongoUrl, collectionName = 'uir_apps') {
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
  // 添加app
  async insert(appId, name, other) {
    if (!appId || !name) throw new Error('appId or name must be provided.');
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const result = await col.insertOne({
      ...other,
      appId,
      name,
    });
    info('insertApp Result:', result.insertedId);
    const uirId = result.insertedId;
    db.close();
    return uirId;
  }

  // 获取所有app信息
  async list() {
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const result = await col.find().toArray();
    db.close();
    return result;
  }
}
