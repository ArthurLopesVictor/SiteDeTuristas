import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Create Supabase client (admin for server operations)
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Create Supabase client for user operations
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

// Helper function to verify user authentication
const verifyAuth = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const supabase = getSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.log('Auth verification error:', error);
    return null;
  }
  
  return user;
};

// ============================================
// AUTH ROUTES
// ============================================

// Sign Up Route
app.post('/make-server-a5c257ac/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server is not configured
      user_metadata: { name }
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Now sign in the user to get a session
    const supabaseClient = getSupabaseClient();
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.log('Sign in after signup error:', signInError);
      return c.json({ error: signInError.message }, 400);
    }
    
    return c.json({
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.user_metadata.name
      },
      session: sessionData.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============================================
// VENDORS ROUTES
// ============================================

// Get all vendors (optionally filter by market)
app.get('/make-server-a5c257ac/vendors', async (c) => {
  try {
    const marketId = c.req.query('market');
    
    const allVendors = await kv.getByPrefix('vendor:');
    
    let filteredVendors = allVendors;
    if (marketId) {
      filteredVendors = allVendors.filter((v: any) => v.market_id === marketId);
    }
    
    // Sort by creation date (newest first)
    filteredVendors.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return c.json({ vendors: filteredVendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return c.json({ error: 'Failed to fetch vendors' }, 500);
  }
});

// Get a specific vendor
app.get('/make-server-a5c257ac/vendors/:id', async (c) => {
  try {
    const vendorId = c.req.param('id');
    const vendor = await kv.get(`vendor:${vendorId}`);
    
    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }
    
    return c.json({ vendor });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return c.json({ error: 'Failed to fetch vendor' }, 500);
  }
});

// Create a new vendor (requires authentication)
app.post('/make-server-a5c257ac/vendors', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized. Please log in to create a vendor.' }, 401);
    }
    
    const body = await c.req.json();
    const { name, specialty, market_id, market_name, location, phone, whatsapp, instagram, description, photo, products, badges } = body;
    
    if (!name || !specialty || !market_id) {
      return c.json({ error: 'Name, specialty, and market are required' }, 400);
    }
    
    const vendorId = crypto.randomUUID();
    const vendor = {
      id: vendorId,
      name,
      specialty,
      market_id,
      market_name: market_name || '',
      location: location || '',
      phone: phone || '',
      whatsapp: whatsapp || '',
      instagram: instagram || '',
      description: description || '',
      photo: photo || '',
      products: products || [],
      badges: badges || [],
      created_by_user_id: user.id,
      created_by_name: user.user_metadata.name || user.email,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`vendor:${vendorId}`, vendor);
    
    return c.json({ vendor }, 201);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return c.json({ error: 'Failed to create vendor' }, 500);
  }
});

// Update a vendor (requires authentication and ownership)
app.put('/make-server-a5c257ac/vendors/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const vendorId = c.req.param('id');
    const vendor = await kv.get(`vendor:${vendorId}`);
    
    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }
    
    if (vendor.created_by_user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only edit your own vendors' }, 403);
    }
    
    const body = await c.req.json();
    const { name, specialty, location, phone, whatsapp, instagram, description, photo, products, badges } = body;
    
    vendor.name = name || vendor.name;
    vendor.specialty = specialty || vendor.specialty;
    vendor.location = location !== undefined ? location : vendor.location;
    vendor.phone = phone !== undefined ? phone : vendor.phone;
    vendor.whatsapp = whatsapp !== undefined ? whatsapp : vendor.whatsapp;
    vendor.instagram = instagram !== undefined ? instagram : vendor.instagram;
    vendor.description = description !== undefined ? description : vendor.description;
    vendor.photo = photo !== undefined ? photo : vendor.photo;
    vendor.products = products !== undefined ? products : vendor.products;
    vendor.badges = badges !== undefined ? badges : vendor.badges;
    vendor.updated_at = new Date().toISOString();
    
    await kv.set(`vendor:${vendorId}`, vendor);
    
    return c.json({ vendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return c.json({ error: 'Failed to update vendor' }, 500);
  }
});

// Delete a vendor (requires authentication and ownership)
app.delete('/make-server-a5c257ac/vendors/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const vendorId = c.req.param('id');
    const vendor = await kv.get(`vendor:${vendorId}`);
    
    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }
    
    if (vendor.created_by_user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only delete your own vendors' }, 403);
    }
    
    await kv.del(`vendor:${vendorId}`);
    
    return c.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return c.json({ error: 'Failed to delete vendor' }, 500);
  }
});

// ============================================
// REVIEWS ROUTES
// ============================================

// Get all reviews
app.get('/make-server-a5c257ac/reviews', async (c) => {
  try {
    const marketId = c.req.query('market');
    
    // Get all reviews from KV store
    const allReviews = await kv.getByPrefix('review:');
    
    // Filter by market if specified
    let filteredReviews = allReviews;
    if (marketId) {
      filteredReviews = allReviews.filter((r: any) => r.market === marketId);
    }
    
    // Sort by date (newest first)
    filteredReviews.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return c.json({ reviews: filteredReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Create a new review (requires authentication)
app.post('/make-server-a5c257ac/reviews', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized. Please log in to submit a review.' }, 401);
    }
    
    const body = await c.req.json();
    const { market, rating, comment, photos, review_type, vendor_id, vendor_name } = body;
    
    if (!rating || !comment) {
      return c.json({ error: 'Rating and comment are required' }, 400);
    }
    
    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    if (review_type === 'vendor' && !vendor_id) {
      return c.json({ error: 'Vendor ID is required for vendor reviews' }, 400);
    }

    if (review_type === 'market' && !market) {
      return c.json({ error: 'Market is required for market reviews' }, 400);
    }
    
    // Create review object
    const reviewId = crypto.randomUUID();
    const review = {
      id: reviewId,
      user_id: user.id,
      author: user.user_metadata.name || user.email,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      market: market || '',
      rating,
      comment,
      photos: photos || [],
      date: new Date().toISOString(),
      helpful: 0,
      helpfulBy: [], // Track which users marked as helpful
      review_type: review_type || 'market',
      vendor_id: vendor_id || null,
      vendor_name: vendor_name || null,
    };
    
    // Save to KV store
    await kv.set(`review:${reviewId}`, review);
    
    return c.json({ review }, 201);
  } catch (error) {
    console.error('Error creating review:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Update a review (requires authentication)
app.put('/make-server-a5c257ac/reviews/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const reviewId = c.req.param('id');
    const review = await kv.get(`review:${reviewId}`);
    
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }
    
    // Check if user owns this review
    if (review.user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only edit your own reviews' }, 403);
    }
    
    const body = await c.req.json();
    const { rating, comment } = body;
    
    if (!rating || !comment) {
      return c.json({ error: 'Rating and comment are required' }, 400);
    }
    
    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }
    
    // Update review
    review.rating = rating;
    review.comment = comment;
    review.updatedAt = new Date().toISOString();
    
    await kv.set(`review:${reviewId}`, review);
    
    return c.json({ review });
  } catch (error) {
    console.error('Error updating review:', error);
    return c.json({ error: 'Failed to update review' }, 500);
  }
});

// Delete a review (requires authentication)
app.delete('/make-server-a5c257ac/reviews/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const reviewId = c.req.param('id');
    const review = await kv.get(`review:${reviewId}`);
    
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }
    
    // Check if user owns this review
    if (review.user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only delete your own reviews' }, 403);
    }
    
    // Delete from KV store
    await kv.del(`review:${reviewId}`);
    
    return c.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return c.json({ error: 'Failed to delete review' }, 500);
  }
});

// Mark review as helpful
app.post('/make-server-a5c257ac/reviews/:id/helpful', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const reviewId = c.req.param('id');
    const review = await kv.get(`review:${reviewId}`);
    
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }
    
    // Check if user already marked as helpful
    const helpfulBy = review.helpfulBy || [];
    const alreadyMarked = helpfulBy.includes(user.id);
    
    if (alreadyMarked) {
      // Remove helpful
      review.helpfulBy = helpfulBy.filter((id: string) => id !== user.id);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful
      review.helpfulBy = [...helpfulBy, user.id];
      review.helpful = (review.helpful || 0) + 1;
    }
    
    await kv.set(`review:${reviewId}`, review);
    
    return c.json({ review });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return c.json({ error: 'Failed to update review' }, 500);
  }
});

