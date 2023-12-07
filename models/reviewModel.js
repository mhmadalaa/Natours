const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  // Commenting populate the tour data
  // to prevent from the populating chain
  // when calling the tour.
  // which tour [populate review] -> [review populate tour]
  // and that's a massive of data we don't need

  // .populate({
  //   path: 'tour',
  //   select: 'name',
  // })

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  let stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: 'tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // to handle if there is no reviews with the passed tourId
  if (stats.length === 0) stats = [{ rating: 0, avgRating: 0 }];

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  // this: for the document, constructor: for the model of the document
  // `Review.calcAverageRatings(this.tour);` but this middleware
  // is a part of the `reviewSchema` which we create the model from
  // so it acutaly a closed circle of dependencies, so one of the
  // solutions to solve that is to use `constructor`
  // which is a function to the document model in this case `reviewModel`
  // without breaking the code structure
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // when i reach this, i need the `tourid`
  // recalculate the ratigns average and quantity

  // The document that `findOneAndUpdate()` will modify
  this.r = await this.model.findOne(this.getQuery());

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
