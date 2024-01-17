class APIfeatures {
  // query is the queryOBj tours.find(),users.find() and queryStr is the query object from the req {name:sanket,sort:price}
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //1- Filtering----------------------------------
    //simply we can pass the query string in the find function but as we go ahead query string may contain page=3(pagination),sort=true(sorting)
    //so we have to exclude the special fields from the query string otherwise it will return empty documents
    //because no document where duration=5&page=2
    //lets make a hard copy of the query string and remove the special fields
    const queryobj = { ...this.queryStr }; // ... will destructure the object and {} will recreate the object
    const excluedFileds = ['page', 'sort', 'limit', 'fields'];
    excluedFileds.forEach((el) => delete queryobj[el]);

    //2-- advance filtering---------------------
    //for gte,lte we use different type of filtering
    // duration[gte]=5&name=sanket //query string
    // {duration:{gte:4},name:sanket} //how it is apprears in js
    let querStr = JSON.stringify(queryobj);
    // replace gte,gt,lte,lt
    querStr = querStr.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`,
      // /g ensures all strings are replaced not the first one only //we provided the regular expression
    );
    this.query = this.query.find(JSON.parse(querStr));
    //now return the current class object so we can perform chaining later
    return this;
  }

  sort() {
    //3- sorting karna hai ab
    //sort=price ,sort=-price ,sort=price,rating,difficulty
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort; //for single sort value
      sortBy = sortBy.split(',').join(' '); //becasuse query.sort('price rating') takes a single aggument string space seperated values
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    //4 -Field limiting
    //if the bandwith of the client is less he can limit the number of fields he want
    //selecting certain fields from all the fields is projecting
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //this exclude the field "-price"
    }
    return this;
  }

  paginate() {
    //5 -Pagination page=2 with limit=50
    // ?page=2&limit=50
    const page = this.queryStr.page * 1 || 1; //get page from query or default 1
    const limit = this.queryStr.limit * 1 || 100; //get limit from query or default 100
    const skip = (page - 1) * limit; //
    this.query = this.query.skip(skip).limit(limit); //skip is number of results before start of the required page and limit is no of objects in a page
    return this;
  }
}
module.exports = APIfeatures;