// ============================================
// MARKETS ROUTES (User-created markets)
// ============================================

// Get all user-created markets
app.get('/make-server-a5c257ac/markets', async (c) => {
  try {
    console.log('[Markets API] Fetching all markets...');
    const allMarkets = await kv.getByPrefix('market:');
    console.log(`[Markets API] Found ${allMarkets.length} markets`);
    
    // Sort by creation date (newest first)
    if (allMarkets.length > 0) {
      allMarkets.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    
    return c.json({ markets: allMarkets });
  } catch (error) {
    console.error('[Markets API] Error fetching markets:', error);
    return c.json({ error: 'Failed to fetch markets', details: error.message }, 500);
  }
});

// Get a specific market
app.get('/make-server-a5c257ac/markets/:id', async (c) => {
  try {
    const marketId = c.req.param('id');
    const market = await kv.get(`market:${marketId}`);
    
    if (!market) {
      return c.json({ error: 'Market not found' }, 404);
    }
    
    return c.json({ market });
  } catch (error) {
    console.error('Error fetching market:', error);
    return c.json({ error: 'Failed to fetch market' }, 500);
  }
});

// Create a new market (requires authentication)
app.post('/make-server-a5c257ac/markets', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized. Please log in to create a market.' }, 401);
    }
    
    const body = await c.req.json();
    const { name, description, address, phone, hours, category, products, website, instagram, facebook, photos } = body;
    
    if (!name || !description || !address) {
      return c.json({ error: 'Name, description, and address are required' }, 400);
    }
    
    const marketId = crypto.randomUUID();
    const market = {
      id: marketId,
      name,
      description,
      address,
      phone: phone || '',
      hours: hours || '',
      category: category || '',
      products: products || '',
      website: website || '',
      instagram: instagram || '',
      facebook: facebook || '',
      photos: photos || [],
      created_by_user_id: user.id,
      created_by_name: user.user_metadata.name || user.email,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`market:${marketId}`, market);
    
    return c.json({ market }, 201);
  } catch (error) {
    console.error('Error creating market:', error);
    return c.json({ error: 'Failed to create market' }, 500);
  }
});

// Update a market (requires authentication and ownership)
app.put('/make-server-a5c257ac/markets/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const marketId = c.req.param('id');
    const market = await kv.get(`market:${marketId}`);
    
    if (!market) {
      return c.json({ error: 'Market not found' }, 404);
    }
    
    if (market.created_by_user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only edit your own markets' }, 403);
    }
    
    const body = await c.req.json();
    const { name, description, address, phone, hours, category, products, website, instagram, facebook, photos } = body;
    
    market.name = name || market.name;
    market.description = description || market.description;
    market.address = address || market.address;
    market.phone = phone !== undefined ? phone : market.phone;
    market.hours = hours !== undefined ? hours : market.hours;
    market.category = category !== undefined ? category : market.category;
    market.products = products !== undefined ? products : market.products;
    market.website = website !== undefined ? website : market.website;
    market.instagram = instagram !== undefined ? instagram : market.instagram;
    market.facebook = facebook !== undefined ? facebook : market.facebook;
    market.photos = photos !== undefined ? photos : market.photos;
    market.updated_at = new Date().toISOString();
    
    await kv.set(`market:${marketId}`, market);
    
    return c.json({ market });
  } catch (error) {
    console.error('Error updating market:', error);
    return c.json({ error: 'Failed to update market' }, 500);
  }
});

// Delete a market (requires authentication and ownership)
app.delete('/make-server-a5c257ac/markets/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const marketId = c.req.param('id');
    const market = await kv.get(`market:${marketId}`);
    
    if (!market) {
      return c.json({ error: 'Market not found' }, 404);
    }
    
    if (market.created_by_user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only delete your own markets' }, 403);
    }
    
    // Delete associated itineraries
    const allItineraries = await kv.getByPrefix('itinerary:');
    const marketItineraries = allItineraries.filter((i: any) => i.market_id === marketId);
    for (const itinerary of marketItineraries) {
      await kv.del(`itinerary:${itinerary.id}`);
    }
    
    await kv.del(`market:${marketId}`);
    
    return c.json({ success: true, message: 'Market deleted successfully' });
  } catch (error) {
    console.error('Error deleting market:', error);
    return c.json({ error: 'Failed to delete market' }, 500);
  }
});

