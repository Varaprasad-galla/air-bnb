// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/favourites", storeController.getFavouriteList);

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);

// Add auth middleware for booking routes
const isAuth = (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

storeRouter.get("/homes/:homeId/reserve", isAuth, storeController.getReserve);
storeRouter.post("/homes/:homeId/book", isAuth, storeController.postCreateBooking);
storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);

module.exports = storeRouter;
