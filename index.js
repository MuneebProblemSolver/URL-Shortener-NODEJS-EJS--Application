// const express = require('express');
// const app = express();
// const { connectToMongoDB } = require('./connect');
// const URL = require("./models/url")

// const PORT = 8001;



// const urlRoute = require('./routes/url')
// app.use(express.json());
// app.use("/url", urlRoute);

// app.get("/:shortId", async (req, res)=> { 
//     const shortId = req.params.shortId;
//     const entry = await URL.findOneAndUpdate(
//         {
//             shortId,
//         },
//         {
//             $push: {
//                 visitHistory : {
//                     timetampe : Date.now(),
//                 }
//             }
//         }
//     );
//     res.redirect(entry.redirectURL);
// })

// app.listen(PORT, ()=>{
//     console.log(`Server started at PORT:${PORT}`);
// })

const express = require('express');
const app = express();
const path = require('path')
const { connectToMongoDB } = require('./connect');
const URL = require("./models/url");

const PORT = 8001;

require('dotenv').config(); // Load environment variables
const MONGOURI = process.env.MONGO_URI;

// const connectToMongoDB = async (uri) => {
//   try {
//     await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("MongoDB Connection Error:", error.message);
//     process.exit(1);
//   }
// };

connectToMongoDB(MONGOURI).then(() => {
    console.log("Connected to MongoDB");
});
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))


const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');

app.use(express.json());
app.use(express.urlencoded( {extended:false}));

app.use("/url", urlRoute);
app.use("/", staticRoute);

// app.get('/test', async (req,res)=>{
//     // return res.end("<h1> Hello World from NodeJs</h1>")
//     const allURLs = await URL.find({});
//     return res.end(`
//     <html>
//     <head></head>
//     <body>
//     <ol>
//     ${allURLs.map(url => `<li>${url.shortId} - ${url.redirectURL} - ${url.visitHistory.length} </li>`).join('')}
//     </ol>
//     </body>
//     </html>
//     `)
// })

// app.get('/test', async (req,res)=>{
//     const allURLs = await URL.find({});
//     return res.render('home', { urls:allURLs, })
// })


app.get("/url/:shortId", async (req, res) => { 
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timeStamp: Date.now() } } }
        );
        
        if (!entry) {
            return res.status(404).send("Short URL not found");
        }
        
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server started at PORT: ${PORT}`);
});