// ============================================
// CUSTOM ITINERARIES ROUTES
// ============================================

// Get all itineraries (optionally filtered by market)
app.get('/make-server-a5c257ac/itineraries', async (c) => {
  try {
    const marketId = c.req.query('market');
    
    const allItineraries = await kv.getByPrefix('itinerary:');
    
    let filteredItineraries = allItineraries;
    if (marketId) {
      filteredItineraries = allItineraries.filter((i: any) => i.market_id === marketId);
    }
    
    // Sort by creation date (newest first)
    filteredItineraries.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return c.json({ itineraries: filteredItineraries });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return c.json({ error: 'Failed to fetch itineraries' }, 500);
  }
});

// Create a custom itinerary (requires authentication)
app.post('/make-server-a5c257ac/itineraries', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized. Please log in to create an itinerary.' }, 401);
    }
    
    const body = await c.req.json();
    const { market_id, title, description, duration, stops } = body;
    
    if (!market_id || !title || !description || !stops || stops.length === 0) {
      return c.json({ error: 'Market, title, description, and at least one stop are required' }, 400);
    }
    
    const itineraryId = crypto.randomUUID();
    const itinerary = {
      id: itineraryId,
      market_id,
      title,
      description,
      duration: duration || '',
      stops,
      created_by_user_id: user.id,
      created_by_name: user.user_metadata.name || user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`itinerary:${itineraryId}`, itinerary);
    
    return c.json({ itinerary }, 201);
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return c.json({ error: 'Failed to create itinerary' }, 500);
  }
});

// Update an itinerary (requires authentication and ownership)
app.put('/make-server-a5c257ac/itineraries/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const itineraryId = c.req.param('id');
    const itinerary = await kv.get(`itinerary:${itineraryId}`);
    
    if (!itinerary) {
      return c.json({ error: 'Itinerary not found' }, 404);
    }
    
    if (itinerary.created_by_user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only edit your own itineraries' }, 403);
    }
    
    const body = await c.req.json();
    const { title, description, duration, stops } = body;
    
    itinerary.title = title || itinerary.title;
    itinerary.description = description || itinerary.description;
    itinerary.duration = duration !== undefined ? duration : itinerary.duration;
    itinerary.stops = stops || itinerary.stops;
    itinerary.updated_at = new Date().toISOString();
    
    await kv.set(`itinerary:${itineraryId}`, itinerary);
    
    return c.json({ itinerary });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return c.json({ error: 'Failed to update itinerary' }, 500);
  }
});

// Delete an itinerary (requires authentication and ownership)
app.delete('/make-server-a5c257ac/itineraries/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const itineraryId = c.req.param('id');
    const itinerary = await kv.get(`itinerary:${itineraryId}`);
    
    if (!itinerary) {
      return c.json({ error: 'Itinerary not found' }, 404);
    }
    
    if (itinerary.created_by_user_id !== user.id) {
      return c.json({ error: 'Unauthorized: You can only delete your own itineraries' }, 403);
    }
    
    await kv.del(`itinerary:${itineraryId}`);
    
    return c.json({ success: true, message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return c.json({ error: 'Failed to delete itinerary' }, 500);
  }
});

// ============================================
// FAVORITES ROUTES
// ============================================

// Get user's favorites
app.get('/make-server-a5c257ac/favorites', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    let favorites = await kv.get(`favorites:${user.id}`);
    
    // Ensure favorites always has the correct structure
    if (!favorites || typeof favorites !== 'object') {
      favorites = { markets: [], vendors: [] };
    }
    
    if (!Array.isArray(favorites.markets)) {
      favorites.markets = [];
    }
    
    if (!Array.isArray(favorites.vendors)) {
      favorites.vendors = [];
    }
    
    console.log(`Fetching favorites for user ${user.id}:`, favorites);
    
    return c.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});

