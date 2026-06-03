const ParkingLot = require('../models/ParkingLot');

/**
 * @desc    Handle chatbot messages — intent-based parking assistant
 * @route   POST /api/chatbot/message
 * @access  Public (optionalAuth)
 *
 * Detects user intent from keywords and returns contextual responses
 * with suggestions for follow-up actions.
 */
const handleMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const lowerMsg = message.toLowerCase().trim();
    let reply = '';
    let suggestions = [];
    let data = null;

    // --- Intent Detection ---

    // Greeting intent
    if (/^(hi|hello|hey|good morning|good evening|namaste)/.test(lowerMsg)) {
      reply =
        '👋 Hello! Welcome to ParkEase — your smart parking assistant!\n\n' +
        'I can help you with:\n' +
        '🔍 Finding parking lots near you\n' +
        '📋 Checking availability\n' +
        '💰 Comparing prices\n' +
        '📖 Booking a parking slot\n\n' +
        'What would you like to do?';
      suggestions = [
        'Find parking near me',
        'Show available parking',
        'What are the prices?',
        'How do I book?',
      ];
    }
    // Search / Find intent
    else if (/\b(find|search|parking near|look for|where|locate)\b/.test(lowerMsg)) {
      // Try to extract a location keyword from the message
      let locationKeywords = lowerMsg
        .replace(/\b(find|search|parking|near|lot|lots|me|in|at|around|for)\b/g, '')
        .trim();

      // Normalize common variations and typos
      let normalizedQuery = locationKeywords;
      if (/\b(trivandrum|trivndrum|trivandrm|tvm|thiruvananthapuram)\b/.test(lowerMsg)) {
        normalizedQuery = 'Thiruvananthapuram';
      } else if (/\b(kochi|cochin|ernakulam|kakkanad)\b/.test(lowerMsg)) {
        normalizedQuery = 'Kochi';
      } else if (/\b(kozhikode|calicut)\b/.test(lowerMsg)) {
        normalizedQuery = 'Kozhikode';
      } else if (/\b(bangalore|bengaluru|blr)\b/.test(lowerMsg)) {
        normalizedQuery = 'Bangalore';
      } else if (/\b(chennai|madras)\b/.test(lowerMsg)) {
        normalizedQuery = 'Chennai';
      }

      if (normalizedQuery.length > 1) {
        const lots = await ParkingLot.find({
          isActive: true,
          $or: [
            { name: { $regex: normalizedQuery, $options: 'i' } },
            { address: { $regex: normalizedQuery, $options: 'i' } },
          ],
        })
          .limit(3)
          .select('name address pricePerHour availableSlots rating location');

        if (lots.length > 0) {
          reply = `🅿️ I found ${lots.length} parking lot(s) matching "${normalizedQuery}":\n\n`;
          lots.forEach((lot, i) => {
            reply += `${i + 1}. **${lot.name}**\n`;
            reply += `   📍 ${lot.address}\n`;
            reply += `   💰 ₹${lot.pricePerHour}/hr | 🅿️ ${lot.availableSlots} slots available | ⭐ ${lot.rating}\n\n`;
          });
          data = lots;
        } else {
          reply = `😕 I couldn't find any parking lots matching "${locationKeywords}". Try searching for a city name like "Kochi", "Trivandrum", "Kozhikode", "Bangalore", or "Chennai".`;
        }
      } else {
        reply =
          '🔍 Sure! Please tell me the area or city where you\'re looking for parking.\n\n' +
          'For example: "Find parking near MG Road" or "Search parking in Kochi"';
      }
      suggestions = ['Show all parking lots', 'Parking in Kochi', 'Parking in Trivandrum'];
    }
    // Availability intent
    else if (/\b(available|availability|vacant|empty|free|open)\b/.test(lowerMsg)) {
      const lots = await ParkingLot.find({
        isActive: true,
        availableSlots: { $gt: 0 },
      })
        .select('name address availableSlots totalSlots')
        .limit(5);

      reply = `🅿️ There are ${lots.length} parking lot(s) with available slots right now:\n\n`;
      lots.forEach((lot, i) => {
        reply += `${i + 1}. **${lot.name}** — ${lot.availableSlots}/${lot.totalSlots} slots free\n   📍 ${lot.address}\n\n`;
      });
      data = lots;
      suggestions = ['Book a slot', 'Find parking near me', 'Compare prices'];
    }
    // Price / Cost intent
    else if (/\b(price|cost|rate|charge|how much|fee|tariff)\b/.test(lowerMsg)) {
      // Try to extract a lot name
      const lotName = lowerMsg
        .replace(/\b(price|cost|rate|charge|how much|fee|tariff|of|for|at|the|what|is)\b/g, '')
        .trim();

      if (lotName.length > 1) {
        const lot = await ParkingLot.findOne({
          isActive: true,
          name: { $regex: lotName, $options: 'i' },
        }).select('name pricePerHour operatingHours');

        if (lot) {
          reply = `💰 Pricing for **${lot.name}**:\n\n` +
            `• Rate: ₹${lot.pricePerHour}/hour\n` +
            `• Operating Hours: ${lot.operatingHours.open} - ${lot.operatingHours.close}\n\n` +
            'Would you like to book a slot here?';
          data = lot;
        } else {
          reply = `I couldn't find pricing for "${lotName}". Here's a tip: prices typically range from ₹20 to ₹100/hour depending on the location.`;
        }
      } else {
        reply =
          '💰 Parking prices vary by location:\n\n' +
          '• Budget: ₹20-₹30/hour\n' +
          '• Standard: ₹40-₹60/hour\n' +
          '• Premium: ₹70-₹100/hour\n\n' +
          'Tell me a parking lot name to get exact pricing!';
      }
      suggestions = ['Find parking near me', 'Show available lots', 'How do I book?'];
    }
    // Booking intent
    else if (/\b(book|reserve|booking|reservation)\b/.test(lowerMsg)) {
      reply =
        '📖 To book a parking slot:\n\n' +
        '1. Search for a parking lot\n' +
        '2. Select an available slot from the lot\'s detail page\n' +
        '3. Enter your vehicle details and desired time\n' +
        '4. Confirm and pay\n\n' +
        'You can browse parking lots from the home page or use the search feature!';
      suggestions = ['Find parking near me', 'Show available lots', 'What are the prices?'];
    }
    // Cancel intent
    else if (/\b(cancel|cancellation|refund)\b/.test(lowerMsg)) {
      reply =
        '❌ To cancel a booking:\n\n' +
        '1. Go to your **Dashboard** → **My Bookings**\n' +
        '2. Find the booking you want to cancel\n' +
        '3. Click the **Cancel** button\n\n' +
        'Refunds are processed automatically upon cancellation.';
      suggestions = ['Go to dashboard', 'How do I book?', 'Find parking'];
    }
    // Support / Customer ticket query registration
    else if (lowerMsg.startsWith('query:')) {
      const queryText = message.substring(6).trim();
      if (queryText.length > 3) {
        const Query = require('../models/Query');
        const loggedQuery = await Query.create({
          name: req.user ? req.user.name : 'Anonymous Guest',
          email: req.user ? req.user.email : 'guest@parkinglot.com',
          message: queryText,
          user: req.user ? req.user._id : null
        });
        reply = `✅ Your support query has been logged successfully!\n\n"${queryText}"\n\nOur administrative team will review it shortly. Ticket ID: ${loggedQuery._id.toString().slice(-6).toUpperCase()}`;
      } else {
        reply = '⚠️ Please provide a message after "query:". For example: "query: elevator not working in Block A".';
      }
      suggestions = ['Show all parking lots', 'Help'];
    }
    else if (/\b(support|issue|problem|ticket|complaint|contact|admin|helpdesk)\b/.test(lowerMsg)) {
      reply =
        '🎫 Need support? I can register a customer ticket directly for you!\n\n' +
        'Simply type **query: <your message>** and press Enter.\n\n' +
        'Example:\n' +
        '*query: EV charger at Lulu Mall is showing error code 4*';
      suggestions = ['query: Elevator not working', 'Help'];
    }
    // Help intent
    else if (/\b(help|what can you do|commands|options)\b/.test(lowerMsg)) {
      reply =
        '🤖 Here\'s what I can help you with:\n\n' +
        '🔍 **Find parking** — "Find parking near MG Road"\n' +
        '📋 **Check availability** — "Show available parking"\n' +
        '💰 **Get prices** — "What\'s the price at Lulu Mall?"\n' +
        '📖 **Book a slot** — "How do I book?"\n' +
        '🎫 **Submit Query** — "I need support"\n' +
        '❌ **Cancel booking** — "How to cancel?"\n\n' +
        'Just type your question naturally!';
      suggestions = ['Find parking', 'Show available', 'Prices', 'Help'];
    }
    // Default fallback
    else {
      reply =
        '🤔 I\'m not sure I understood that. Here are some things you can try:\n\n' +
        '• "Find parking near Kochi"\n' +
        '• "Show available parking lots"\n' +
        '• "What are the prices?"\n' +
        '• "How do I book a slot?"\n' +
        '• "How to cancel a booking?"\n\n' +
        'Type **help** for more options!';
      suggestions = ['Find parking', 'Available lots', 'Prices', 'Help'];
    }

    res.status(200).json({
      success: true,
      data: {
        reply,
        suggestions,
        ...(data && { data }),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleMessage };
