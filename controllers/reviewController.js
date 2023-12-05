const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user._id;

  const review = await Review.create(req.body);

  if (!review) {
    return next(new AppError('Review is not created there is an error', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body);

  if (!review) {
    return next(new AppError('There is not any review with this id', 404));
  }

  res.status(201).json({
    status: 'success',
    message: 'review updated!',
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.reviewId);

  if (!review) {
    return next(new AppError('There is not any review with this id', 404));
  }

  res.status(203).json({
    status: 'success',
    message: 'review deleted!',
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  if (!reviews) {
    return next(new AppError('Reviews can not retrieved', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      length: reviews.length,
      reviews,
    },
  });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return next(new AppError('There is not a review with this id', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.userReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user._id });

  if (!reviews) {
    return next(new AppError('Can not get reviews', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getTourReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.tourId });

  if (!reviews) {
    return next(new AppError('Can not get reviews', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getReveiwByRate = catchAsync(async (req, res, next) => {
  // to get the reviews for specific rating and for range of 1
  // const queryObj = { ...req.query };
  // const tourId = new mongoose.Types.ObjectId(queryObj.id);
  // const rating = parseInt(req.query.rating);

  const tourId = req.params.tourId;
  const rating = parseInt(req.params.rate);

  const reviews = await Review.find({
    tour: tourId,
    $expr: {
      $and: [{ $gte: ['$rating', rating] }, { $lt: ['$rating', rating + 1] }],
    },
  });

  if (!reviews) {
    return next(new AppError('Can not get reviews', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});
