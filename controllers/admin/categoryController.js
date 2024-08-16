const category = require("../../models/categoryModel");
const expressHandler = require("express-async-handler");

// category page--
const categoryManagement = expressHandler(async (req, res) => {
  try {
    const findCategory = await category.find();
    res.render("./admin/pages/category", {
      category: findCategory,
      title: "Categories",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// addCategory form---
const addCategory = expressHandler(async (req, res) => {
  try {
    res.render("./admin/pages/addCategory", { title: "addCategory" });
  } catch (error) {
    throw new Error(error);
  }
});

// inserting  categories--
const insertCategory = expressHandler(async (req, res) => {
  try {
    const categoryName = req.body.text;
    const regexCategoryName = new RegExp(`^${categoryName}$`, "i");
    const findCat = await category.findOne({ categoryName: regexCategoryName });

    if (findCat) {
      const catCheck = `Category ${categoryName} Already existing`;
      res.render("./admin/pages/addCategory", {
        catCheck,
        title: "addCategory",
      });
    } else {
      const result = new category({
        categoryName: categoryName,
      });
      await result.save();

      res.render("./admin/pages/addCategory", {
        message: `Category ${categoryName} added successfully`,
        title: "addCategory",
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// //---------------------------unlist categories --------------------------------

const unList = expressHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const list = await category.findByIdAndUpdate(
      { _id: id },
      { $set: { isListed: false } }
    );

    res.redirect("/admin/category");
  } catch (error) {
    throw new Error(error);
  }
});

// list category--
const list = expressHandler(async (req, res) => {
  try {
    const id = req.params.id;

    const listing = await category.findByIdAndUpdate(
      { _id: id },
      { $set: { isListed: true } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    throw new Error(error);
  }
});

// edit Category form --
const editCategory = expressHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const catName = await category.findById(id);
    if (catName) {
      const messages = req.flash();
      res.render("./admin/pages/editCategory", {
        title: "editCategory",
        value: catName, messages
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// update Category name
const updateCategory = expressHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const { updatedName, offer, description, startDate, endDate, } = req.body
    
    const existedCategory = await category.find({
      categoryName: updatedName,
      _id: { $ne: id }
    });

    if (existedCategory&& existedCategory.length!=0) {
      req.flash("danger", `${updatedName} already exists, try new one`);
      res.redirect("back");
    } else {
      const cat = await category.findById(id)
      cat.categoryName = updatedName;
      cat.offer = offer;
      cat.description = description;
      cat.startDate = startDate;
      cat.endDate = endDate

      const saved = await cat.save()
      res.redirect('/admin/category')
    }
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  categoryManagement,
  addCategory,
  insertCategory,
  list,
  unList,
  editCategory,
  updateCategory,
  // searchCategory
};
