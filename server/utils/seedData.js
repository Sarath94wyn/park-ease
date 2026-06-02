const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parking-lot-finder';

/**
 * Helper: Generate slot labels A1-A10, B1-B10, C1-C10, etc.
 */
const generateSlots = (totalSlots, occupancyRate) => {
  const slots = [];
  const slotsPerRow = 10;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const occupiedCount = Math.floor(totalSlots * occupancyRate);

  for (let i = 0; i < totalSlots; i++) {
    const rowIndex = Math.floor(i / slotsPerRow);
    const slotIndex = (i % slotsPerRow) + 1;
    const letter = letters[rowIndex];
    slots.push({
      slotNumber: `${letter}${slotIndex}`,
      type: 'standard',
      floor: Math.floor(rowIndex / 2) + 1,
      isOccupied: i < occupiedCount, // First N slots are occupied
    });
  }

  return slots;
};

/**
 * Helper: Pick N random items from an array
 */
const pickRandom = (arr, min, max) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Helper: Random number between min and max (inclusive)
 */
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Helper: Random float between min and max, rounded to 1 decimal
 */
const randFloat = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

const allAmenities = [
  'CCTV',
  'EV Charging',
  'Covered Parking',
  'Wheelchair Accessible',
  'Security Guard',
  '24/7 Access',
  'Restroom',
  'Car Wash',
  'Valet Service',
];

// =========================================================================
// 18 Realistic Parking Lots Across Indian Cities
// =========================================================================
const parkingLotsData = [
  // --- KOCHI (4 lots) ---
  {
    name: 'Lulu Mall Parking',
    address: 'Lulu Mall, Edappally, Kochi, Kerala 682024',
    description: 'Multi-level parking at Kochi\'s largest shopping mall. Spacious, well-lit, and CCTV monitored throughout.',
    coordinates: [76.3089, 10.0275], // [lng, lat]
    totalSlots: 60,
    pricePerHour: 40,
    operatingHours: { open: '09:00', close: '22:00' },
  },
  {
    name: 'MG Road Multi-Level Parking',
    address: 'MG Road, Ravipuram, Kochi, Kerala 682015',
    description: 'Central Kochi parking facility near the metro station. Ideal for shoppers and office-goers.',
    coordinates: [76.2888, 9.9716],
    totalSlots: 45,
    pricePerHour: 50,
    operatingHours: { open: '07:00', close: '23:00' },
  },
  {
    name: 'Marine Drive Parking Plaza',
    address: 'Marine Drive, Ernakulam, Kochi, Kerala 682031',
    description: 'Scenic waterfront parking with easy access to Marine Drive promenade and boat jetty.',
    coordinates: [76.2830, 9.9734],
    totalSlots: 35,
    pricePerHour: 30,
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'Edappally Junction Parking',
    address: 'Edappally Junction, NH 66, Kochi, Kerala 682024',
    description: 'Convenient parking near Edappally flyover junction. Close to hospitals and shopping areas.',
    coordinates: [76.3003, 10.0261],
    totalSlots: 30,
    pricePerHour: 25,
    operatingHours: { open: '06:00', close: '21:00' },
  },

  // --- THIRUVANANTHAPURAM (4 lots) ---
  {
    name: 'Technopark Parking Hub',
    address: 'Technopark Campus, Kazhakkoottam, Thiruvananthapuram, Kerala 695581',
    description: 'Dedicated parking for Technopark IT employees and visitors. EV charging stations available.',
    coordinates: [76.8829, 8.5560],
    totalSlots: 50,
    pricePerHour: 30,
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'East Fort Smart Parking',
    address: 'East Fort, Padmanabhaswamy Temple Road, Thiruvananthapuram, Kerala 695023',
    description: 'Smart parking facility near the iconic Padmanabhaswamy Temple. High-security zone.',
    coordinates: [76.9477, 8.4834],
    totalSlots: 40,
    pricePerHour: 35,
    operatingHours: { open: '05:00', close: '21:00' },
  },
  {
    name: 'Kowdiar Premium Parking',
    address: 'Kowdiar, near Kowdiar Palace, Thiruvananthapuram, Kerala 695003',
    description: 'Premium parking in the upscale Kowdiar locality. Valet service and car wash available.',
    coordinates: [76.9567, 8.5133],
    totalSlots: 25,
    pricePerHour: 60,
    operatingHours: { open: '07:00', close: '22:00' },
  },
  {
    name: 'Kazhakkoottam IT Park Parking',
    address: 'IT Park Road, Kazhakkoottam, Thiruvananthapuram, Kerala 695582',
    description: 'Spacious parking near the IT corridor. Popular among daily commuters and tech professionals.',
    coordinates: [76.8861, 8.5575],
    totalSlots: 55,
    pricePerHour: 25,
    operatingHours: { open: '06:00', close: '23:00' },
  },

  // --- KOZHIKODE (4 lots) ---
  {
    name: 'SM Street Parking Complex',
    address: 'Mittai Theruvu (SM Street), Kozhikode, Kerala 673001',
    description: 'Compact parking near the famous Sweet Meat Street. Walk to the best halwa shops in Kerala!',
    coordinates: [75.7804, 11.2484],
    totalSlots: 30,
    pricePerHour: 20,
    operatingHours: { open: '08:00', close: '21:00' },
  },
  {
    name: 'Hilite Mall Parking Zone',
    address: 'Hilite Mall, NH 766, Kozhikode, Kerala 673014',
    description: 'Modern multi-level parking at the biggest mall in Malabar region. Family-friendly amenities.',
    coordinates: [75.8327, 11.2752],
    totalSlots: 50,
    pricePerHour: 40,
    operatingHours: { open: '09:00', close: '22:00' },
  },
  {
    name: 'Beach Road Open Parking',
    address: 'Beach Road, Kozhikode Beach, Kozhikode, Kerala 673032',
    description: 'Open-air beachfront parking. Perfect for evening visitors to Kozhikode Beach.',
    coordinates: [75.7706, 11.2508],
    totalSlots: 40,
    pricePerHour: 20,
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'Cyberpark Parking Tower',
    address: 'UL Cyberpark, Nellikode, Kozhikode, Kerala 673016',
    description: 'Dedicated IT park parking with 24/7 access. Security guards on all floors.',
    coordinates: [75.8082, 11.2628],
    totalSlots: 45,
    pricePerHour: 35,
    operatingHours: { open: '00:00', close: '23:59' },
  },

  // --- BANGALORE (3 lots) ---
  {
    name: 'MG Road Metro Parking',
    address: 'MG Road, near Trinity Metro Station, Bangalore, Karnataka 560001',
    description: 'Underground parking right next to the MG Road metro station. Park and ride convenience.',
    coordinates: [77.6066, 12.9756],
    totalSlots: 50,
    pricePerHour: 60,
    operatingHours: { open: '06:00', close: '23:00' },
  },
  {
    name: 'Indiranagar Smart Park',
    address: '100 Feet Road, Indiranagar, Bangalore, Karnataka 560038',
    description: 'Smart automated parking in the heart of Indiranagar. App-based entry and exit.',
    coordinates: [77.6408, 12.9784],
    totalSlots: 35,
    pricePerHour: 80,
    operatingHours: { open: '07:00', close: '23:00' },
  },
  {
    name: 'Electronic City Parking Hub',
    address: 'Electronic City Phase 1, Hosur Road, Bangalore, Karnataka 560100',
    description: 'Large-capacity parking serving the Electronic City IT hub. EV charging and car wash.',
    coordinates: [77.6698, 12.8456],
    totalSlots: 60,
    pricePerHour: 40,
    operatingHours: { open: '06:00', close: '22:00' },
  },

  // --- CHENNAI (3 lots) ---
  {
    name: 'T Nagar Parking Complex',
    address: 'Usman Road, T Nagar, Chennai, Tamil Nadu 600017',
    description: 'Multi-storey parking in Chennai\'s busiest shopping district. Walking distance to Ranganathan Street.',
    coordinates: [80.2334, 13.0418],
    totalSlots: 55,
    pricePerHour: 50,
    operatingHours: { open: '08:00', close: '22:00' },
  },
  {
    name: 'Anna Nagar Tower Parking',
    address: 'Anna Nagar Tower, 2nd Avenue, Chennai, Tamil Nadu 600040',
    description: 'Landmark parking near the Anna Nagar Tower park. Popular weekend destination.',
    coordinates: [80.2096, 13.0850],
    totalSlots: 40,
    pricePerHour: 30,
    operatingHours: { open: '06:00', close: '21:00' },
  },
  {
    name: 'OMR Tech Corridor Parking',
    address: 'Old Mahabalipuram Road, Sholinganallur, Chennai, Tamil Nadu 600119',
    description: 'Spacious parking facility serving the OMR IT corridor. Used by thousands of techies daily.',
    coordinates: [80.2272, 12.9010],
    totalSlots: 60,
    pricePerHour: 45,
    operatingHours: { open: '06:00', close: '23:00' },
  },
];

