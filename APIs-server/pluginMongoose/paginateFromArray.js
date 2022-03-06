
// Test
/* 
   paginar(2, 2, ["a","b","c","d","e","f","g","h","i"])
   paginar(1, 2, ["a","b","c","d","e","f","g","h","i"]) 
*/


// Paginar for items array
function paginateFromArray(pageToGet, limit, itemsArray) {

   var total = itemsArray.length;

   var page = pageToGet;

   if (page < 1) {
      page = 1;
   }

   skip = (page - 1) * limit;

   var docs = itemsArray.slice(skip, skip + limit);  // get from index skip to skip + limit

   var result = {
      totalDocs: total,
      limit: limit,
      docs: docs
   };

   const pages = Math.ceil(total / limit) || 1;

   result.hasPrevPage = false;
   result.hasNextPage = false;

   result.page = page;
   result.totalPages = pages;

   // Set prev page
   if (page > 1 && page <= pages) {
      result.hasPrevPage = true;
      result.prevPage = (page - 1);
   } else {
      result.prevPage = null;
   }

   // Set next page
   if (page < pages) {
      result.hasNextPage = true;
      result.nextPage = (page + 1);
   } else {
      result.nextPage = null;
   }

   return result;

}
/**
 * @param {Schema} schema
 */
module.exports = function (schema) {
   schema.statics.paginateFromArray = paginateFromArray;
};

module.exports.paginateFromArray = paginateFromArray;