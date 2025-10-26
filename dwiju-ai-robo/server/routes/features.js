const express = require('express');
const Feature = require('../models/Feature');
const { requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// GET /api/features - Get all features with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      active = true,
      sortBy = 'id',
      sortOrder = 'asc' 
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (active !== 'all') query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const features = await Feature.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .populate('createdBy updatedBy', 'username email');

    const total = await Feature.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      features,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total,
        limit: parseInt(limit)
      },
      filters: {
        category,
        search,
        active
      }
    });

  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ error: 'Failed to retrieve features' });
  }
});

// GET /api/features/categories - Get all categories with feature counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Feature.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          features: { 
            $push: { 
              id: '$id',
              title: '$title',
              description: '$description'
            } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat._id] = {
        name: cat._id,
        count: cat.count,
        features: cat.features
      };
      return acc;
    }, {});

    res.json({
      success: true,
      categories: categoryMap,
      totalCategories: categories.length
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// GET /api/features/:id - Get specific feature by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findOne({ id: parseInt(id) })
      .populate('createdBy updatedBy', 'username email');

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json({
      success: true,
      feature
    });

  } catch (error) {
    console.error('Get feature error:', error);
    res.status(500).json({ error: 'Failed to retrieve feature' });
  }
});

// POST /api/features - Create new feature (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      tags = [], 
      priority = 0,
      metadata = {} 
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ 
        error: 'Title, description, and category are required' 
      });
    }

    // Get next available ID
    const nextId = await Feature.getNextId();

    const feature = new Feature({
      id: nextId,
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      priority,
      metadata,
      createdBy: req.user.userId,
      updatedBy: req.user.userId
    });

    await feature.save();

    res.status(201).json({
      success: true,
      message: 'Feature created successfully',
      feature
    });

  } catch (error) {
    console.error('Create feature error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Feature ID already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

// PUT /api/features/:id - Update feature (Admin/Moderator only)
router.put('/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    
    // Add update metadata
    updateData.updatedBy = req.user.userId;
    updateData.updatedAt = new Date();

    const feature = await Feature.findOneAndUpdate(
      { id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'username email');

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json({
      success: true,
      message: 'Feature updated successfully',
      feature
    });

  } catch (error) {
    console.error('Update feature error:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// DELETE /api/features/:id - Delete/deactivate feature (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    if (permanent === 'true') {
      // Permanent deletion
      const feature = await Feature.findOneAndDelete({ id: parseInt(id) });
      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }
      
      res.json({
        success: true,
        message: 'Feature permanently deleted'
      });
    } else {
      // Soft deletion (deactivation)
      const feature = await Feature.findOneAndUpdate(
        { id: parseInt(id) },
        { 
          isActive: false,
          updatedBy: req.user.userId,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      res.json({
        success: true,
        message: 'Feature deactivated successfully',
        feature
      });
    }

  } catch (error) {
    console.error('Delete feature error:', error);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});

// POST /api/features/bulk-import - Bulk import features (Admin only)
router.post('/bulk-import', requireAdmin, async (req, res) => {
  try {
    const { features, overwrite = false } = req.body;

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ error: 'Features array is required' });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (const featureData of features) {
      try {
        const { id, title, description, category, tags, priority, metadata } = featureData;

        if (!id || !title || !description || !category) {
          results.errors.push({
            feature: featureData,
            error: 'Missing required fields (id, title, description, category)'
          });
          continue;
        }

        // Check if feature exists
        const existingFeature = await Feature.findOne({ id: parseInt(id) });
        
        if (existingFeature && !overwrite) {
          results.skipped++;
          continue;
        }

        const featureObj = {
          id: parseInt(id),
          title,
          description,
          category,
          tags: Array.isArray(tags) ? tags : [],
          priority: priority || 0,
          metadata: metadata || {},
          createdBy: req.user.userId,
          updatedBy: req.user.userId
        };

        if (existingFeature && overwrite) {
          await Feature.findOneAndUpdate({ id: parseInt(id) }, featureObj);
        } else {
          const feature = new Feature(featureObj);
          await feature.save();
        }

        results.imported++;

      } catch (error) {
        results.errors.push({
          feature: featureData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed`,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import features' });
  }
});

module.exports = router;
