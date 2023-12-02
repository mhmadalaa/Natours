const { default: mongoose } = require('mongoose');

const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
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
  const review = await Review.findById(req.params.id);

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

exports.getUserReviews = catchAsync(async (req, res, next) => {
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

exports.getTourReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.id });

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
  const queryObj = { ...req.query };
  const tourId = new mongoose.Types.ObjectId(queryObj.id);
  const rating = parseInt(req.query.rating);

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
