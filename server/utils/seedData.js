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
    const letter = letters[rowIndex] || 'Z';
    
    // Distribute slot types: compact, standard, ev, large, vip, reserved, handicap
    let type = 'standard';
    const mod = i % 20;
    if (mod < 3) type = 'compact';        // 2 Wheelers (Bikes)
    else if (mod < 11) type = 'standard'; // 4 Wheelers (Standard)
    else if (mod < 13) type = 'ev';       // 4 Wheelers (EV charging)
    else if (mod < 15) type = 'large';    // Heavy Vehicles (6+ Wheelers)
    else if (mod === 15) type = 'vip';     // VIP Slot
    else if (mod === 16) type = 'reserved';// Reserved Slot
    else type = 'handicap';               // Handicap access

    slots.push({
      slotNumber: `${letter}${slotIndex}`,
      type,
      floor: Math.floor(rowIndex / 2) + 1,
      isOccupied: i < occupiedCount, // First N slots are occupied
      maintenanceStatus: i === 5 ? 'maintenance' : 'operational', // 1 under maintenance
      sensorStatus: i === 8 ? 'offline' : 'online',               // 1 sensor offline
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
// 50 Realistic Parking Lots Across 5 Target Indian Cities (10 per city)
// =========================================================================
const parkingLotsData = [
  // --- KOCHI (10 lots) ---
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
  {
    name: 'Kakkanad InfoPark Zone',
    address: 'Infopark Phase 1, Kakkanad, Kochi, Kerala 682030',
    description: 'Dedicated tech park parking complex with smart slot sensors and EV fast charging stations.',
    coordinates: [76.3639, 10.0104],
    totalSlots: 70,
    pricePerHour: 30,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Vytila Mobility Hub Parking',
    address: 'Mobility Hub Road, Vytila, Kochi, Kerala 682019',
    description: 'Intermodal transit hub parking. Safe overnight parking for commuters using metro, bus, or boat ferry.',
    coordinates: [76.3218, 9.9678],
    totalSlots: 50,
    pricePerHour: 20,
    operatingHours: { open: '05:00', close: '23:30' },
  },
  {
    name: 'Fort Kochi Beach Parking',
    address: 'Vasco da Gama Square, Fort Kochi, Kochi, Kerala 682001',
    description: 'Tourist-friendly open-air parking near Chinese Fishing Nets and beach walkways.',
    coordinates: [76.2423, 9.9679],
    totalSlots: 40,
    pricePerHour: 30,
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'Tripunithura Station Parking',
    address: 'Railway Station Road, Tripunithura, Kochi, Kerala 682301',
    description: 'Convenient transit parking facility adjacent to Tripunithura Railway Station and metro.',
    coordinates: [76.3495, 9.9515],
    totalSlots: 30,
    pricePerHour: 20,
    operatingHours: { open: '05:00', close: '22:00' },
  },
  {
    name: 'Palarivattom Metro Parking',
    address: 'Palarivattom Metro Station, Pipeline Road, Kochi, Kerala 682025',
    description: 'Quick-access park & ride facility under Palarivattom Metro Station corridor.',
    coordinates: [76.3116, 10.0076],
    totalSlots: 35,
    pricePerHour: 25,
    operatingHours: { open: '06:00', close: '22:35' },
  },
  {
    name: 'Kalamassery Town Parking',
    address: 'Changampuzha Nagar, Kalamassery, Kochi, Kerala 682033',
    description: 'Safe neighborhood parking spot near Cusat University campus and local markets.',
    coordinates: [76.3223, 10.0389],
    totalSlots: 40,
    pricePerHour: 20,
    operatingHours: { open: '07:00', close: '21:00' },
  },

  // --- THIRUVANANTHAPURAM (10 lots) ---
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
    address: 'Kowdiar Palace Rd, Kowdiar, Thiruvananthapuram, Kerala 695003',
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
  {
    name: 'Thampanoor Central Station Parking',
    address: 'Station Rd, Thampanoor, Thiruvananthapuram, Kerala 695001',
    description: 'Multi-level parking plaza right next to Central Railway Station and KSRTC Terminal.',
    coordinates: [76.9504, 8.4891],
    totalSlots: 60,
    pricePerHour: 30,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Palayam Connemara Market Parking',
    address: 'Palayam Junction, MG Road, Thiruvananthapuram, Kerala 695034',
    description: 'Bustling central city parking complex, ideal for visiting Connemara Market and public libraries.',
    coordinates: [76.9501, 8.5008],
    totalSlots: 45,
    pricePerHour: 30,
    operatingHours: { open: '07:00', close: '22:00' },
  },
  {
    name: 'Lulu Mall Trivandrum Parking',
    address: 'Lulu Mall, Kazhakkoottam-Kovalam Bypass, Thiruvananthapuram, Kerala 695021',
    description: 'Gigantic smart parking terminal with electronic availability guides and EV chargers.',
    coordinates: [76.8923, 8.5298],
    totalSlots: 80,
    pricePerHour: 40,
    operatingHours: { open: '09:00', close: '23:00' },
  },
  {
    name: 'Vizhinjam Port Transit Parking',
    address: 'Harbour Road, Vizhinjam, Thiruvananthapuram, Kerala 695521',
    description: 'Secure terminal parking for heavy vehicles and logistic containers near the seaport gates.',
    coordinates: [76.9942, 8.3768],
    totalSlots: 50,
    pricePerHour: 50,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Medical College Parking Complex',
    address: 'Ulloor-Kannammoola Rd, Thiruvananthapuram, Kerala 695011',
    description: 'Spacious parking facility catering to patients and visitors of Government Medical College.',
    coordinates: [76.9295, 8.5215],
    totalSlots: 55,
    pricePerHour: 20,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Vattiyoorkavu Town Lot',
    address: 'Vattiyoorkavu Junction, Thiruvananthapuram, Kerala 695013',
    description: 'Local shopping district parking space. Ideal for short-term stays.',
    coordinates: [76.9806, 8.5239],
    totalSlots: 30,
    pricePerHour: 20,
    operatingHours: { open: '08:00', close: '21:00' },
  },

  // --- KOZHIKODE / CALICUT (10 lots) ---
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
  {
    name: 'Mananchira Square Town Lot',
    address: 'Mananchira Road, Kozhikode, Kerala 673001',
    description: 'Central open parking opposite the historic Mananchira park and pond.',
    coordinates: [75.7801, 11.2536],
    totalSlots: 35,
    pricePerHour: 25,
    operatingHours: { open: '08:00', close: '21:30' },
  },
  {
    name: 'Calicut Railway Station Parking',
    address: 'Railway Station Road, Kozhikode, Kerala 673002',
    description: 'Offsite railway commuter parking with 24-hour security guards and heavy vehicle capacity.',
    coordinates: [75.7844, 11.2435],
    totalSlots: 50,
    pricePerHour: 20,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Mavoor Road Transit Plaza',
    address: 'Mavoor Road, Tazhekkod, Kozhikode, Kerala 673004',
    description: 'Quick-stop parking near the central bus junction, shopping centers, and medical labs.',
    coordinates: [75.7925, 11.2592],
    totalSlots: 30,
    pricePerHour: 30,
    operatingHours: { open: '07:00', close: '22:30' },
  },
  {
    name: 'KSRTC Bus Stand Multi-level',
    address: 'KSRTC Terminal, Mavoor Road, Kozhikode, Kerala 673001',
    description: 'Modern multi-story terminal parking for easy local transit links and shopping visits.',
    coordinates: [75.7919, 11.2576],
    totalSlots: 45,
    pricePerHour: 25,
    operatingHours: { open: '06:00', close: '23:00' },
  },
  {
    name: 'Focus Mall Parking Lot',
    address: 'Focus Mall, Mavoor Road, Kozhikode, Kerala 673004',
    description: 'Safe underground parking at Focus Mall. Covered bays and security guards.',
    coordinates: [75.7905, 11.2588],
    totalSlots: 35,
    pricePerHour: 30,
    operatingHours: { open: '09:30', close: '21:30' },
  },
  {
    name: 'Elathur Beach Side Lot',
    address: 'Elathur Harbour Road, Kozhikode, Kerala 673303',
    description: 'Scenic marine parking spot ideal for visiting the local estuary and seafood spots.',
    coordinates: [75.7335, 11.3320],
    totalSlots: 40,
    pricePerHour: 20,
    operatingHours: { open: '06:00', close: '21:00' },
  },

  // --- BANGALORE (10 lots) ---
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
  {
    name: 'Koramangala Socials Parking',
    address: '80 Feet Road, Koramangala 3rd Block, Bangalore, Karnataka 560034',
    description: 'Safe neighborhood parking close to Koramangala retail high-streets and eateries.',
    coordinates: [77.6244, 12.9352],
    totalSlots: 40,
    pricePerHour: 50,
    operatingHours: { open: '10:00', close: '23:30' },
  },
  {
    name: 'Whitefield ITPL Parking Tower',
    address: 'ITPL Main Road, Whitefield, Bangalore, Karnataka 560066',
    description: 'Automated multi-level tower serving ITPL campus tech workers. Active 24/7.',
    coordinates: [77.7340, 12.9866],
    totalSlots: 75,
    pricePerHour: 40,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Majestic Transit Center Lot',
    address: 'Kempegowda Bus Station Road, Majestic, Bangalore, Karnataka 560009',
    description: 'Large terminal parking adjacent to Majestic Railway & Central Metro Stations.',
    coordinates: [77.5726, 12.9779],
    totalSlots: 80,
    pricePerHour: 30,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Jayanagar Shopping Complex Lot',
    address: 'Jayanagar 4th Block, 10th Main Rd, Bangalore, Karnataka 560011',
    description: 'Civic market-complex parking. Popular for visiting Jayanagar shopping street hubs.',
    coordinates: [77.5824, 12.9298],
    totalSlots: 50,
    pricePerHour: 40,
    operatingHours: { open: '08:00', close: '22:00' },
  },
  {
    name: 'HSR Layout Club Parking',
    address: '14th Main Rd, HSR Layout Sector 4, Bangalore, Karnataka 560102',
    description: 'Safe, tree-lined residential area parking, close to HSR Layout restaurants and startups.',
    coordinates: [77.6385, 12.9116],
    totalSlots: 35,
    pricePerHour: 40,
    operatingHours: { open: '07:00', close: '22:00' },
  },
  {
    name: 'Malleshwaram Mantri Square Lot',
    address: 'Mantri Square Mall, Sampige Rd, Bangalore, Karnataka 560003',
    description: 'Subterranean parking facility with smart payment gateways and direct metro bridge.',
    coordinates: [77.5732, 12.9918],
    totalSlots: 55,
    pricePerHour: 50,
    operatingHours: { open: '09:00', close: '22:30' },
  },
  {
    name: 'Hebbal Flyover Parking Hub',
    address: 'Hebbal Kempapura Outer Ring Rd, Bangalore, Karnataka 560024',
    description: 'Convenient park-and-fly transit lot for airport shuttle buses and northern commuters.',
    coordinates: [77.5912, 13.0358],
    totalSlots: 60,
    pricePerHour: 30,
    operatingHours: { open: '05:00', close: '23:00' },
  },

  // --- CHENNAI (10 lots) ---
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
  {
    name: 'Phoenix Marketcity Parking',
    address: 'Phoenix Marketcity, Velachery Rd, Chennai, Tamil Nadu 600042',
    description: 'Extensive multi-level mall parking with smart vehicle indicators and valet slots.',
    coordinates: [80.2166, 12.9918],
    totalSlots: 75,
    pricePerHour: 50,
    operatingHours: { open: '09:30', close: '22:30' },
  },
  {
    name: 'Chennai Central Premium Parking',
    address: 'Kannappar Thidal, Central Station, Chennai, Tamil Nadu 600003',
    description: 'Premium short-term and long-term rail commuter parking located opposite Central Station gates.',
    coordinates: [80.2727, 13.0822],
    totalSlots: 60,
    pricePerHour: 40,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Marina Beach Public Lot',
    address: 'Marina Beach Road, Triplicane, Chennai, Tamil Nadu 600005',
    description: 'Open-air beachfront parking. Direct access to the beach stalls and light house.',
    coordinates: [80.2825, 13.0502],
    totalSlots: 80,
    pricePerHour: 20,
    operatingHours: { open: '05:00', close: '23:00' },
  },
  {
    name: 'Nungambakkam High Road Lot',
    address: 'Nungambakkam High Road, Chennai, Tamil Nadu 600034',
    description: 'Central commercial district parking, close to embassies, hotels, and luxury boutiques.',
    coordinates: [80.2452, 13.0605],
    totalSlots: 40,
    pricePerHour: 50,
    operatingHours: { open: '07:30', close: '22:00' },
  },
  {
    name: 'Adyar Depot Multi-level',
    address: 'Lattice Bridge Road, Adyar, Chennai, Tamil Nadu 600020',
    description: 'Multi-level smart parking facility serving the southern residential hub of Adyar.',
    coordinates: [80.2526, 13.0064],
    totalSlots: 45,
    pricePerHour: 30,
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'Koyambedu Bus Terminus Lot',
    address: 'CMBT Complex, Koyambedu, Chennai, Tamil Nadu 600107',
    description: 'High-volume transit park & ride lot for express bus commuters. Heavily guarded.',
    coordinates: [80.1914, 13.0688],
    totalSlots: 70,
    pricePerHour: 20,
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Besant Nagar Beach Parking',
    address: 'Edward Elliot\'s Beach, Besant Nagar, Chennai, Tamil Nadu 600090',
    description: 'Popular beach side parking. Well suited for weekend visitors and diners.',
    coordinates: [80.2692, 12.9998],
    totalSlots: 50,
    pricePerHour: 30,
    operatingHours: { open: '05:00', close: '23:00' },
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

    const Booking = require('../models/Booking');
    const Alert = require('../models/Alert');

    // Clear existing parking lots, bookings, alerts, and users
    await ParkingLot.deleteMany({});
    console.log('🗑️  Cleared existing parking lots');

    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing bookings');

    await Alert.deleteMany({});
    console.log('🗑️  Cleared existing alerts');

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
      points: 25,
      vehicles: [
        { vehicleNumber: 'KL-07-CD-1234', vehicleType: 'car' },
        { vehicleNumber: 'KL-07-EF-5678', vehicleType: 'bike' }
      ]
    });
    console.log('👤 Created regular user: user@parkinglot.com / password (with 2 vehicles)');

    // Create blocked user
    let blockedUser = await User.create({
      name: 'Blocked User',
      email: 'blocked@parkinglot.com',
      password: 'password',
      role: 'user',
      avatar: 'https://ui-avatars.com/api/?name=Blocked+User&background=ea4335&color=fff',
      points: 0,
      status: 'blocked'
    });
    console.log('👤 Created blocked user: blocked@parkinglot.com / password');

    // Create staff members
    let managerUser = await User.create({
      name: 'Karan Manager',
      email: 'manager@parkinglot.com',
      password: 'password',
      role: 'admin',
      staffRole: 'parking_manager',
      permissions: ['manage_lots', 'manage_spaces', 'view_reports'],
      avatar: 'https://ui-avatars.com/api/?name=Karan+Manager&background=fbbc05&color=fff',
      points: 0,
    });
    console.log('👤 Created manager staff: manager@parkinglot.com / password');

    let opsUser = await User.create({
      name: 'Rohan Operations',
      email: 'ops@parkinglot.com',
      password: 'password',
      role: 'admin',
      staffRole: 'operations_staff',
      permissions: ['manage_spaces', 'view_bookings'],
      avatar: 'https://ui-avatars.com/api/?name=Rohan+Ops&background=4285f4&color=fff',
      points: 0,
    });
    console.log('👤 Created operations staff: ops@parkinglot.com / password');

    let securityUser = await User.create({
      name: 'Balaji Security',
      email: 'security@parkinglot.com',
      password: 'password',
      role: 'admin',
      staffRole: 'security_personnel',
      permissions: ['view_bookings'],
      avatar: 'https://ui-avatars.com/api/?name=Balaji+Security&background=673ab7&color=fff',
      points: 0,
    });
    console.log('👤 Created security staff: security@parkinglot.com / password');

    // Build parking lot documents with generated slots
    const parkingLots = parkingLotsData.map((lotData) => {
      const occupancyRate = (randBetween(30, 80)) / 100; // 30%-80% occupied
      const slots = generateSlots(lotData.totalSlots, occupancyRate);
      const availableSlots = slots.filter((s) => !s.isOccupied && s.maintenanceStatus === 'operational').length;
      const disabledSlotsCount = slots.filter(s => s.type === 'handicap').length;
      const evChargingCount = slots.filter(s => s.type === 'ev').length;
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
        disabledSlotsCount,
        evChargingCount,
        pricePerHour: lotData.pricePerHour,
        amenities,
        images: [],
        operatingHours: lotData.operatingHours,
        rating,
        totalReviews,
        slots,
        owner: adminUser._id,
        isActive: true,
        status: 'active',
      };
    });

    const inserted = await ParkingLot.insertMany(parkingLots);
    console.log(`P  Inserted ${inserted.length} parking lots:`);

    // Seed system alerts linked to inserted lots
    const sampleAlerts = [
      {
        type: 'sensor_failure',
        title: 'Sensor Offline - A9',
        message: `Ultrasonic sensor at slot A9 in ${inserted[0].name} has stopped responding.`,
        severity: 'warning',
        status: 'active',
        parkingLot: inserted[0]._id,
      },
      {
        type: 'parking_full',
        title: 'Facility Capacity Alert',
        message: `${inserted[1].name} has reached 100% occupancy.`,
        severity: 'info',
        status: 'active',
        parkingLot: inserted[1]._id,
      },
      {
        type: 'maintenance',
        title: 'Slot A6 Maintenance Required',
        message: `Physical barrier motor at slot A6 in ${inserted[0].name} is drawing high current and needs inspection.`,
        severity: 'warning',
        status: 'active',
        parkingLot: inserted[0]._id,
      },
      {
        type: 'payment_failure',
        title: 'Razorpay Gateway Warning',
        message: 'Elevated rate of credit card checkout timeouts detected on Razorpay sandbox webhook routing.',
        severity: 'critical',
        status: 'active',
      }
    ];
    await Alert.insertMany(sampleAlerts);
    console.log('🚨 Seeded system alerts');

    // Seed historical and active bookings over the last 14 days
    const bookingsToSeed = [];
    const nowTime = new Date();
    const userPool = [regularUser, managerUser, opsUser, adminUser];

    for (let i = 0; i < 350; i++) {
      const daysAgo = randBetween(0, 14);
      const startHour = randBetween(8, 20);
      const durationHours = randBetween(2, 8);

      const startTime = new Date(nowTime);
      startTime.setDate(nowTime.getDate() - daysAgo);
      startTime.setHours(startHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + durationHours);

      const randomLot = inserted[randBetween(0, inserted.length - 1)];
      const randomUser = userPool[i % userPool.length];
      // Multiply by 18 to simulate premium multi-day/weekly pass bookings or corporate reservations
      const amount = durationHours * randomLot.pricePerHour * 18;
      
      const statusValue = (daysAgo === 0 && startHour > nowTime.getHours() - 3) ? 'active' : (randBetween(0, 15) === 1 ? 'cancelled' : 'completed');
      const paymentStatusValue = statusValue === 'cancelled' ? 'refunded' : 'paid';

      bookingsToSeed.push({
        user: randomUser._id,
        parkingLot: randomLot._id,
        slotNumber: `${String.fromCharCode(65 + randBetween(0, 2))}${randBetween(1, 10)}`,
        vehicleNumber: `KL-07-${String.fromCharCode(65 + randBetween(0, 25))}${String.fromCharCode(65 + randBetween(0, 25))}-${randBetween(1000, 9999)}`,
        vehicleType: pickRandom(['car', 'bike', 'suv'], 1, 1)[0],
        startTime,
        endTime,
        duration: durationHours,
        totalAmount: amount,
        status: statusValue,
        paymentStatus: paymentStatusValue,
        paymentId: `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        createdAt: startTime,
      });
    }

    await Booking.insertMany(bookingsToSeed);
    console.log(`🎟️  Inserted ${bookingsToSeed.length} bookings for historical analytics`);

    // Log summary grouped by city
    const cities = ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Bangalore', 'Chennai'];
    cities.forEach((city) => {
      const cityLots = inserted.filter((l) => l.address.includes(city));
      console.log(`   📍 ${city}: ${cityLots.length} lots`);
    });

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
