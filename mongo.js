const mongoose = require('mongoose');
const mongoPath = process.env.mongoPath;

module.exports = async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  return mongoose
}