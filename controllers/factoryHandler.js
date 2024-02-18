const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            document: doc
        }
    });
});


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let updatedDoc = await Model.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});
    if(!updatedDoc)
        return next(new AppError('No document found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: updatedDoc
    })
});

exports.readAll = Model => catchAsync(async (req, res, next) => {
    let filter;
    if(req.params.tourId)
        filter = {tour: req.params.tourId};

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    // executing query
    const doc = await features.query;
    // responsing
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc
      }
    })
});

exports.readOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = Model.findById(id);
    if(populateOptions)
        query.populate(populateOptions);
    const doc = await query;

    if(!doc)
      return next(new AppError(`No document found with that id: ${id}`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
});
