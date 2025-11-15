# Ticketmaster Integration Guide

## Overview
Your NightSpark app now includes full Ticketmaster integration to fetch real events with pricing, venue information, and direct ticket purchase links.

## Getting a Ticketmaster API Key

1. **Visit the Ticketmaster Developer Portal**
   - Go to https://developer.ticketmaster.com/
   - Click "Get Started" or "Sign Up"

2. **Create an Account**
   - Sign up with your email
   - Verify your email address

3. **Create an App**
   - Once logged in, go to "My Apps"
   - Click "Create New App"
   - Fill in the required information:
     - App Name: "NightSpark Event Discovery"
     - Description: "Event discovery and planning application"
     - App URL: "http://localhost:3000" (for development)

4. **Get Your API Key**
   - After creating the app, you'll see your Consumer Key
   - This is your API key - copy it

5. **Update Your Environment**
   - Open your `.env` file
   - Replace `your_ticketmaster_api_key_here` with your actual API key:
   ```
   TICKETMASTER_API_KEY=your_actual_api_key_here
   ```

## Features Integrated

### Backend Integration
- ✅ **TicketmasterService**: Advanced service for fetching events with geocoding
- ✅ **Event Filtering**: Support for categories, price ranges, and location radius
- ✅ **Data Mapping**: Converts Ticketmaster data to your app's Event schema
- ✅ **Error Handling**: Graceful fallbacks when API is unavailable
- ✅ **Caching Strategy**: Optimized API calls to respect rate limits

### Event Data Includes
- 🎵 **Real Event Information**: Concert, sports, theater, and entertainment events
- 💰 **Accurate Pricing**: Live ticket pricing from Ticketmaster
- 🏢 **Venue Details**: Real venue names, addresses, and capacity information
- 🖼️ **High-Quality Images**: Event and venue photos from Ticketmaster
- 🔗 **Direct Ticket Links**: Links to purchase tickets on Ticketmaster, StubHub, SeatGeek
- ⏰ **Event Timing**: Real dates and times for upcoming events
- 📍 **Location Data**: Accurate venue addresses and city information

### Frontend Display
- ✅ **Event Cards**: Show real events with pricing and ticket availability
- ✅ **Ticket Buttons**: Direct links to purchase tickets from multiple platforms
- ✅ **Event Details**: Rich modal with full event information
- ✅ **Price Display**: Clear pricing display ($X or FREE)
- ✅ **Age Requirements**: Automatically detected age restrictions

## API Usage & Limits

### Ticketmaster API Limits
- **Rate Limit**: 5,000 API calls per day (free tier)
- **Commercial**: Contact Ticketmaster for higher limits
- **Best Practices**: 
  - Cache results when possible
  - Use appropriate search radius (default: 25 miles)
  - Limit concurrent requests

### Search Parameters
Your integration supports:
- **Location**: City, address, or coordinates
- **Categories**: Music, sports, arts, theater, etc.
- **Price Range**: Min/max ticket prices
- **Radius**: Search distance (5-100 miles)
- **Event Count**: Number of events to return (1-200)

## Testing the Integration

1. **Add Your API Key** to `.env`
2. **Restart the Server**: `npm run dev`
3. **Search for Events**: Enter a major city like "New York" or "Los Angeles"
4. **Verify Events**: You should see real Ticketmaster events mixed with local venues
5. **Check Ticket Links**: Click "Tickets" buttons to verify they open Ticketmaster

## Example API Response

With a valid API key, you'll see logs like:
```
Searching Ticketmaster API: https://app.ticketmaster.com/discovery/v2/events.json?...
Found 25 events from Ticketmaster
Got 25 events from Ticketmaster
Returning 12 popular events (page 1) in New York, NY
```

And events will include:
- Real artist/event names
- Actual venue information
- Live ticket prices
- Direct purchase links

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your API key in `.env`
   - Verify the key is correct from Ticketmaster developer portal
   - Restart the server after updating `.env`

2. **No Events Returned**
   - Try a major city (New York, Los Angeles, Chicago)
   - Check API rate limits
   - Verify your API key hasn't exceeded daily limits

3. **API Rate Limits**
   - Implement caching for repeated searches
   - Reduce the number of events requested per call
   - Use a smaller search radius

### Fallback Behavior

If Ticketmaster API is unavailable, the app will:
1. Try Eventbrite API (if configured)
2. Use Google Places to find venues
3. Generate realistic synthetic events as last resort

## Production Deployment

For production use:
1. **Get a Commercial API Key** from Ticketmaster for higher limits
2. **Implement Caching** (Redis recommended) for better performance
3. **Add Error Monitoring** to track API failures
4. **Set Up Webhooks** for real-time event updates (advanced)

## Support

If you need help:
- **Ticketmaster Developer Docs**: https://developer.ticketmaster.com/products-and-docs/apis/getting-started/
- **API Reference**: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- **Rate Limits**: https://developer.ticketmaster.com/products-and-docs/apis/getting-started/#rate-limit

Your NightSpark app is now ready to display thousands of real events with accurate pricing and ticket purchasing capabilities!