// Add to favorites
app.post('/make-server-a5c257ac/favorites', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const { type, target_id, target_name } = body;
    
    console.log(`Adding to favorites - User: ${user.id}, Type: ${type}, ID: ${target_id}, Name: ${target_name}`);
    
    if (!type || !target_id || !target_name) {
      return c.json({ error: 'Type, target_id, and target_name are required' }, 400);
    }
    
    if (type !== 'market' && type !== 'vendor') {
      return c.json({ error: 'Type must be "market" or "vendor"' }, 400);
    }
    
    let favorites = await kv.get(`favorites:${user.id}`);
    
    // Ensure favorites has the correct structure
    if (!favorites || typeof favorites !== 'object') {
      favorites = { markets: [], vendors: [] };
    }
    
    if (!Array.isArray(favorites.markets)) {
      favorites.markets = [];
    }
    
    if (!Array.isArray(favorites.vendors)) {
      favorites.vendors = [];
    }
    
    const favoriteItem = {
      id: target_id,
      name: target_name,
      added_at: new Date().toISOString(),
    };
    
    if (type === 'market') {
      // Check if already in favorites
      if (!favorites.markets.some((m: any) => m.id === target_id)) {
        favorites.markets.push(favoriteItem);
        console.log(`Added market to favorites. Total markets: ${favorites.markets.length}`);
      } else {
        console.log('Market already in favorites');
      }
    } else {
      // Check if already in favorites
      if (!favorites.vendors.some((v: any) => v.id === target_id)) {
        favorites.vendors.push(favoriteItem);
        console.log(`Added vendor to favorites. Total vendors: ${favorites.vendors.length}`);
      } else {
        console.log('Vendor already in favorites');
      }
    }
    
    await kv.set(`favorites:${user.id}`, favorites);
    console.log('Favorites saved successfully:', favorites);
    
    return c.json({ favorites });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return c.json({ error: 'Failed to add to favorites' }, 500);
  }
});

// Remove from favorites
app.delete('/make-server-a5c257ac/favorites/:type/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const type = c.req.param('type');
    const targetId = c.req.param('id');
    
    console.log(`Removing from favorites - User: ${user.id}, Type: ${type}, ID: ${targetId}`);
    
    if (type !== 'market' && type !== 'vendor') {
      return c.json({ error: 'Type must be "market" or "vendor"' }, 400);
    }
    
    let favorites = await kv.get(`favorites:${user.id}`);
    
    // Ensure favorites has the correct structure
    if (!favorites || typeof favorites !== 'object') {
      favorites = { markets: [], vendors: [] };
    }
    
    if (!Array.isArray(favorites.markets)) {
      favorites.markets = [];
    }
    
    if (!Array.isArray(favorites.vendors)) {
      favorites.vendors = [];
    }
    
    if (type === 'market') {
      const beforeLength = favorites.markets.length;
      favorites.markets = favorites.markets.filter((m: any) => m.id !== targetId);
      console.log(`Removed market. Before: ${beforeLength}, After: ${favorites.markets.length}`);
    } else {
      const beforeLength = favorites.vendors.length;
      favorites.vendors = favorites.vendors.filter((v: any) => v.id !== targetId);
      console.log(`Removed vendor. Before: ${beforeLength}, After: ${favorites.vendors.length}`);
    }
    
    await kv.set(`favorites:${user.id}`, favorites);
    console.log('Favorites saved after removal:', favorites);
    
    return c.json({ favorites });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return c.json({ error: 'Failed to remove from favorites' }, 500);
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile
app.get('/make-server-a5c257ac/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name || '',
      created_at: user.created_at,
    };
    
    return c.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put('/make-server-a5c257ac/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const { name, email, password } = body;
    
    const supabase = getSupabaseAdmin();
    
    const updates: any = {};
    
    if (name) {
      updates.user_metadata = { name };
    }
    
    if (email && email !== user.email) {
      updates.email = email;
    }
    
    if (password) {
      updates.password = password;
    }
    
    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, updates);
    
    if (error) {
      console.error('Profile update error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    const profile = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name || '',
      created_at: data.user.created_at,
    };
    
    return c.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Health check
app.get('/make-server-a5c257ac/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
