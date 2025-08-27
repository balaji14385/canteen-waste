
const mongoose = require('mongoose');
const con="mongodb+srv://balaji:harekrishna666$$$@project.caa1tsj.mongodb.net/sweet?retryWrites=true&w=majority&appName=project"
mongoose.connect(con)
.then(()=>{console.log('success')})
.catch((err)=>{console.log(err)})
const userSchema = new mongoose.Schema({
  Sheetdate:{
    type:String,
    trim:true
  },
  Townname:{
    type:String,
    trim:true
  },
  Canteenname:{
    type:String,
    trim:true
  },
  Breakfast:{
    type:Number,
    default:0
  },
    Breakfastwaste:{
    type:Number,
    default:0
  },
  Lunch:{
    type:Number,
    default:0
  },
  Lunchwaste:{
    type:Number,
    default:0
  },
  Dinner:{
    type:Number,
    default:0
  },
   Dinnerwaste:{
    type:Number,
    default:0
  }
});
userSchema.index({ Sheetdate: 1, Townname: 1, Canteenname: 1 }, { unique: true });
module.exports = mongoose.model('canteen', userSchema);

