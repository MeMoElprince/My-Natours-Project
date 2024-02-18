class ApiFeatures
{
    constructor(query, queryStr){
      this.query = query;
      this.queryStr = queryStr;
    }
    filter(){
      let queryObj = {...this.queryStr};
      const queryExclude = ['page', 'limit', 'sort', 'fields'];
      queryExclude.forEach(data => delete queryObj[data]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      queryObj = JSON.parse(queryStr);
      this.query = this.query.find(queryObj);
      return this;
    }
    sort(){
      if(this.queryStr.sort)
      {
        const sortBy = this.queryStr.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      }
      else
      {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
    fields(){
      if(this.queryStr.fields)
      {
        const fields = this.queryStr.fields.split(',').join(' ');
        this.query = this.query.selecet(fields);
      }
      else
      {
        this.query = this.query.select('-__v');
      }
      return this;
    }
    pagination(){
      const page = this.queryStr.page * 1 || 1;
      const limit = this.queryStr.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
};

module.exports = ApiFeatures;