const express = require('express')
const fs = require('fs')
const xs = require('xlsx')
const ihtml = fs.readFileSync('./index.html', 'utf-8')
const fhtml = fs.readFileSync('./format.html', 'utf-8')
const chtml = fs.readFileSync('./content.html', 'utf-8')
const fmhtml = fs.readFileSync('./form.html', 'utf-8')
const dmhtml = fs.readFileSync('./dem.html', 'utf-8')
const phtml = fs.readFileSync('./pdate.html', 'utf-8')
const mhtml = fs.readFileSync('./message.html', 'utf-8')
const djson = JSON.parse(fs.readFileSync('./data.json', 'utf-8'))
const db = require('./database')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

function alldata(sd) {
  var array = []
  var array1 = []
  function hell(arr) {
    arr.CanteenName.forEach((el) => {
      array.push(arr.TownName)
      array1.push(el)
    })
  }
  function hell1(arr) {
    arr.forEach((el) => { hell(el) })
  }
  hell1(djson)
  var result = array.map((el, n) => { return { Sheetdate: sd, Townname: el, Canteenname: array1[n], Breakfast: 0, Breakfastwaste: 0, Lunch: 0, Lunchwaste: 0, Dinner: 0, Dinnerwaste: 0 } })
  return result
}
function replacedata(arr) {
  var fn = arr.map((el, n) => {
    let r = chtml.replace('{{%sd%}}', el.Sheetdate)
    r = r.replace('{{%sn%}}', (n + 1))
    r = r.replace('{{%tn%}}', el.Townname)
    r = r.replace('{{%cn%}}', el.Canteenname)
    r = r.replace('{{%bf%}}', el.Breakfast)
    r = r.replace('{{%bfw%}}', el.Breakfastwaste)
    r = r.replace('{{%ln%}}', el.Lunch)
    r = r.replace('{{%lnw%}}', el.Lunchwaste)
    r = r.replace('{{%dn%}}', el.Dinner)
    r = r.replace('{{%dnw%}}', el.Dinnerwaste)
    return r
  })
  return fn.join(' ')
}
app.get('/', (req, res) => { res.send(ihtml) })
app.post('/', async (req, res) => {
  var { Sheetdate, Townname, Canteenname, Breakfast, Breakfastwaste, Lunch, Lunchwaste, Dinner, Dinnerwaste } = req.body
  try {
    var d = await db.find({ Sheetdate, Townname, Canteenname })
    if (d.length == 0) {
      await db.insertMany(alldata(Sheetdate))
    }
    await db.findOneAndUpdate({ Sheetdate, Townname, Canteenname }, { $set: req.body }, {upsert: true,new: true })
  }
  catch (err) {
    return res.send(err.message)
  }
  res.redirect('/message')
})
app.get('/canteen', async (req, res) => {
  try {
    var r = await db.find().sort({ Sheetdate: 1, Townname: 1, Canteenname: 1 })
    var rs = fhtml.replace('{{%place%}}', replacedata(r))
    res.send(rs)
  }
  catch (err) {
    return res.send(err.msg)
  }
})
app.get('/download', async (req, res) => {
  try {
    const users = await db.find({}, { _id: 0, __v: 0 }).sort({ Sheetdate: 1, Townname: 1, Canteenname: 1 }).lean();
    const worksheet = xs.utils.json_to_sheet(users);
    const workbook = xs.utils.book_new();
    xs.utils.book_append_sheet(workbook, worksheet, "canteen");
    const excelBuffer = xs.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=cantten-data.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Error generating Excel file");
  }
})
function gdata(arr) {
  var fn = arr.map((el, n) => {
    let r = chtml.replace('{{%sd%}}', el.Sheetdate)
    r = r.replace('{{%sn%}}', (n + 1))
    r = r.replace('{{%tn%}}', el.Townname)
    r = r.replace('{{%cn%}}', el.Canteenname)
    r = r.replace('{{%bf%}}', el.Breakfast)
    r = r.replace('{{%bfw%}}', el.Breakfastwaste)
    r = r.replace('{{%ln%}}', el.Lunch)
    r = r.replace('{{%lnw%}}', el.Lunchwaste)
    r = r.replace('{{%dn%}}', el.Dinner)
    r = r.replace('{{%dnw%}}', el.Dinnerwaste)
    return r
  })
  return fn.join(' ')
}
app.post('/operation', async (req, res) => {
  var { FromDate, ToDate, Canteenname, Townname } = req.body
  if (!ToDate) {
    ToDate = 'null'
  }
  var dtt
  try {
    dtt = await db.find({ Sheetdate: { $gte: FromDate, $lte: ToDate }, Canteenname: Canteenname, Townname: Townname }).sort({ Sheetdate: 1, Canteenname: 1, Townname: 1 })
  }
  catch (err) {
    return res.send(err)
  }
  var rs = fhtml.replace('{{%place%}}', gdata(dtt))
  return res.send(rs)
})
app.get('/form', (req, res) => { res.send(fmhtml) })
app.get('/data', (req, res) => { res.send(dmhtml) })
app.get('/pdate', (req, res) => { res.send(phtml) })
app.get('/message', (req, res) => { res.send(mhtml) })
app.post('/date', async (req, res) => {
  try {
    var { Sheetdate } = req.body
    var d = await db.find({ Sheetdate }).sort({ Townname: 1, Canteenname: 1 })
    var rs = fhtml.replace('{{%place%}}', gdata(d))
    return res.send(rs)

  }
  catch (err) { return res.send(err.message) }
})


app.listen(5000, () => { console.log('server satarted') })
