import Hotel from "../models/hotel.js";
import UserActivity from "../models/UserActivity.js";
export const filterHotels = async (req, res) => {
  try {
    const {
      city,
      star,
      roomType,
      minPrice,
      maxPrice,
      page = 1,
      limit,
    } = req.body;

    const filter = {};

    // city filter
    if (city) {
      filter.city = city;
    }

    // star rating
    if (star) {
      filter.star = Number(star);
    }

    // room-based filters (nested)
    if (roomType || minPrice || maxPrice) {
      filter.rooms = {
        $elemMatch: {
          ...(roomType && { name: roomType }),
          ...((minPrice || maxPrice) && {
            price: {
              ...(minPrice && { $gte: Number(minPrice) }),
              ...(maxPrice && { $lte: Number(maxPrice) }),
            },
          }),
        },
      };
    }

    let query = Hotel.find(filter).sort({ createdAt: -1 });

    // ✅ Apply pagination ONLY if limit is provided
    if (limit) {
      const parsedLimit = Number(limit);
      const parsedPage = Number(page);

      query = query
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit);
    }

    const hotels = await query;
    const total = await Hotel.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to filter hotels",
      error: error.message,
    });
  }
};
export const aiHomeHotels = async (req, res) => {
  try {
    const { userId, location } = req.body;

    const activity = userId
      ? await UserActivity.findOne({ userId })
      : null;

    const hotels = await Hotel.find();

    const ranked = hotels.map(hotel => {
      let score = 0;

      if (location && hotel.city === location) score += 40;
      if (activity?.lastCity === hotel.city) score += 30;

      if (activity?.lastRoomType) {
        const hasRoom = hotel.rooms.some(
          r => r.name === activity.lastRoomType
        );
        if (hasRoom) score += 25;
      }

      if (activity?.priceRange?.min != null) {
        const matchPrice = hotel.rooms.some(
          r =>
            r.price >= activity.priceRange.min &&
            r.price <= activity.priceRange.max
        );
        if (matchPrice) score += 20;
      }

      score += Math.floor(Math.random() * 10);

      return { hotel, score };
    });

    ranked.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      hotels: ranked.slice(0, 8).map(h => h.hotel)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "AI homepage failed",
      error: err.message
    });
  }
};
export const filterHotelsmobile = async (req, res) => {
  try {
    const {
      city,
      star,
      roomType,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
console.log(roomType);
console.log(minPrice);
console.log(maxPrice);
    // city filter
    if (city) {
      filter.city = city;
    }

    // star rating
    if (star) {
      filter.star = Number(star);
    }

    // room-based filters (nested)
    if (roomType || minPrice || maxPrice) {
      filter.rooms = {
        $elemMatch: {
          ...(roomType && { name: roomType }),
          ...((minPrice || maxPrice) && {
            price: {
              ...(minPrice && { $gte: Number(minPrice) }),
              ...(maxPrice && { $lte: Number(maxPrice) }),
            },
          }),
        },
      };
    }

   const hotels = await Hotel.aggregate([
  {
    $match: {
      ...(city && { city }),
      ...(star && { star: Number(star) }),
    },
  },

  {
    $addFields: {
      rooms: {
        $filter: {
          input: "$rooms",
          as: "room",
          cond: {
            $and: [
              ...(roomType ? [{ $eq: ["$$room.name", roomType] }] : []),
              ...(minPrice ? [{ $gte: ["$$room.price", Number(minPrice)] }] : []),
              ...(maxPrice ? [{ $lte: ["$$room.price", Number(maxPrice)] }] : []),
            ],
          },
        },
      },
    },
  },

  // ❗ Remove hotels with no matching rooms
  {
    $match: {
      "rooms.0": { $exists: true },
    },
  },

  { $sort: { createdAt: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: Number(limit) },
]);
console.log(hotels);
    const total = await Hotel.countDocuments(filter);
console.log(total)
    res.status(200).json({
      success: true,
      total,
      page,
      hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to filter hotels",
      error: error.message,
    });
  }
};


