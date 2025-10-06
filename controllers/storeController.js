const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate('home')
      .sort({ createdAt: -1 });

    res.render("store/bookings", {
      bookings: bookings,
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.redirect('/');
  }
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn, 
        user: req.session.user,
      });
    }
  });
};

exports.getReserve = async (req, res, next) => {
  const homeId = req.params.homeId;
  try {
    const home = await Home.findById(homeId);
    if (!home) {
      return res.redirect("/homes");
    }
    res.render("store/reserve", {
      home: home,
      pageTitle: "Reserve Home",
      currentPage: "Reserve",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (error) {
    console.error('Error getting reserve page:', error);
    res.redirect('/homes');
  }
};

exports.postCreateBooking = async (req, res, next) => {
  console.log('Booking request received');
  console.log('Request body:', req.body);
  console.log('URL params:', req.params);
  
  const homeId = req.params.homeId;
  const { checkIn, checkOut, guests } = req.body;
  
  try {
    console.log('Finding home with ID:', homeId);
    const home = await Home.findById(homeId);
    if (!home) {
      console.log('Home not found');
      return res.redirect("/homes");
    }
    console.log('Found home:', home);

    // Calculate total price (you may want to add your own pricing logic)
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = home.price * nights;

    const booking = new Booking({
      user: req.session.user._id,
      home: homeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parseInt(guests),
      totalPrice: totalPrice,
      status: 'confirmed'
    });

    console.log('Attempting to save booking:', booking);
    await booking.save();
    console.log('Booking saved successfully');
    res.redirect('/bookings');
  } catch (error) {
    console.error('Error creating booking:', error);
    console.error('Error details:', error.stack);
    res.redirect(`/homes/${homeId}`);
  }
};