// =========================================================================
// Seed Script
// =========================================================================
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing parking lots
    await ParkingLot.deleteMany({});
    console.log('🗑️  Cleared existing parking lots');

    // Clear existing users to ensure clean slate
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create admin user
    let adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@parkinglot.com',
      password: 'password',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=1a73e8&color=fff',
      points: 10,
    });
    console.log('👤 Created admin user: admin@parkinglot.com / password');

    // Create regular test user
    let regularUser = await User.create({
      name: 'Sarath User',
      email: 'user@parkinglot.com',
      password: 'password',
      role: 'user',
      avatar: 'https://ui-avatars.com/api/?name=Sarath+User&background=34a853&color=fff',
      points: 10,
    });
    console.log('👤 Created regular user: user@parkinglot.com / password');

    // Build parking lot documents with generated slots
    const parkingLots = parkingLotsData.map((lotData) => {
      const occupancyRate = (randBetween(30, 80)) / 100; // 30%-80% occupied
      const slots = generateSlots(lotData.totalSlots, occupancyRate);
      const availableSlots = slots.filter((s) => !s.isOccupied).length;
      const amenities = pickRandom(allAmenities, 3, 7);
      const rating = randFloat(3.5, 5.0);
      const totalReviews = randBetween(5, 120);

      return {
        name: lotData.name,
        address: lotData.address,
        description: lotData.description,
        location: {
          type: 'Point',
          coordinates: lotData.coordinates,
        },
        totalSlots: lotData.totalSlots,
        availableSlots,
        pricePerHour: lotData.pricePerHour,
        amenities,
        images: [],
        operatingHours: lotData.operatingHours,
        rating,
        totalReviews,
        slots,
        owner: adminUser._id,
        isActive: true,
      };
    });

    const inserted = await ParkingLot.insertMany(parkingLots);
    console.log(`🅿️  Inserted ${inserted.length} parking lots:`);

    // Log summary grouped by city
    const cities = ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Bangalore', 'Chennai'];
    cities.forEach((city) => {
      const cityLots = inserted.filter((l) => l.address.includes(city));
      console.log(`   📍 ${city}: ${cityLots.length} lots`);
      cityLots.forEach((lot) => {
        console.log(`      - ${lot.name} (${lot.availableSlots}/${lot.totalSlots} available, ₹${lot.pricePerHour}/hr)`);
      });
    });

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
