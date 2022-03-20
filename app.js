//jshint esversion:6
//todolist app
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//mongoconnect
mongoose.connect("mongodb+srv://ankur3176:Password@ankurcluster.xlbji.mongodb.net/todolistDB");

//schemas
const itemSchema = {
  name: String,
};

const worklist = {
  name: String,
  itemsinit: [itemSchema]
};

//models
const list = mongoose.model("list",worklist);
const Item = mongoose.model("Item", itemSchema);

//default values
const Item1 = new Item({
  name: "welcome to todolist !",
});
const Item2 = new Item({
  name: "+ to add new !",
});
const Item3 = new Item({
  name: "--> to delete !",
});

//homeroute
app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {

    if (founditems.length === 0) {

      Item.insertMany([Item1, Item2, Item3], function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("added successfully !");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: "Today", newListItems: founditems });
    }
  });
});

//custom route
app.get("/:listname",function(req,res){
  const Name = _.capitalize(req.params.listname);

  list.findOne({name: Name},function(err,element){
    if(!element)
    {
      const defaultlist= new list({
        name: Name,
        itemsinit: [Item1,Item2,Item3]
      });
      defaultlist.save();   
      res.redirect("/"+ Name);  
    }
    else{
      res.render("list",{listTitle: element.name, newListItems:element.itemsinit});
    }
  });
});

//adding new tasks
app.post("/", function (req, res) {
  const Newitem = req.body.newItem;
  const listname = req.body.list;

  const value = new Item({
    name: Newitem
  });
  if(listname==="Today")
  {
    value.save();
    res.redirect("/");
  }
  else{
    list.findOne({name: listname},function(err,element)
    {
      element.itemsinit.push(value);
      element.save();
      res.redirect("/"+ listname);
    })
  }
  

  //method 2 
  // Item.insertMany({name: Newitem},function(err)
  // {
  //   if(err)
  //   {
  //     console.log(err);
  //   }
  // });

    
});


//deleting tasks
app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const deletelist = req.body.Listname;

   if(deletelist === "Today")
   {
    Item.findByIdAndRemove(id,function(err)
    {
      if(!err)
      {
        console.log("successfully deleted !");
      }
      res.redirect("/");
    });
  }
  else{
    list.findOneAndUpdate({name: deletelist},{$pull :{itemsinit :{_id : id}}}, function(err, element){
      if(!err)
      {
        res.redirect("/"+ deletelist);
      }
    })
  }
  

});


app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;       //this runs our app on the heroku port but when unavailabe we can set our own default port.
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started successfully.");
});
