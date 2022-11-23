//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//connect to MongoDB by specifying port to access MongoDB server
// 0.0.0.0:27017 instead of localhost:27017  !!!
mongoose.connect("mongodb+srv://admin-abdo:pancakewithcheese@cluster0.ozsghtt.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
//schema for items
const itemsSchema = new mongoose.Schema({
  name: String
});

//Schema for lists
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
//items model
const Item = mongoose.model("Item", itemsSchema);
//list model
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Do homework."
});

const item2 = new Item({
  name: "Click + for new item"
});

const item3 = new Item({
  name: "check an item to remove it"
});

const exampleItems = [item1, item2, item3];

// Item.find({}, function(err, items){
//   if(err) {
//     console.log(err);
//   } else {
//     items.forEach(function(f){
//       console.log(f.name);
//     });
//   }
// });

app.get("/", function(req, res) {
  0

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(exampleItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items successfully inserted.");
        }
      });
      res.redirect("/"); //After it adds the example items the first time it'll reroute..
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

//This post method adds items to our lists
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list

  const newEntry = new Item({
    name: itemName
  });
  //If in default list just add item
  if(listName === "Today"){
    newEntry.save();
    res.redirect("/");
  } else {
    ///Find the list matching this one's name and add the item to it
    List.findOne({name: listName}, function(err, f){
      f.items.push(newEntry);
      f.save();
      res.redirect("/" + listName);
    });
  }
});


app.post("/delete", function(req, res) {
  const checkedItemId = req.body.deletedItem;
  const hiddenListName = req.body.hiddenListName;
  if(hiddenListName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted successfully");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: hiddenListName}, {$pull: {items: {_id: checkedItemId}}}, function(err, f){
      if(!err){
        res.redirect("/" + hiddenListName);
      }
    });
  }

});


//Dynamic routing
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err, foundList){
    if (!err) {
      if (!foundList) {
        //Create a new list...
        const list = new List({
          name: customListName,
          items: exampleItems
        });
        list.save();
      } else {
        //Render found existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  });


});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
