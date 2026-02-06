const Category = require("../model/category"); 
const {  success, error } = require("../../utils/commonUtils");
const {appString} = require("../../utils/appString")
const categoryController = {
addCategory: async (req, res) => {
  try {
    const { name, description, image, parentId } = req.body;

    if (parentId) {
      const parentExists = await Category.findById(parentId);
      if (!parentExists) return error(res, appString.PARENTCATEGORY, 404);
    }

    const category = await Category.create({ 
      name, 
      description, 
      image, 
      parentId: parentId || null 
    });

    const successMessage = parentId 
      ? appString.SUBCATEGORYSUCCESS 
      : appString.CATEGORYSUCCESS;

    return success(res, category, successMessage, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
},

listCategories: async (req, res) => {
  try {
    const { search } = req.query;
    
    let matchStage = { parentId: null, status: 1 };

    const categories = await Category.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "parentId",
          as: "subcategories"
        }
      },
      {
        $addFields: {
          filteredSubcategories: {
            $filter: {
              input: "$subcategories",
              as: "sub",
              cond: { 
                $and: [
                  { $eq: ["$$sub.status", 1] },
                  search ? { $regexMatch: { input: "$$sub.name", regex: search, options: "i" } } : true
                ]
              }
            }
          }
        }
      },
      {
        $match: search ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "filteredSubcategories.0": { $exists: true } } 
          ]
        } : {}
      },
      {
        $project: {
          name: 1,
          description: 1,
          status: 1,
          subcategories: "$filteredSubcategories"
        }
      }
    ]);

    if (search && categories.length === 0) {
      const parentExists = await Category.findOne({
        parentId: null,
        name: { $regex: search, $options: "i" },
        status: 1
      });

      if (!parentExists) {
        return error(res, appString.CATEGORYNOTFOUND, 404);
      }

     
      return error(res, appString.SUBCATEGORYNOTFOUND, 404);
    }

    return success(res, categories, appString.CATEGORYFECTH);
  } catch (err) {
    return error(res, err.message, 500);
  }
},
updateCategory: async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updated) return err(res, appString.PARENTCATEGORY, 404);

        const type = updated.parentId ? "Subcategory" : "Category";
    return success(res, updated, `${type} updated successfully`);
  } catch (error) {
    return err(res, error.message, 400);
  }
},
 deleteCategory: async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) return err(res, appString.PARENTCATEGORY, 404);

    const type = category.parentId ? "Subcategory" : "Category";

   
    await Category.updateMany(
      { $or: [{ _id: id }, { parentId: id }] },
      { 
        $set: { 
          isDeleted: true,
          status: 0  
        } 
      }
    );

    return success(res, null, `${type} deleted Successfully`);
  } catch (error) {
    return err(res, error.message, 400);
  }
}

};

module.exports = categoryController ;
