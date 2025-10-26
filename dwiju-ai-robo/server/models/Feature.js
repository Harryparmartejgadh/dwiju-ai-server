import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Ask Dwiju',
      'Dwiju Teacher',
      'Dwiju Doctor',
      'Dwiju Supreme Judge',
      'Dwiju Farmer',
      'Dwiju Business',
      'Dwiju Entertainment',
      'Dwiju Home',
      'Dwiju Travel',
      'Dwiju Security',
      'Dwiju Developer',
      'Dwiju Research',
      'Dwiju Social',
      'Dwiju Advanced'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
featureSchema.index({ id: 1 });
featureSchema.index({ category: 1 });
featureSchema.index({ tags: 1 });
featureSchema.index({ isActive: 1 });
featureSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamp
featureSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get next available ID
featureSchema.statics.getNextId = async function() {
  const lastFeature = await this.findOne().sort({ id: -1 });
  return lastFeature ? lastFeature.id + 1 : 1;
};

// Static method to get features by category
featureSchema.statics.getByCategory = function(category, includeInactive = false) {
  const query = { category };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ id: 1 });
};

// Virtual for feature URL slug
featureSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
});

export default mongoose.model('Feature', featureSchema);
